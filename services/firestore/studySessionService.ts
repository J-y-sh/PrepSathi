import {
  serverTimestamp,
  where,
  orderBy,
} from "firebase/firestore";

import { auth } from "@/firebase/firebase";

import { BaseService } from "./baseService";
import { StudySession } from "@/types/StudySession";

class StudySessionService
  extends BaseService<StudySession> {

  constructor() {
    super("studySessions");
  }

  // =========================================================
  // START SESSION
  // =========================================================

  async startSession(
    id: string,
    session: Omit<
      StudySession,
      "id" | "createdAt" | "startedAt"
    >
  ): Promise<void> {
    console.log(
      "StudySessionService: creating session:",
      id
    );

    await this.create(id, {
      ...session,
      startedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });

    console.log(
      "StudySessionService: session created:",
      id
    );
  }

  // =========================================================
  // FINISH SESSION
  // =========================================================

  async finishSession(
    id: string,
    durationMinutes: number,
    progress: number,
    completed: boolean
  ): Promise<void> {
    console.log(
      "========== FINISH FIRESTORE DEBUG =========="
    );

    console.log(
      "Firebase project:",
      auth.app.options.projectId
    );

    console.log(
      "Firebase UID:",
      auth.currentUser?.uid
    );

    console.log(
      "Session ID:",
      id
    );

    console.log(
      "Duration:",
      durationMinutes
    );

    console.log(
      "Progress:",
      progress
    );

    console.log(
      "Completed:",
      completed
    );

    console.log(
      "============================================"
    );

    await this.update(id, {
      endedAt: serverTimestamp(),
      durationMinutes,
      progress,
      completed,
    });

    console.log(
      "StudySessionService: Firestore update SUCCESS"
    );
  }

  // =========================================================
  // UPDATE PROGRESS
  // =========================================================

  async updateProgress(
    id: string,
    progress: number
  ): Promise<void> {
    await this.update(id, {
      progress,
    });
  }

  // =========================================================
  // LIST BY USER
  // =========================================================

  async listByUser(
    userId: string
  ): Promise<StudySession[]> {
    return this.list([
      where(
        "userId",
        "==",
        userId
      ),
      orderBy(
        "createdAt",
        "desc"
      ),
    ]);
  }
}

export const studySessionService =
  new StudySessionService();