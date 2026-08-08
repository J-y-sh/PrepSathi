"use client";

import { useEffect, useMemo, useState } from "react";
import YouTube, { YouTubeProps } from "react-youtube";

interface YouTubePlayerProps {
  url: string;
  title: string;
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

export default function YouTubePlayer({
  url,
  title,
}: YouTubePlayerProps) {
  const [player, setPlayer] =
    useState<YT.Player | null>(null);

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

  /*
   * PLAYLIST ID
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
   * SINGLE VIDEO ID
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
   * LOAD PLAYLIST METADATA
   */

  useEffect(() => {
    if (!playlistId) {
      setPlaylist([]);
      setPlaylistError("");
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

        const response =
          await fetch(
            `/api/youtube/playlist?playlistId=${encodeURIComponent(
              playlistId
            )}`
          );

        const data: PlaylistResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            (data as unknown as {
              error?: string;
            })?.error ||
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

    loadPlaylist();

    return () => {
      cancelled = true;
    };
  }, [playlistId]);

  /*
   * PLAYER OPTIONS
   */

  const opts: YouTubeProps["opts"] = {
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
            listType: "playlist",
            list: playlistId,
          }
        : {}),
    },
  };

  /*
   * UPDATE LOCAL PROGRESS
   */

  const updateProgress = (
    ytPlayer: YT.Player
  ) => {
    try {
      const currentVideoId =
        ytPlayer
          .getVideoData()
          ?.video_id;

      if (!currentVideoId) {
        return;
      }

      const currentTime =
        ytPlayer.getCurrentTime();

      const duration =
        ytPlayer.getDuration();

      if (
        !duration ||
        duration <= 0
      ) {
        return;
      }

      const percentage =
        Math.min(
          currentTime / duration,
          1
        );

      let status:
        | "not_started"
        | "in_progress"
        | "completed";

      if (percentage >= 0.9) {
        status = "completed";
      } else if (currentTime > 0) {
        status = "in_progress";
      } else {
        status = "not_started";
      }

      const nextProgress: VideoProgress =
        {
          videoId:
            currentVideoId,

          currentTime,

          duration,

          percentage,

          status,
        };

      setProgress(nextProgress);

      console.log(
        "YouTubePlayer: progress:",
        {
          videoId:
            currentVideoId,

          currentTime:
            Math.round(
              currentTime
            ),

          duration:
            Math.round(
              duration
            ),

          percentage:
            `${Math.round(
              percentage * 100
            )}%`,

          status,
        }
      );
    } catch (error) {
      console.error(
        "YouTubePlayer: failed to read progress:",
        error
      );
    }
  };

  /*
   * PLAYER READY
   */

  const onReady: YouTubeProps["onReady"] = (
    event
  ) => {
    console.log(
      "YouTubePlayer: player ready"
    );

    setPlayer(event.target);

    if (playlistId) {
      const index =
        event.target.getPlaylistIndex();

      if (
        typeof index === "number"
      ) {
        setCurrentIndex(index);
      }
    }

    updateProgress(
      event.target
    );
  };

  /*
   * STATE CHANGE
   */

  const onStateChange: YouTubeProps["onStateChange"] = (
    event
  ) => {
    const ytPlayer =
      event.target;

    if (playlistId) {
      const index =
        ytPlayer.getPlaylistIndex();

      if (
        typeof index === "number"
      ) {
        setCurrentIndex(index);
      }
    }

    const currentVideo =
      ytPlayer
        .getVideoData()
        ?.video_id;

    console.log(
      "YouTubePlayer: state changed:",
      event.data
    );

    console.log(
      "YouTubePlayer: current video:",
      currentVideo
    );

    updateProgress(
      ytPlayer
    );
  };

  /*
   * POLL PLAYBACK POSITION
   */

  useEffect(() => {
    if (!player) {
      return;
    }

    const interval =
      window.setInterval(() => {
        updateProgress(player);
      }, 5000);

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [player]);

  /*
   * PLAY SPECIFIC PLAYLIST VIDEO
   */

  const playVideoAt = (
    index: number
  ) => {
    if (!player) {
      return;
    }

    console.log(
      "YouTubePlayer: switching to index:",
      index
    );

    player.playVideoAt(index);

    setCurrentIndex(index);
  };

  /*
   * SINGLE VIDEO
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
          onStateChange={onStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full border-0"
        />
      </div>
    );
  }

  /*
   * PLAYLIST
   */

  return (
    <div className="w-full h-full flex flex-col lg:flex-row">

      {/* VIDEO PLAYER */}

      <div className="w-full lg:flex-1 min-h-0 aspect-video lg:aspect-auto bg-black">
        <YouTube
          videoId={undefined}
          title={title}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
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
                index === currentIndex;

              return (
                <button
                  key={`${video.videoId}-${index}`}
                  onClick={() =>
                    playVideoAt(index)
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
                      <img
                        src={
                          video.thumbnail
                        }
                        alt=""
                        className="w-full h-full object-cover"
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