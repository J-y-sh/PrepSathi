import {
  serverTimestamp,
  where,
  orderBy,
  query,
  collection,
  getDocs,
  limit,
} from "firebase/firestore";

import { LibraryResource } from "@/types/Library";
import { BaseService } from "./baseService";
import { db } from "@/firebase/firebase";
import { uploadToCloudinary } from "@/lib/cloudinary";

class LibraryService extends BaseService<LibraryResource> {
  constructor() {
    super("library");
  }

  async uploadPDF(userId: string, file: File): Promise<string> {
    return await uploadToCloudinary(file);
  }

  async listByUser(userId: string): Promise<LibraryResource[]> {
    console.log("listByUser() called");
    console.log("Searching for user:", userId);

    const data = await this.list([
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ]);

    console.log("Firestore returned:", data);

    return data;
  }

  async getRecent(
    userId: string,
    count = 5
  ): Promise<LibraryResource[]> {
    const colRef = collection(db, this.collectionName);

    const q = query(
      colRef,
      where("userId", "==", userId),
      orderBy("lastOpenedAt", "desc"),
      limit(count)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as LibraryResource)
    );
  }

  async toggleFavorite(
    id: string,
    currentStatus: boolean
  ): Promise<void> {
    await this.update(id, {
      isFavorite: !currentStatus,
    } as any);
  }

  async markAsOpened(id: string): Promise<void> {
    await this.update(id, {
      lastOpenedAt: serverTimestamp(),
    } as any);
  }
}

export const libraryService = new LibraryService();