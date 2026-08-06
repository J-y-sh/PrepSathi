import { where, serverTimestamp } from "firebase/firestore";
import { Flashcard } from "@/types/Flashcard";
import { BaseService } from "./baseService";

class FlashcardService extends BaseService<Flashcard> {
  constructor() {
    super("flashcards");
  }

  async listByUser(userId: string): Promise<Flashcard[]> {
    return this.list([where("userId", "==", userId)]);
  }

  async createWithTimestamp(id: string, data: Omit<Flashcard, "id" | "createdAt">): Promise<void> {
    await this.create(id, {
      ...data,
      createdAt: serverTimestamp(),
    } as any);
  }
}

export const flashcardService = new FlashcardService();
