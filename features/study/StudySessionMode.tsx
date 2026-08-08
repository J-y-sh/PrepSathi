"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Clock3,
  BookOpen,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { LibraryResource } from "@/types/Library";
import { useStudySessionStore } from "@/store/useStudySessionStore";

interface StudySessionModeProps {
  resource: LibraryResource;
  onExit: () => void;
}

export function StudySessionMode({
  resource,
  onExit,
}: StudySessionModeProps) {
  const {
    currentSession,
    isStudying,
    elapsedSeconds,
    progress,
    loading,
    startSession,
    finishSession,
    updateProgress,
    reset,
  } = useStudySessionStore();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isStudying) {
      startSession({
        userId: resource.userId,
        resourceId: resource.id,
        resourceTitle: resource.title,
        resourceType: resource.type,
        category: resource.category,
        progress: 0,
        completed: false,
        durationMinutes: 0,
      });
    }
  }, [resource, isStudying, startSession]);

  useEffect(() => {
    if (!isStudying) return;

    const interval = setInterval(() => {
      useStudySessionStore.getState().tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isStudying]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [
      hours > 0 ? String(hours).padStart(2, "0") : null,
      String(minutes).padStart(2, "0"),
      String(secs).padStart(2, "0"),
    ]
      .filter(Boolean)
      .join(":");
  };

  const handleProgressChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = Number(e.target.value);
    await updateProgress(value);
  };

  const handleFinish = async () => {
    try {
      setSaving(true);

      await finishSession();
      reset();
      onExit();
    } catch (error) {
      console.error("Failed to finish study session:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleExit = () => {
    reset();
    onExit();
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#020617] px-6 py-6">
      <div className="max-w-5xl mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={handleExit}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft size={18} />
            Back to Library
          </Button>

          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Study Session
          </div>
        </div>

        {/* Resource information */}
        <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <BookOpen size={24} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest text-white/30 font-bold mb-2">
                Currently Studying
              </p>

              <h1 className="text-xl md:text-2xl font-bold text-white truncate">
                {resource.title}
              </h1>

              <p className="text-sm text-white/40 mt-1">
                {resource.category}
              </p>
            </div>

            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <Button
                variant="outline"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                Open Resource
                <ExternalLink size={15} />
              </Button>
            </a>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-8 md:p-12 text-center mb-6">
          <div className="flex items-center justify-center gap-2 text-white/30 mb-4">
            <Clock3 size={18} />
            <span className="text-xs uppercase tracking-[0.2em] font-bold">
              Study Time
            </span>
          </div>

          <div className="text-5xl md:text-7xl font-mono font-bold text-white tracking-wider">
            {formatTime(elapsedSeconds)}
          </div>

          <p className="text-white/30 text-sm mt-4">
            Stay focused. PrepSathi is tracking this session.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-[#1E293B] border border-white/5 rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/30 font-bold">
                Study Progress
              </p>

              <p className="text-white font-bold mt-1">
                {progress}% completed
              </p>
            </div>

            <div className="text-2xl font-bold text-amber-500">
              {progress}%
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="w-full accent-amber-500 cursor-pointer"
          />

          <div className="flex justify-between text-xs text-white/20 mt-2">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Finish */}
        <div className="flex justify-end">
          <Button
            onClick={handleFinish}
            disabled={saving || loading || !currentSession}
            className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Finish Study
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}