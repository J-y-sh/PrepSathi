import {
  serverTimestamp,
  where,
  orderBy,
} from "firebase/firestore";

import { BaseService } from "./baseService";
import { StudySession } from "@/types/StudySession";

class StudySessionService extends BaseService<StudySession> {
  constructor() {
    super("studySessions");
  }

  async startSession(
    id: string,
    session: Omit<StudySession, "id">
  ): Promise<void> {
    await this.create(id, session);
  }

  async finishSession(
    id: string,
    durationMinutes: number,
    progress: number,
    completed: boolean
  ): Promise<void> {
    await this.update(id, {
      endedAt: serverTimestamp(),
      durationMinutes,
      progress,
      completed,
    });
  }

  async updateProgress(
    id: string,
    progress: number
  ): Promise<void> {
    await this.update(id, {
      progress,
    });
  }

  async listByUser(userId: string): Promise<StudySession[]> {
    return this.list([
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ]);
  }
}

export const studySessionService = new StudySessionService();