import {
  where,
  orderBy,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

import { Analytics } from "@/types/Analytics";
import { StudySession } from "@/types/StudySession";
import { BaseService } from "./baseService";
import { db } from "@/firebase/firebase";

class AnalyticsService
  extends BaseService<Analytics> {
  constructor() {
    super("analytics");
  }

  /*
   * =======================================================
   * RECORD STUDY SESSION
   * =======================================================
   */

  async recordStudySession(
    userId: string,
    date: string,
    studyMinutes: number
  ): Promise<void> {
    const docId = `${userId}_${date}`;
    const docRef = doc(
      db,
      this.collectionName,
      docId
    );

    /*
     * UPSERT PATTERN
     *
     * We use setDoc with merge: true to avoid a getDoc() read.
     * This bypasses the permission error when the document
     * does not yet exist (as our read rules depend on
     * resource.data).
     *
     * We use increment(0) to initialize fields to 0 if the
     * document is new, while preserving their existing
     * values if the document already exists.
     *
     * Note: createdAt will be updated to the latest
     * activity time because Firestore setDoc(merge: true)
     * cannot conditionally ignore a non-numeric field
     * without a prior read.
     */

    await setDoc(
      docRef,
      {
        userId,
        date,
        studyMinutes: increment(studyMinutes),
        tasksCompleted: increment(0),
        xpGained: increment(0),
        createdAt: serverTimestamp(),
      },
      {
        merge: true,
      }
    );
  }

  /*
   * =======================================================
   * LIST DAILY ANALYTICS
   * =======================================================
   */

  async listByUser(
    userId: string
  ): Promise<Analytics[]> {
    return this.list([
      where(
        "userId",
        "==",
        userId
      ),
      orderBy(
        "date",
        "desc"
      ),
    ]);
  }

  /*
   * =======================================================
   * CALCULATE ANALYTICS FROM STUDY SESSIONS
   * =======================================================
   *
   * Study sessions are the source of truth.
   *
   * This method converts completed study sessions into
   * daily analytics records.
   */

  calculateFromSessions(
    sessions: StudySession[]
  ): Analytics[] {
    const dailyMap =
      new Map<
        string,
        Analytics
      >();

    for (const session of sessions) {
      if (!session.completed) {
        continue;
      }

      const createdAt =
        session.createdAt;

      let date: string;

      /*
       * Firestore Timestamp
       */

      if (
        createdAt &&
        typeof createdAt ===
          "object" &&
        "toDate" in createdAt
      ) {
        date =
          createdAt
            .toDate()
            .toISOString()
            .split("T")[0];
      } else {
        /*
         * Fallback for unexpected data.
         */

        continue;
      }

      const existing =
        dailyMap.get(date);

      if (existing) {
        existing.studyMinutes +=
          session.durationMinutes ?? 0;
      } else {
        dailyMap.set(
          date,
          {
            id: `${session.userId}_${date}`,
            userId:
              session.userId,
            date,
            studyMinutes:
              session.durationMinutes ?? 0,
            tasksCompleted: 0,
            xpGained: 0,
            createdAt:
              session.createdAt,
          }
        );
      }
    }

    return Array.from(
      dailyMap.values()
    ).sort(
      (a, b) =>
        b.date.localeCompare(
          a.date
        )
    );
  }
}

export const analyticsService =
  new AnalyticsService();