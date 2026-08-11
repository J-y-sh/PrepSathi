import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "@/firebase/firebase";

export type SyllabusProgressStatus =
  | "not-started"
  | "learning"
  | "revising"
  | "completed";

export interface SyllabusProgress {
  userId: string;
  topicId: string;
  status: SyllabusProgressStatus;
  updatedAt?: unknown;
}

const collectionName = "syllabusProgress";

export const syllabusProgressService = {
  async listByUser(userId: string): Promise<SyllabusProgress[]> {
    const ref = collection(db, "users", userId, collectionName);
    const snapshot = await getDocs(ref);

    return snapshot.docs.map((item) => ({
      ...(item.data() as SyllabusProgress),
      topicId: item.id,
    }));
  },

  async setStatus(
    userId: string,
    topicId: string,
    status: SyllabusProgressStatus
  ): Promise<void> {
    const ref = doc(
      db,
      "users",
      userId,
      collectionName,
      topicId
    );

    await setDoc(
      ref,
      {
        userId,
        topicId,
        status,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  },
};