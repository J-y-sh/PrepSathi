"use client";

/// <reference types="youtube" />

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import YouTube, { YouTubeProps } from "react-youtube";
import type { YouTubePlayer as YouTubePlayerInstance } from "react-youtube";

import { useAuth } from "@/features/auth/AuthProvider";
import { videoProgressService } from "@/services/firestore/videoProgressService";

interface YouTubePlayerProps {
  url: string;
  title: string;
  resourceId: string;
}

interface PlaylistVideo {
  videoId: string;
  title: string;
  description: string;
  position: number;
  thumbnail: string;
}

interface PlaylistResponse {
  playlistId: string;
  videos: PlaylistVideo[];
  totalResults: number;
  truncated: boolean;
  pagesFetched: number;
}

type VideoProgress = {
  videoId: string;
  currentTime: number;
  duration: number;
  percentage: number;
  status: "not_started" | "in_progress" | "completed";
};

const SAVE_INTERVAL = 30000;
const COMPLETION_THRESHOLD = 0.9;
const SEEK_RETRY_DELAY = 300;
const MAX_SEEK_RETRIES = 8;

export default function YouTubePlayer({
  url,
  title,
  resourceId,
}: YouTubePlayerProps) {
  const { user } = useAuth();

  const [player, setPlayer] =
    useState<YouTubePlayerInstance | null>(null);

  const [playlist, setPlaylist] =
    useState<PlaylistVideo[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [loadingPlaylist, setLoadingPlaylist] =
    useState(false);

  const [playlistError, setPlaylistError] =
    useState("");

  const [progress, setProgress] =
    useState<VideoProgress | null>(null);

  const [resumingInfo, setResumingInfo] =
    useState<string | null>(null);

  /*
   * =========================================================
   * REFS
   * =========================================================
   */

  const playerRef =
    useRef<YouTubePlayerInstance | null>(null);

  const currentVideoIdRef =
    useRef<string | null>(null);

  const currentIndexRef =
    useRef<number>(0);

  const progressRef =
    useRef<VideoProgress | null>(null);

  const lastKnownProgressRef =
    useRef<VideoProgress | null>(null);

  const lastSavedProgressRef =
    useRef<{
      videoId: string;
      currentTime: number;
      timestamp: number;
    } | null>(null);

  const isResumingRef =
    useRef(false);

  const isSwitchingVideoRef =
    useRef(false);

  const resumeRequestIdRef =
    useRef(0);

  /*
   * =========================================================
   * PLAYLIST ID
   * =========================================================
   */

  const playlistId = useMemo(() => {
    try {
      const parsed = new URL(url);

      return parsed.searchParams.get("list");
    } catch {
      return null;
    }
  }, [url]);

  /*
   * =========================================================
   * SINGLE VIDEO ID
   * =========================================================
   */

  const videoId = useMemo(() => {
    try {
      const parsed = new URL(url);

      const id =
        parsed.searchParams.get("v");

      if (id) {
        return id;
      }

      if (
        parsed.hostname.includes("youtu.be")
      ) {
        const pathId =
          parsed.pathname
            .replace("/", "")
            .split("?")[0];

        return pathId || null;
      }

      if (
        parsed.hostname.includes("youtube.com") ||
        parsed.hostname.includes(
          "youtube-nocookie.com"
        )
      ) {
        const match =
          parsed.pathname.match(
            /\/embed\/([^/]+)/
          );

        if (match?.[1]) {
          return match[1];
        }
      }

      return null;
    } catch {
      return null;
    }
  }, [url]);

  /*
   * =========================================================
   * LOAD PLAYLIST
   * =========================================================
   */

  useEffect(() => {
    if (!playlistId) {
      return;
    }

    let cancelled = false;

    const loadPlaylist = async () => {
      try {
        setLoadingPlaylist(true);
        setPlaylistError("");

        console.log(
          "YouTubePlayer: loading playlist metadata:",
          playlistId
        );

        const response = await fetch(
          `/api/youtube/playlist?playlistId=${encodeURIComponent(
            playlistId
          )}`
        );

        const data: PlaylistResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            (
              data as unknown as {
                error?: string;
              }
            )?.error ||
              "Failed to load playlist."
          );
        }

        if (cancelled) {
          return;
        }

        setPlaylist(
          data.videos ?? []
        );

        console.log(
          "YouTubePlayer: playlist metadata loaded:",
          data.videos?.length ?? 0,
          "videos"
        );
      } catch (error) {
        console.error(
          "YouTubePlayer: failed to load playlist metadata:",
          error
        );

        if (!cancelled) {
          setPlaylistError(
            error instanceof Error
              ? error.message
              : "Unable to load playlist."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPlaylist(false);
        }
      }
    };

    void loadPlaylist();

    return () => {
      cancelled = true;
    };
  }, [playlistId]);

  /*
   * =========================================================
   * PLAYER OPTIONS
   * =========================================================
   */

  const opts: YouTubeProps["opts"] =
    useMemo(
      () => ({
        width: "100%",
        height: "100%",

        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,

          ...(playlistId
            ? {
                listType: "playlist" as const,
                list: playlistId,
              }
            : {}),
        },
      }),
      [playlistId]
    );

  /*
   * =========================================================
   * SAFE PLAYER CHECK
   * =========================================================
   */

  const isPlayerUsable = useCallback(
    (
      ytPlayer: YouTubePlayerInstance | null
    ) => {
      if (!ytPlayer) {
        return false;
      }

      try {
        const iframe =
          ytPlayer.getIframe?.();

        if (!iframe) {
          return false;
        }

        if (!iframe.isConnected) {
          return false;
        }

        return true;
      } catch {
        return false;
      }
    },
    []
  );

  /*
   * =========================================================
   * SAVE PROGRESS
   * =========================================================
   */

  const saveProgress = useCallback(
    async (
      progressToSave: VideoProgress,
      force = false
    ) => {
      if (!user || !resourceId) {
        return;
      }

      if (
        progressToSave.currentTime <= 0 &&
        progressToSave.status !==
          "completed" &&
        !force
      ) {
        return;
      }

      /*
       * Date.now() is intentionally inside the
       * callback execution and never during render.
       */
      const now = Date.now();

      const lastSaved =
        lastSavedProgressRef.current;

      const sameVideo =
        lastSaved?.videoId ===
        progressToSave.videoId;

      const enoughTimePassed =
        !lastSaved ||
        now -
            lastSaved.timestamp >=
          SAVE_INTERVAL;

      const completed =
        progressToSave.status ===
        "completed";

      const videoChanged =
        !sameVideo;

      if (
        !force &&
        !videoChanged &&
        !enoughTimePassed &&
        !completed
      ) {
        return;
      }

      lastSavedProgressRef.current = {
        videoId:
          progressToSave.videoId,

        currentTime:
          progressToSave.currentTime,

        timestamp: now,
      };

      try {
        await videoProgressService.saveVideoProgress(
          user.uid,
          resourceId,
          playlistId,
          {
            videoId:
              progressToSave.videoId,

            currentTime:
              progressToSave.currentTime,

            duration:
              progressToSave.duration,

            percentage:
              progressToSave.percentage,

            completed:
              progressToSave.status ===
              "completed",
          }
        );

        console.log(
          `[VideoProgress] saved: ${progressToSave.videoId} at ${Math.round(
            progressToSave.currentTime
          )}s`
        );
      } catch (error) {
        console.error(
          "[VideoProgress] save failed:",
          error
        );
      }
    },
    [
      user,
      resourceId,
      playlistId,
    ]
  );

  /*
   * =========================================================
   * READ PLAYER PROGRESS
   * =========================================================
   */

  const readPlayerProgress =
    useCallback(
      (
        ytPlayer: YouTubePlayerInstance
      ): VideoProgress | null => {
        if (
          !isPlayerUsable(
            ytPlayer
          )
        ) {
          return null;
        }

        try {
          const data =
            ytPlayer.getVideoData();

          const currentVideoId =
            data?.video_id;

          if (!currentVideoId) {
            return null;
          }

          const currentTime =
            ytPlayer.getCurrentTime();

          const duration =
            ytPlayer.getDuration();

          if (
            !Number.isFinite(
              duration
            ) ||
            duration <= 0
          ) {
            return null;
          }

          const safeCurrentTime =
            Math.max(
              0,
              Math.min(
                currentTime,
                duration
              )
            );

          const percentage =
            Math.min(
              safeCurrentTime /
                duration,
              1
            );

          let status:
            | "not_started"
            | "in_progress"
            | "completed";

          if (
            percentage >=
            COMPLETION_THRESHOLD
          ) {
            status = "completed";
          } else if (
            safeCurrentTime > 0
          ) {
            status = "in_progress";
          } else {
            status = "not_started";
          }

          return {
            videoId:
              currentVideoId,

            currentTime:
              safeCurrentTime,

            duration,

            percentage,

            status,
          };
        } catch {
          return null;
        }
      },
      [isPlayerUsable]
    );

  /*
   * =========================================================
   * UPDATE PROGRESS
   * =========================================================
   */

  const updateProgress =
    useCallback(
      (
        ytPlayer: YouTubePlayerInstance,
        persist = true
      ) => {
        const nextProgress =
          readPlayerProgress(
            ytPlayer
          );

        if (!nextProgress) {
          return null;
        }

        if (
          isSwitchingVideoRef.current &&
          nextProgress.currentTime <= 0
        ) {
          return nextProgress;
        }

        progressRef.current =
          nextProgress;

        lastKnownProgressRef.current =
          nextProgress;

        setProgress(
          nextProgress
        );

        if (persist) {
          void saveProgress(
            nextProgress
          );
        }

        console.log(
          "YouTubePlayer: progress:",
          {
            videoId:
              nextProgress.videoId,

            currentTime:
              Math.round(
                nextProgress.currentTime
              ),

            duration:
              Math.round(
                nextProgress.duration
              ),

            percentage:
              `${Math.round(
                nextProgress.percentage *
                  100
              )}%`,

            status:
              nextProgress.status,
          }
        );

        return nextProgress;
      },
      [
        readPlayerProgress,
        saveProgress,
      ]
    );

  /*
   * =========================================================
   * SAFE SEEK
   * =========================================================
   */

  const safeSeekTo =
    useCallback(
      async (
        ytPlayer: YouTubePlayerInstance,
        targetVideoId: string,
        time: number,
        requestId: number
      ): Promise<boolean> => {
        for (
          let attempt = 0;
          attempt <
          MAX_SEEK_RETRIES;
          attempt++
        ) {
          if (
            requestId !==
            resumeRequestIdRef.current
          ) {
            return false;
          }

          if (
            !isPlayerUsable(
              ytPlayer
            )
          ) {
            await new Promise(
              (resolve) =>
                window.setTimeout(
                  resolve,
                  SEEK_RETRY_DELAY
                )
            );

            continue;
          }

          try {
            const data =
              ytPlayer.getVideoData();

            const actualVideoId =
              data?.video_id;

            if (
              actualVideoId !==
              targetVideoId
            ) {
              await new Promise(
                (resolve) =>
                  window.setTimeout(
                    resolve,
                    SEEK_RETRY_DELAY
                  )
              );

              continue;
            }

            const duration =
              ytPlayer.getDuration();

            if (
              !Number.isFinite(
                duration
              ) ||
              duration <= 0
            ) {
              await new Promise(
                (resolve) =>
                  window.setTimeout(
                    resolve,
                    SEEK_RETRY_DELAY
                  )
              );

              continue;
            }

            const safeTime =
              Math.max(
                0,
                Math.min(
                  time,
                  duration - 1
                )
              );

            if (
              !isPlayerUsable(
                ytPlayer
              )
            ) {
              continue;
            }

            ytPlayer.seekTo(
              safeTime,
              true
            );

            console.log(
              `[VideoProgress] resumed: ${targetVideoId} at ${Math.round(
                safeTime
              )}s`
            );

            return true;
          } catch (error) {
            console.warn(
              `[VideoProgress] seek attempt ${
                attempt + 1
              } failed:`,
              error
            );

            await new Promise(
              (resolve) =>
                window.setTimeout(
                  resolve,
                  SEEK_RETRY_DELAY
                )
            );
          }
        }

        console.warn(
          `[VideoProgress] unable to seek ${targetVideoId} after ${MAX_SEEK_RETRIES} attempts`
        );

        return false;
      },
      [isPlayerUsable]
    );

  /*
   * =========================================================
   * RESUME PLAYBACK
   * =========================================================
   */

  const resumePlayback =
    useCallback(
      async (
        ytPlayer: YouTubePlayerInstance,
        vId: string
      ) => {
        if (
          !user ||
          !resourceId
        ) {
          return;
        }

        const requestId =
          ++resumeRequestIdRef.current;

        isResumingRef.current =
          true;

        try {
          console.log(
            `[VideoProgress] loading: ${vId}`
          );

          const savedProgress =
            await videoProgressService.getVideoProgress(
              user.uid,
              resourceId,
              vId
            );

          if (
            requestId !==
            resumeRequestIdRef.current
          ) {
            return;
          }

          if (
            !isPlayerUsable(
              ytPlayer
            )
          ) {
            return;
          }

          const actualVideoId =
            ytPlayer
              .getVideoData()
              ?.video_id;

          if (
            actualVideoId !==
            vId
          ) {
            return;
          }

          if (
            !savedProgress ||
            savedProgress.completed ||
            savedProgress.currentTime <=
              0
          ) {
            return;
          }

          const duration =
            ytPlayer.getDuration();

          if (
            !duration ||
            duration <= 0
          ) {
            return;
          }

          const time =
            savedProgress.currentTime;

          if (
            time >=
            duration - 5
          ) {
            return;
          }

          const success =
            await safeSeekTo(
              ytPlayer,
              vId,
              time,
              requestId
            );

          if (
            !success ||
            requestId !==
              resumeRequestIdRef.current
          ) {
            return;
          }

          const mins =
            Math.floor(
              time / 60
            );

          const secs =
            Math.floor(
              time % 60
            );

          setResumingInfo(
            `Resuming from ${mins}:${secs
              .toString()
              .padStart(2, "0")}`
          );

          window.setTimeout(
            () => {
              setResumingInfo(
                null
              );
            },
            3000
          );
        } catch (error) {
          console.error(
            "[VideoProgress] Resume failed:",
            error
          );
        } finally {
          if (
            requestId ===
            resumeRequestIdRef.current
          ) {
            isResumingRef.current =
              false;
          }
        }
      },
      [
        user,
        resourceId,
        isPlayerUsable,
        safeSeekTo,
      ]
    );

  /*
   * =========================================================
   * HANDLE VIDEO CHANGE
   * =========================================================
   */

  const handleVideoChange =
    useCallback(
      async (
        ytPlayer: YouTubePlayerInstance,
        newVideoId: string
      ) => {
        const previousVideoId =
          currentVideoIdRef.current;

        if (
          previousVideoId ===
          newVideoId
        ) {
          return;
        }

        isSwitchingVideoRef.current =
          true;

        resumeRequestIdRef.current++;

        /*
         * Save previous video before switching.
         */

        if (
          previousVideoId &&
          user &&
          resourceId
        ) {
          const previousProgress =
            lastKnownProgressRef.current;

          if (
            previousProgress &&
            previousProgress.videoId ===
              previousVideoId &&
            previousProgress.currentTime >
              0
          ) {
            await saveProgress(
              previousProgress,
              true
            );
          }
        }

        console.log(
          `[VideoProgress] video changed: ${previousVideoId} -> ${newVideoId}`
        );

        currentVideoIdRef.current =
          newVideoId;

        setProgress(null);

        progressRef.current =
          null;

        lastSavedProgressRef.current =
          null;

        await resumePlayback(
          ytPlayer,
          newVideoId
        );

        if (
          currentVideoIdRef.current !==
          newVideoId
        ) {
          return;
        }

        isSwitchingVideoRef.current =
          false;

        const refreshedProgress =
          readPlayerProgress(
            ytPlayer
          );

        if (
          refreshedProgress &&
          refreshedProgress.videoId ===
            newVideoId
        ) {
          progressRef.current =
            refreshedProgress;

          lastKnownProgressRef.current =
            refreshedProgress;

          setProgress(
            refreshedProgress
          );

          if (
            refreshedProgress.currentTime >
            0
          ) {
            await saveProgress(
              refreshedProgress,
              false
            );
          }
        }
      },
      [
        user,
        resourceId,
        saveProgress,
        resumePlayback,
        readPlayerProgress,
      ]
    );

  /*
   * =========================================================
   * PLAYER READY
   * =========================================================
   */

  const onReady:
    YouTubeProps["onReady"] =
    useCallback(
      async (event: Parameters<NonNullable<YouTubeProps["onReady"]>>[0]) => {
        const ytPlayer =
          event.target;

        console.log(
          "YouTubePlayer: player ready"
        );

        playerRef.current =
          ytPlayer;

        setPlayer(
          ytPlayer
        );

        await new Promise(
          (resolve) =>
            window.setTimeout(
              resolve,
              250
            )
        );

        if (
          !isPlayerUsable(
            ytPlayer
          )
        ) {
          return;
        }

        const vId =
          ytPlayer
            .getVideoData()
            ?.video_id;

        if (!vId) {
          return;
        }

        currentVideoIdRef.current =
          vId;

        if (playlistId) {
          try {
            const index =
              ytPlayer.getPlaylistIndex();

            if (
              typeof index ===
                "number" &&
              index >= 0
            ) {
              currentIndexRef.current =
                index;

              setCurrentIndex(
                index
              );
            }
          } catch {
            // Ignore transient playlist initialization errors.
          }
        }

        await resumePlayback(
          ytPlayer,
          vId
        );

        if (
          !isPlayerUsable(
            ytPlayer
          )
        ) {
          return;
        }

        const restoredProgress =
          readPlayerProgress(
            ytPlayer
          );

        if (
          restoredProgress
        ) {
          progressRef.current =
            restoredProgress;

          lastKnownProgressRef.current =
            restoredProgress;

          setProgress(
            restoredProgress
          );

          if (
            restoredProgress.currentTime >
            0
          ) {
            await saveProgress(
              restoredProgress,
              false
            );
          }
        }
      },
      [
        playlistId,
        isPlayerUsable,
        resumePlayback,
        readPlayerProgress,
        saveProgress,
      ]
    );

  /*
   * =========================================================
   * STATE CHANGE
   * =========================================================
   */

  const onStateChange:
    YouTubeProps["onStateChange"] =
    useCallback(
      async (event: Parameters<NonNullable<YouTubeProps["onStateChange"]>>[0]) => {
        const ytPlayer =
          event.target;

        const state =
          event.data;

        console.log(
          "YouTubePlayer: state changed:",
          state
        );

        let currentVideoId:
          | string
          | undefined;

        try {
          currentVideoId =
            ytPlayer
              .getVideoData()
              ?.video_id;
        } catch {
          currentVideoId =
            undefined;
        }

        console.log(
          "YouTubePlayer: current video:",
          currentVideoId
        );

        /*
         * Update playlist index.
         */

        if (playlistId) {
          try {
            const index =
              ytPlayer.getPlaylistIndex();

            if (
              typeof index ===
                "number" &&
              index >= 0
            ) {
              currentIndexRef.current =
                index;

              setCurrentIndex(
                index
              );
            }
          } catch {
            // Ignore transient transition state.
          }
        }

        /*
         * YouTube temporarily lost the video
         * during playlist transition.
         */

        if (!currentVideoId) {
          if (
            (state === 2 ||
              state === 0) &&
            lastKnownProgressRef.current
          ) {
            void saveProgress(
              lastKnownProgressRef.current,
              true
            );
          }

          return;
        }

        /*
         * Detect video change.
         */

        if (
          currentVideoIdRef.current !==
          currentVideoId
        ) {
          await handleVideoChange(
            ytPlayer,
            currentVideoId
          );
        }

        /*
         * Resume/switch protection.
         */

        if (
          isSwitchingVideoRef.current ||
          isResumingRef.current
        ) {
          return;
        }

        /*
         * PAUSED
         */

        if (state === 2) {
          const pausedProgress =
            updateProgress(
              ytPlayer,
              false
            );

          if (
            pausedProgress &&
            pausedProgress.currentTime >
              0
          ) {
            await saveProgress(
              pausedProgress,
              true
            );
          }

          return;
        }

        /*
         * ENDED
         */

        if (state === 0) {
          const endedProgress =
            readPlayerProgress(
              ytPlayer
            );

          if (endedProgress) {
            const completedProgress: VideoProgress =
              {
                ...endedProgress,

                currentTime:
                  endedProgress.duration,

                percentage: 1,

                status:
                  "completed",
              };

            progressRef.current =
              completedProgress;

            lastKnownProgressRef.current =
              completedProgress;

            setProgress(
              completedProgress
            );

            await saveProgress(
              completedProgress,
              true
            );
          }

          return;
        }

        /*
         * PLAYING / BUFFERING / CUED
         */

        updateProgress(
          ytPlayer,
          true
        );
      },
      [
        playlistId,
        saveProgress,
        handleVideoChange,
        updateProgress,
        readPlayerProgress,
      ]
    );

  /*
   * =========================================================
   * POLL PLAYBACK POSITION
   * =========================================================
   */

  useEffect(() => {
    if (!player) {
      return;
    }

    const interval =
      window.setInterval(() => {
        if (
          isSwitchingVideoRef.current ||
          isResumingRef.current
        ) {
          return;
        }

        if (
          !isPlayerUsable(
            player
          )
        ) {
          return;
        }

        updateProgress(
          player,
          true
        );
      }, 5000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    player,
    isPlayerUsable,
    updateProgress,
  ]);

  /*
   * =========================================================
   * SAVE ON UNMOUNT / RESOURCE CHANGE
   * =========================================================
   */

  useEffect(() => {
    const currentResumeRequestId =
      resumeRequestIdRef.current;

    return () => {
      const lastProgress =
        lastKnownProgressRef.current;

      if (
        lastProgress &&
        lastProgress.currentTime >
          0 &&
        user &&
        resourceId
      ) {
        void saveProgress(
          lastProgress,
          true
        );
      }

      playerRef.current =
        null;

      if (
        resumeRequestIdRef.current ===
        currentResumeRequestId
      ) {
        resumeRequestIdRef.current++;
      }
    };
  }, [
    user,
    resourceId,
    saveProgress,
  ]);

  /*
   * =========================================================
   * PLAY SPECIFIC PLAYLIST VIDEO
   * =========================================================
   */

  const playVideoAt =
    useCallback(
      async (index: number) => {
        const ytPlayer =
          playerRef.current;

        if (
          !ytPlayer ||
          !playlistId
        ) {
          return;
        }

        if (
          index ===
          currentIndexRef.current
        ) {
          return;
        }

        if (
          !isPlayerUsable(
            ytPlayer
          )
        ) {
          return;
        }

        console.log(
          "YouTubePlayer: switching to index:",
          index
        );

        /*
         * Save current video BEFORE switching.
         */

        const currentProgress =
          lastKnownProgressRef.current;

        if (
          currentProgress &&
          currentProgress.currentTime >
            0 &&
          user &&
          resourceId
        ) {
          await saveProgress(
            currentProgress,
            true
          );
        }

        /*
         * Enter transition mode.
         */

        isSwitchingVideoRef.current =
          true;

        resumeRequestIdRef.current++;

        currentIndexRef.current =
          index;

        setCurrentIndex(
          index
        );

        /*
         * Protect playVideoAt().
         */

        try {
          ytPlayer.playVideoAt(
            index
          );
        } catch (error) {
          console.error(
            "YouTubePlayer: failed to switch playlist video:",
            error
          );

          isSwitchingVideoRef.current =
            false;
        }
      },
      [
        playlistId,
        user,
        resourceId,
        isPlayerUsable,
        saveProgress,
      ]
    );

  /*
   * =========================================================
   * SINGLE VIDEO
   * =========================================================
   */

  if (!playlistId) {
    return (
      <div className="w-full h-full">
        <YouTube
          videoId={
            videoId ?? undefined
          }
          title={title}
          opts={opts}
          onReady={onReady}
          onStateChange={
            onStateChange
          }
          className="w-full h-full"
          iframeClassName="w-full h-full border-0"
        />
      </div>
    );
  }

  /*
   * =========================================================
   * PLAYLIST
   * =========================================================
   */

  return (
    <div className="w-full h-full flex flex-col lg:flex-row">
      {/* VIDEO PLAYER */}

      <div className="w-full lg:flex-1 min-h-0 aspect-video lg:aspect-auto bg-black relative">
        {resumingInfo && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 animate-in fade-in zoom-in duration-300">
            <p className="text-xs font-medium text-amber-400">
              {resumingInfo}
            </p>
          </div>
        )}

        <YouTube
          videoId={undefined}
          title={title}
          opts={opts}
          onReady={onReady}
          onStateChange={
            onStateChange
          }
          className="w-full h-full"
          iframeClassName="w-full h-full border-0"
        />
      </div>

      {/* PLAYLIST */}

      <aside className="w-full lg:w-80 xl:w-96 shrink-0 bg-[#0B1120] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col min-h-0">
        {/* HEADER */}

        <div className="px-4 py-4 border-b border-white/10 shrink-0">
          <p className="text-sm font-bold text-white">
            Playlist
          </p>

          <p className="text-xs text-white/40 mt-1">
            {loadingPlaylist
              ? "Loading videos..."
              : `${playlist.length} videos`}
          </p>
        </div>

        {/* CURRENT PROGRESS */}

        {progress && (
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">
                Current progress
              </span>

              <span
                className={`text-xs font-semibold ${
                  progress.status ===
                  "completed"
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {Math.round(
                  progress.percentage *
                    100
                )}
                %
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  progress.status ===
                  "completed"
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
                style={{
                  width: `${Math.min(
                    progress.percentage *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>

            <p className="text-[10px] text-white/30 mt-2 capitalize">
              {progress.status.replace(
                "_",
                " "
              )}
            </p>
          </div>
        )}

        {/* ERROR */}

        {playlistError && (
          <div className="px-4 py-3 border-b border-red-500/10 bg-red-500/5">
            <p className="text-xs text-red-400">
              {playlistError}
            </p>
          </div>
        )}

        {/* VIDEO LIST */}

        <div className="flex-1 overflow-y-auto">
          {playlist.length === 0 &&
            loadingPlaylist && (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-white/30">
                  Loading playlist...
                </p>
              </div>
            )}

          {playlist.map(
            (video, index) => {
              const active =
                index ===
                currentIndex;

              return (
                <button
                  key={`${video.videoId}-${index}`}
                  onClick={() =>
                    void playVideoAt(
                      index
                    )
                  }
                  className={`w-full text-left px-3 py-3 flex gap-3 border-b border-white/5 transition-colors ${
                    active
                      ? "bg-amber-500/10"
                      : "hover:bg-white/5"
                  }`}
                >
                  {/* THUMBNAIL */}

                  <div className="relative w-24 h-14 shrink-0 rounded-lg overflow-hidden bg-white/5">
                    {video.thumbnail ? (
                      <Image
                        src={
                          video.thumbnail
                        }
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                        No image
                      </div>
                    )}

                    {active && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-amber-400 text-sm">
                          ▶
                        </span>
                      </div>
                    )}
                  </div>

                  {/* INFO */}

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs leading-5 line-clamp-2 ${
                        active
                          ? "text-amber-400 font-semibold"
                          : "text-white/70"
                      }`}
                    >
                      {video.title}
                    </p>

                    <p className="text-[10px] text-white/25 mt-1">
                      Video {index + 1}
                    </p>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </aside>
    </div>
  );
}