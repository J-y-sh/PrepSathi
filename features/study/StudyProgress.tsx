"use client";

import React from "react";
import { CheckCircle2, Target, TrendingUp } from "lucide-react";
import { useStudySessionStore } from "@/store/useStudySessionStore";

export function StudyProgress() {
  const {
    currentSession,
    progress,
    elapsedSeconds,
  } = useStudySessionStore();

  const displayProgress = Math.min(
    100,
    Math.max(0, progress)
  );

  const minutes = Math.floor(elapsedSeconds / 60);

  if (!currentSession) {
    return (
      <div className="rounded-3xl border border-white/5 bg-[#1E293B] p-6">
        <div className="flex items-center gap-3 text-white/40">
          <Target size={20} />
          <span className="text-sm">
            Start a study session to track progress.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-[#1E293B] p-6 space-y-6">

      {/* Header */}

      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-xs uppercase tracking-widest text-amber-400 font-bold">
            Session Progress
          </p>

          <h3 className="mt-2 text-lg font-bold text-white">
            {currentSession.resourceTitle}
          </h3>

          <p className="mt-1 text-sm text-white/40">
            {currentSession.category}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
          <TrendingUp size={22} />
        </div>

      </div>

      {/* Progress Percentage */}

      <div className="flex items-end justify-between">

        <div>
          <p className="text-4xl font-bold text-white">
            {displayProgress}%
          </p>

          <p className="text-xs text-white/30 mt-1">
            Current completion
          </p>
        </div>

        <div className="text-right">
          <p className="text-sm font-bold text-white">
            {minutes} min
          </p>

          <p className="text-xs text-white/30">
            Study time
          </p>
        </div>

      </div>

      {/* Progress Bar */}

      <div className="space-y-2">

        <div className="h-3 rounded-full bg-white/5 overflow-hidden">

          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{
              width: `${displayProgress}%`,
            }}
          />

        </div>

        <div className="flex justify-between text-[11px] text-white/25">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>

      </div>

      {/* Status */}

      <div className="flex items-center gap-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4">

        <CheckCircle2
          size={20}
          className="text-emerald-400 shrink-0"
        />

        <div>
          <p className="text-sm font-bold text-white">
            Keep going
          </p>

          <p className="text-xs text-white/40 mt-0.5">
            Your study progress will help PrepSathi
            personalize your future plan.
          </p>
        </div>

      </div>

    </div>
  );
}