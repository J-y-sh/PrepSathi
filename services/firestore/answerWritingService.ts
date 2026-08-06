import { where, serverTimestamp } from "firebase/firestore";
import { Answer } from "@/types/Answer";
import { BaseService } from "./baseService";

class AnswerWritingService extends BaseService<Answer> {
  constructor() {
    super("answers");
  }

  async listByUser(userId: string): Promise<Answer[]> {
    return this.list([where("userId", "==", userId)]);
  }

  async createWithTimestamp(id: string, data: Omit<Answer, "id" | "createdAt">): Promise<void> {
    await this.create(id, {
      ...data,
      createdAt: serverTimestamp(),
    } as any);
  }
}

export const answerWritingService = new AnswerWritingService();
