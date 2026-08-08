"use client";

import React, { useEffect } from "react";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  Brain,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStudySessionStore } from "@/store/useStudySessionStore";
import { StudyTimer } from "./StudyTimer";
import { StudyProgress } from "./StudyProgress";

interface StudyModeProps {
  onBack?: () => void;
}

export function StudyMode({ onBack }: StudyModeProps) {
  const {
    currentSession,
    isStudying,
  } = useStudySessionStore();

  useEffect(() => {
    if (!currentSession) {
      onBack?.();
    }
  }, [currentSession, onBack]);

  if (!currentSession) {
    return null;
  }

  const handleOpenResource = () => {
    if (!currentSession.resourceUrl) return;

    window.open(
      currentSession.resourceUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="min-h-[calc(100vh-80px)] px-6 py-6 pb-32">

      <div className="max-w-6xl mx-auto space-y-6">

        {/* =========================
            TOP BAR
        ========================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <Button
              variant="ghost"
              onClick={onBack}
              className="h-10 px-3 text-white/50 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft size={18} />
              Back
            </Button>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-3">

              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <BookOpen size={20} />
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                  Study Mode
                </p>

                <h2 className="text-lg font-bold text-white truncate max-w-[220px] sm:max-w-md">
                  {currentSession.resourceTitle}
                </h2>
              </div>

            </div>

          </div>

          <div className="flex items-center gap-2">

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">

              <span
                className={`h-2 w-2 rounded-full ${
                  isStudying
                    ? "bg-emerald-400 animate-pulse"
                    : "bg-amber-400"
                }`}
              />

              <span className="text-xs text-white/50">
                {isStudying
                  ? "Session active"
                  : "Session paused"}
              </span>

            </div>

          </div>

        </div>

        {/* =========================
            STUDY RESOURCE INFO
        ========================== */}

        <div className="rounded-3xl border border-white/5 bg-[#1E293B] p-5">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                <BookOpen size={24} />
              </div>

              <div>

                <h3 className="text-white font-bold">
                  {currentSession.resourceTitle}
                </h3>

                <div className="flex items-center gap-2 mt-1">

                  <span className="text-xs text-white/40">
                    {currentSession.category}
                  </span>

                  <span className="text-white/20">
                    •
                  </span>

                  <span className="text-xs uppercase text-white/40">
                    {currentSession.resourceType}
                  </span>

                </div>

              </div>

            </div>

            <Button
              variant="outline"
              onClick={handleOpenResource}
              className="border-white/10 bg-transparent text-white/60 hover:bg-white/5 hover:text-white"
            >
              <ExternalLink size={16} />
              Open Resource
            </Button>

          </div>

        </div>

        {/* =========================
            STUDY CONTENT
        ========================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <StudyTimer />

          <StudyProgress />

        </div>

        {/* =========================
            AI ASSISTANCE PREVIEW
        ========================== */}

        <div className="rounded-3xl border border-purple-500/10 bg-purple-500/5 p-6">

          <div className="flex items-start gap-4">

            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 shrink-0">
              <Brain size={22} />
            </div>

            <div>

              <p className="text-xs uppercase tracking-widest text-purple-400 font-bold">
                PrepSathi AI
              </p>

              <h3 className="mt-1 text-lg font-bold text-white">
                Intelligent study tracking is coming
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-white/40 max-w-2xl">
                PrepSathi will use your study sessions,
                completion rate, subject activity, and
                learning history to identify weak areas
                and generate your next study recommendation.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}