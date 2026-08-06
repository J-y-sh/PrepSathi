import { serverTimestamp } from "firebase/firestore";
import { Library } from "@/types/Library";
import { BaseService } from "./baseService";

class LibraryService extends BaseService<Library> {
  constructor() {
    super("library");
  }

  async createWithTimestamp(id: string, data: Omit<Library, "id" | "createdAt">): Promise<void> {
    await this.create(id, {
      ...data,
      createdAt: serverTimestamp(),
    } as any);
  }
}

export const libraryService = new LibraryService();
