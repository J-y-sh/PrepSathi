import { videoProgressService } from "./videoProgressService";
import { PlaylistProgress } from "@/types/PlaylistProgress";

class PlaylistProgressService {
  async getPlaylistProgress(
    userId: string,
    resourceId: string,
    playlistId: string,
    totalVideos: number
  ): Promise<PlaylistProgress> {
    try {
      const progressRecords =
        await videoProgressService.getPlaylistProgress(
          userId,
          resourceId,
          playlistId
        );

      const completedVideos =
        progressRecords.filter(
          (video) => video.completed
        ).length;

      const percentage =
        totalVideos > 0
          ? Math.round(
              (completedVideos / totalVideos) * 100
            )
          : 0;

      const lastWatchedVideoId =
        progressRecords.length > 0
          ? progressRecords[
              progressRecords.length - 1
            ].videoId
          : null;

      return {
        resourceId,
        playlistId,
        totalVideos,
        completedVideos,
        percentage,
        lastWatchedVideoId,
      };
    } catch (error) {
      console.error(
        "[PlaylistProgress] Failed to calculate playlist progress:",
        error
      );

      return {
        resourceId,
        playlistId,
        totalVideos,
        completedVideos: 0,
        percentage: 0,
        lastWatchedVideoId: null,
      };
    }
  }
}

export const playlistProgressService =
  new PlaylistProgressService();