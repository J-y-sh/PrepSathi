import { create } from "zustand";
import { serverTimestamp } from "firebase/firestore";
import { StudySession } from "@/types/StudySession";
import { studySessionService } from "@/services/firestore/studySessionService";

interface StudySessionState {
  currentSession: StudySession | null;
  isStudying: boolean;
  elapsedSeconds: number;
  progress: number;
  loading: boolean;

  startSession: (
    session: Omit<StudySession, "id" | "startedAt" | "createdAt">
  ) => Promise<void>;

  finishSession: () => Promise<void>;

  updateProgress: (progress: number) => Promise<void>;

  tick: () => void;

  reset: () => void;
}

export const useStudySessionStore = create<StudySessionState>((set, get) => ({
  currentSession: null,
  isStudying: false,
  elapsedSeconds: 0,
  progress: 0,
  loading: false,

  async startSession(data) {
    const id = crypto.randomUUID();

    const session: StudySession = {
      id,
      ...data,
      startedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      durationMinutes: 0,
    };

    await studySessionService.startSession(id, {
      ...session,
    });

    set({
      currentSession: session,
      isStudying: true,
      elapsedSeconds: 0,
      progress: 0,
    });
  },

  async finishSession() {
    const state = get();

    if (!state.currentSession) return;

    const minutes = Math.floor(state.elapsedSeconds / 60);

    await studySessionService.finishSession(
      state.currentSession.id,
      minutes,
      state.progress,
      true
    );

    set({
      currentSession: null,
      isStudying: false,
      elapsedSeconds: 0,
      progress: 0,
    });
  },

  async updateProgress(progress) {
    const state = get();

    if (!state.currentSession) return;

    await studySessionService.updateProgress(
      state.currentSession.id,
      progress
    );

    set({
      progress,
    });
  },

  tick() {
    set((state) => ({
      elapsedSeconds: state.elapsedSeconds + 1,
    }));
  },

  reset() {
    set({
      currentSession: null,
      isStudying: false,
      elapsedSeconds: 0,
      progress: 0,
    });
  },
}));