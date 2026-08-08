"use client";

import React from "react";
import { Pause, Play, Square, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudySessionStore } from "@/store/useStudySessionStore";
import { useStudyTimer } from "@/hooks/useStudyTimer";

interface StudyTimerProps {
  onFinish?: () => void;
}

export function StudyTimer({ onFinish }: StudyTimerProps) {
  const {
    isStudying,
    currentSession,
    finishSession,
    reset,
  } = useStudySessionStore();

  const {
    formattedTime,
  } = useStudyTimer();

  const handleFinish = async () => {
    try {
      await finishSession();
      onFinish?.();
    } catch (error) {
      console.error("Failed to finish study session:", error);
    }
  };

  const handleReset = () => {
    reset();
  };

  if (!currentSession) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-6">
        <div className="flex items-center gap-3 text-white/40">
          <Clock3 size={20} />
          <span className="text-sm">
            No active study session
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-[#1E293B] p-6 space-y-6">

      {/* Session Header */}

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
            Current Study Session
          </p>

          <h3 className="mt-2 text-lg font-bold text-white truncate">
            {currentSession.resourceTitle}
          </h3>

          <p className="mt-1 text-sm text-white/40">
            {currentSession.category}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
          <Clock3 size={22} />
        </div>

      </div>

      {/* Timer */}

      <div className="rounded-2xl bg-[#020617] border border-white/5 py-8 text-center">

        <p className="text-xs uppercase tracking-[0.25em] text-white/30 mb-3">
          Study Time
        </p>

        <div className="text-5xl md:text-6xl font-mono font-bold tracking-wider text-white">
          {formattedTime}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2">

          <span
            className={`h-2 w-2 rounded-full ${
              isStudying
                ? "bg-emerald-400 animate-pulse"
                : "bg-amber-400"
            }`}
          />

          <span className="text-xs text-white/40">
            {isStudying ? "Study session active" : "Session paused"}
          </span>

        </div>

      </div>

      {/* Controls */}

      <div className="flex flex-col sm:flex-row gap-3">

        <Button
          disabled
          className="flex-1 h-11 rounded-xl bg-white/5 text-white/30 cursor-not-allowed"
        >
          {isStudying ? (
            <>
              <Pause size={17} />
              Studying
            </>
          ) : (
            <>
              <Play size={17} />
              Resume
            </>
          )}
        </Button>

        <Button
          onClick={handleFinish}
          className="flex-1 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
        >
          <Square size={16} fill="currentColor" />
          Finish Study
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          className="h-11 rounded-xl border-white/10 bg-transparent text-white/50 hover:bg-white/5 hover:text-white"
        >
          Reset
        </Button>

      </div>

      {/* Session Information */}

      <div className="grid grid-cols-2 gap-3">

        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs text-white/30 uppercase tracking-wider">
            Category
          </p>

          <p className="mt-1 text-sm font-bold text-white truncate">
            {currentSession.category}
          </p>
        </div>

        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs text-white/30 uppercase tracking-wider">
            Progress
          </p>

          <p className="mt-1 text-sm font-bold text-emerald-400">
            {currentSession.progress}%
          </p>
        </div>

      </div>

    </div>
  );
}