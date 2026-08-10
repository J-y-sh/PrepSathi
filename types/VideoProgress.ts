import { FieldValue } from "firebase/firestore";

export interface VideoProgress {
  id?: string;
  userId: string;
  resourceId: string;
  playlistId: string | null;
  videoId: string;
  currentTime: number;
  duration: number;
  percentage: number;
  completed: boolean;
  updatedAt: FieldValue;
}
