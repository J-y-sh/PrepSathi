export interface PlaylistProgress {
  resourceId: string;
  playlistId: string;
  totalVideos: number;
  completedVideos: number;
  percentage: number;
  lastWatchedVideoId: string | null;
}