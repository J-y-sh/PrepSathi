import { create } from "zustand";
import { serverTimestamp } from "firebase/firestore";

import { StudySession } from "@/types/StudySession";
import { studySessionService } from "@/services/firestore/studySessionService";
import { analyticsService } from "@/services/firestore/analyticsService";

interface StudySessionState {
  currentSession: StudySession | null;
  isStudying: boolean;
  elapsedSeconds: number;
  progress: number;
  loading: boolean;

  startSession: (
    session: Omit<
      StudySession,
      "id" | "startedAt" | "createdAt"
    >
  ) => Promise<void>;

  finishSession: () => Promise<void>;

  updateProgress: (progress: number) => Promise<void>;

  tick: () => void;

  reset: () => void;
}

/*
 * =========================================================
 * TIMER
 * =========================================================
 *
 * Keep the timer outside Zustand state.
 *
 * The interval itself does not need to be stored inside
 * Zustand because only elapsedSeconds needs to trigger
 * React updates.
 */

let sessionTimer: ReturnType<typeof setInterval> | null =
  null;

/*
 * =========================================================
 * STOP TIMER
 * =========================================================
 */

const stopSessionTimer = () => {
  if (sessionTimer !== null) {
    clearInterval(sessionTimer);
    sessionTimer = null;
  }
};

/*
 * =========================================================
 * START TIMER
 * =========================================================
 */

const startSessionTimer = (
  tick: () => void
) => {
  stopSessionTimer();

  sessionTimer = setInterval(() => {
    tick();
  }, 1000);
};

/*
 * =========================================================
 * STORE
 * =========================================================
 */

export const useStudySessionStore =
  create<StudySessionState>((set, get) => ({
    currentSession: null,

    isStudying: false,

    elapsedSeconds: 0,

    progress: 0,

    loading: false,

    /*
     * =====================================================
     * START SESSION
     * =====================================================
     */

    startSession: async (data) => {
      /*
       * Prevent accidentally creating multiple active
       * sessions for the same browser session.
       */

      const existingSession =
        get().currentSession;

      if (existingSession) {
        console.log(
          "StudySession: active session already exists:",
          existingSession.id
        );

        return;
      }

      set({
        loading: true,
      });

      try {
        const id = crypto.randomUUID();

        const session: StudySession = {
          id,
          ...data,

          startedAt:
            serverTimestamp(),

          createdAt:
            serverTimestamp(),

          durationMinutes: 0,
        };

        console.log(
          "StudySession: starting:",
          session.resourceTitle
        );

        await studySessionService.startSession(
          id,
          {
            ...session,
          }
        );

        /*
         * Reset previous timer completely.
         */

        stopSessionTimer();

        /*
         * Update local state.
         */

        set({
          currentSession: session,
          isStudying: true,
          elapsedSeconds: 0,
          progress: data.progress ?? 0,
          loading: false,
        });

        /*
         * Start one-second timer.
         */

        startSessionTimer(
          get().tick
        );

        console.log(
          "StudySession: started:",
          id
        );
      } catch (error) {
        console.error(
          "StudySession: failed to start:",
          error
        );

        set({
          loading: false,
        });

        throw error;
      }
    },

    /*
     * =====================================================
     * FINISH SESSION
     * =====================================================
     */

    finishSession: async () => {
      const state = get();

      if (!state.currentSession || state.loading) {
        console.warn(
          "StudySession: finishSession ignored (no session or already loading)."
        );

        return;
      }

      /*
       * DEBUG
       */

      console.log(
        "========== STORE FINISH DEBUG =========="
      );

      console.log(
        "Session:",
        state.currentSession
      );

      console.log(
        "Session ID:",
        state.currentSession.id
      );

      console.log(
        "Session userId:",
        state.currentSession.userId
      );

      console.log(
        "Elapsed seconds:",
        state.elapsedSeconds
      );

      console.log(
        "Progress:",
        state.progress
      );

      console.log(
        "========================================"
      );

      /*
       * Stop timer FIRST.
       *
       * This prevents elapsedSeconds from changing while
       * the Firestore update is being performed.
       */

      stopSessionTimer();

      set({
        loading: true,
      });

      try {
        const minutes =
          Math.floor(
            state.elapsedSeconds / 60
          );

        /*
         * If the user studied for less than one minute,
         * store 1 minute instead of losing the session.
         */

        const durationMinutes =
          state.elapsedSeconds > 0
            ? Math.max(1, minutes)
            : 0;

        console.log(
          "StudySession: finishing with:",
          {
            id:
              state.currentSession.id,

            durationMinutes,

            progress:
              state.progress,

            completed: true,
          }
        );

        /*
         * FIRESTORE UPDATE
         */

        await studySessionService.finishSession(
          state.currentSession.id,
          durationMinutes,
          state.progress,
          true
        );

        console.log(
          "StudySession: finished successfully"
        );

        /*
         * ===================================================
         * ANALYTICS INTEGRATION
         * ===================================================
         *
         * Record the study minutes in the daily analytics.
         *
         * Analytics failure should NOT prevent the session
         * from being cleared locally.
         */

        try {
          const date = new Date()
            .toISOString()
            .split("T")[0];

          await analyticsService.recordStudySession(
            state.currentSession.userId,
            date,
            durationMinutes
          );

          console.log(
            "Analytics: study session recorded"
          );
        } catch (analyticsError) {
          console.error(
            "Analytics: failed to record study session",
            analyticsError
          );
        }

        /*
         * Clear local session state only AFTER
         * Firestore successfully updates.
         */

        set({
          currentSession: null,
          isStudying: false,
          elapsedSeconds: 0,
          progress: 0,
          loading: false,
        });
      } catch (error) {
        console.error(
          "StudySession: failed to finish:",
          error
        );

        /*
         * Firestore update failed.
         *
         * Keep the session locally active and restart
         * the timer so the user's session is not lost.
         */

        startSessionTimer(
          get().tick
        );

        set({
          loading: false,
        });

        throw error;
      }
    },

    /*
     * =====================================================
     * UPDATE PROGRESS
     * =====================================================
     */

    updateProgress: async (
      progress
    ) => {
      const state = get();

      if (!state.currentSession) {
        return;
      }

      /*
       * Keep progress inside safe range.
       */

      const safeProgress =
        Math.max(
          0,
          Math.min(
            progress,
            100
          )
        );

      try {
        await studySessionService.updateProgress(
          state.currentSession.id,
          safeProgress
        );

        /*
         * Update Zustand progress.
         */

        set({
          progress:
            safeProgress,
        });

        /*
         * Keep local session object synchronized.
         */

        set(
          (currentState) => ({
            currentSession:
              currentState.currentSession
                ? {
                    ...currentState.currentSession,

                    progress:
                      safeProgress,
                  }
                : null,
          })
        );
      } catch (error) {
        console.error(
          "StudySession: progress update failed:",
          error
        );

        /*
         * Keep local progress even if Firestore
         * temporarily fails.
         */

        set({
          progress:
            safeProgress,
        });
      }
    },

    /*
     * =====================================================
     * TICK
     * =====================================================
     */

    tick: () => {
      const state = get();

      /*
       * Never count time without an active session.
       */

      if (
        !state.isStudying ||
        !state.currentSession
      ) {
        return;
      }

      set(
        (currentState) => ({
          elapsedSeconds:
            currentState.elapsedSeconds +
            1,
        })
      );
    },

    /*
     * =====================================================
     * RESET
     * =====================================================
     */

    reset: () => {
      stopSessionTimer();

      set({
        currentSession: null,
        isStudying: false,
        elapsedSeconds: 0,
        progress: 0,
        loading: false,
      });
    },
  }));