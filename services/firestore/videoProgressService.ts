import {
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  setDoc,
  limit,
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { VideoProgress } from "@/types/VideoProgress";
import { BaseService } from "./baseService";

class VideoProgressService extends BaseService<VideoProgress> {
  constructor() {
    super("videoProgress");
  }

  async getVideoProgress(
    userId: string,
    resourceId: string,
    videoId: string
  ): Promise<VideoProgress | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("userId", "==", userId),
        where("resourceId", "==", resourceId),
        where("videoId", "==", videoId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const docSnap = querySnapshot.docs[0];
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as VideoProgress;
    } catch (error) {
      console.error("[VideoProgress] Failed to fetch progress:", error);
      return null;
    }
  }

  async saveVideoProgress(
    userId: string,
    resourceId: string,
    playlistId: string | null,
    progress: {
      videoId: string;
      currentTime: number;
      duration: number;
      percentage: number;
      completed: boolean;
    }
  ): Promise<void> {
    try {
      // Use a consistent ID generation: userId_resourceId_videoId
      const docId = `${userId}_${resourceId}_${progress.videoId}`;
      const docRef = doc(db, this.collectionName, docId);

      const data: VideoProgress = {
        userId,
        resourceId,
        playlistId,
        videoId: progress.videoId,
        currentTime: progress.currentTime,
        duration: progress.duration,
        percentage: progress.percentage,
        completed: progress.completed,
        updatedAt: serverTimestamp(),
      };

      await setDoc(docRef, data, { merge: true });
      console.log(`[VideoProgress] saved: ${progress.videoId} at ${Math.round(progress.currentTime)}s`);
    } catch (error) {
      console.error("[VideoProgress] Failed to save progress:", error);
    }
  }

  async markVideoCompleted(
    userId: string,
    resourceId: string,
    videoId: string
  ): Promise<void> {
    const docId = `${userId}_${resourceId}_${videoId}`;
    const docRef = doc(db, this.collectionName, docId);

    await setDoc(
      docRef,
      {
        completed: true,
        percentage: 1,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`[VideoProgress] completed: ${videoId}`);
  }

  async getPlaylistProgress(
    userId: string,
    resourceId: string,
    playlistId: string
  ): Promise<VideoProgress[]> {
    return this.list([
      where("userId", "==", userId),
      where("resourceId", "==", resourceId),
      where("playlistId", "==", playlistId),
    ]);
  }
}

export const videoProgressService = new VideoProgressService();
