"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  Play,
  Pause,
  Square,
  ChevronRight,
  Trophy,
  BookOpen,
  Hash,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthProvider";
import { sprintService } from "@/services/firestore/sprintService";
import { analyticsService } from "@/services/firestore/analyticsService";
import { cn } from "@/lib/utils";

type SprintState = "setup" | "timer" | "completion";

const SUBJECTS = [
  "History",
  "Geography",
  "Polity",
  "Economy",
  "Environment",
  "Science & Tech",
  "Current Affairs",
  "Ethics",
  "CSAT",
];

const DURATIONS = [
  { label: "15 min", value: 15, xp: 15 },
  { label: "25 min", value: 25, xp: 30 },
  { label: "50 min", value: 50, xp: 70 },
];

export function SprintMode() {
  const { user } = useAuth();

  const [state, setState] = useState<SprintState>("setup");

  // =========================================================
  // SETUP
  // =========================================================

  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(DURATIONS[0]);

  // =========================================================
  // TIMER
  // =========================================================

  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionHandledRef = useRef(false);

  // =========================================================
  // CLEANUP
  // =========================================================

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  // =========================================================
  // TIMER LOOP
  // =========================================================

  useEffect(() => {
    if (state !== "timer" || isPaused || saving) {
      clearTimer();
      return;
    }

    if (timeLeft <= 0) {
      clearTimer();

      if (!completionHandledRef.current) {
        completionHandledRef.current = true;
        void handleComplete();
      }

      return;
    }

    clearTimer();

    timerRef.current = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      clearTimer();
    };
  }, [state, isPaused, timeLeft, saving]);

  // =========================================================
  // START
  // =========================================================

  const handleStart = () => {
    clearTimer();

    completionHandledRef.current = false;

    setTimeLeft(duration.value * 60);
    setIsPaused(false);
    setSaving(false);
    setState("timer");
  };

  // =========================================================
  // PAUSE / RESUME
  // =========================================================

  const handlePause = () => {
    setIsPaused(true);
    clearTimer();
  };

  const handleResume = () => {
    if (timeLeft <= 0) return;

    completionHandledRef.current = false;
    setIsPaused(false);
  };

  // =========================================================
  // STOP
  // =========================================================

  const handleStop = () => {
    clearTimer();

    completionHandledRef.current = true;

    setTimeLeft(0);
    setIsPaused(false);
    setSaving(false);
    setState("setup");
  };

  // =========================================================
  // COMPLETE
  // =========================================================

  const handleComplete = async () => {
    if (saving) return;

    clearTimer();

    setSaving(true);
    setIsPaused(false);

    /*
     * Calculate actual focused time.
     *
     * Example:
     * 25-minute sprint with 7 minutes remaining
     * = 18 minutes actually focused.
     */

    const totalSeconds = duration.value * 60;
    const focusedSeconds = Math.max(
      0,
      totalSeconds - timeLeft
    );

    const focusedMinutes =
      focusedSeconds > 0
        ? Math.max(1, Math.floor(focusedSeconds / 60))
        : 0;

    try {
      if (user) {
        await sprintService.completeSprint(user.uid, {
          subject,
          topic,
          durationMinutes: focusedMinutes,
          xpAwarded:
            focusedMinutes > 0
              ? duration.xp
              : 0,
        });

        /*
         * Record sprint study time in daily analytics.
         */

        if (focusedMinutes > 0) {
          const date = new Date()
            .toISOString()
            .split("T")[0];

          try {
            await analyticsService.recordStudySession(
              user.uid,
              date,
              focusedMinutes
            );
          } catch (analyticsError) {
            console.error(
              "Sprint analytics recording failed:",
              analyticsError
            );
          }
        }
      }

      setState("completion");
    } catch (error) {
      console.error(
        "Failed to save sprint:",
        error
      );

      /*
       * Allow the user to retry completion.
       */

      completionHandledRef.current = false;
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleDone = () => {
    clearTimer();

    completionHandledRef.current = false;

    setTimeLeft(0);
    setIsPaused(false);
    setSaving(false);
    setState("setup");
  };

  // =========================================================
  // FORMAT
  // =========================================================

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const totalSeconds = duration.value * 60;

  const progress =
    totalSeconds > 0
      ? timeLeft / totalSeconds
      : 0;

  const strokeDasharray =
    2 * Math.PI * 45;

  const strokeDashoffset =
    strokeDasharray * (1 - progress);

  const focusedSeconds = Math.max(
    0,
    totalSeconds - timeLeft
  );

  const focusedMinutes =
    focusedSeconds > 0
      ? Math.max(
          1,
          Math.floor(focusedSeconds / 60)
        )
      : 0;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">

        {/* =================================================
            SETUP
        ================================================= */}

        {state === "setup" && (
          <motion.div
            key="setup"
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 1.05,
            }}
            className="w-full max-w-md space-y-8 rounded-3xl border border-white/5 bg-[#1E293B] p-8 shadow-2xl"
          >
            <div className="space-y-2">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                <Timer className="text-amber-500" />
                Start a Sprint
              </h2>

              <p className="text-sm text-white/40">
                Select your focus area and duration.
              </p>
            </div>

            <div className="space-y-6">

              {/* SUBJECT */}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <BookOpen size={14} />
                  Subject
                </label>

                <select
                  value={subject}
                  onChange={(event) =>
                    setSubject(event.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#0A0F1D] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {SUBJECTS.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* TOPIC */}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <Hash size={14} />
                  Topic (Optional)
                </label>

                <input
                  type="text"
                  placeholder="e.g. Fundamental Rights"
                  value={topic}
                  onChange={(event) =>
                    setTopic(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0A0F1D] px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* DURATION */}

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <Clock size={14} />
                  Duration
                </label>

                <div className="flex gap-2">
                  {DURATIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setDuration(item)
                      }
                      className={cn(
                        "flex-1 rounded-xl border py-3 font-bold transition-all",
                        duration.value ===
                          item.value
                          ? "border-amber-500 bg-amber-500 text-[#020617]"
                          : "border-white/5 bg-white/5 text-white/60 hover:bg-white/10"
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleStart}
              className="h-14 w-full rounded-2xl bg-amber-500 text-lg font-bold text-[#020617] shadow-lg shadow-amber-500/20 hover:bg-amber-600"
            >
              Begin Focus Session
            </Button>
          </motion.div>
        )}

        {/* =================================================
            TIMER
        ================================================= */}

        {state === "timer" && (
          <motion.div
            key="timer"
            initial={{
              opacity: 0,
              scale: 1.1,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
            }}
            className="flex flex-col items-center space-y-12"
          >
            <div className="space-y-2 text-center">
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-sm font-bold text-amber-500">
                {subject}
                {topic && ` • ${topic}`}
              </span>
            </div>

            {/* CIRCULAR TIMER */}

            <div className="relative h-72 w-72">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-white/5"
                />

                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={
                    strokeDasharray
                  }
                  strokeDashoffset={
                    strokeDashoffset
                  }
                  strokeLinecap="round"
                  className="text-amber-500"
                  transition={{
                    duration: 1,
                    ease: "linear",
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black tracking-tighter text-white">
                  {formatTime(timeLeft)}
                </span>

                <span className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/30">
                  {isPaused
                    ? "Paused"
                    : "Time Remaining"}
                </span>
              </div>
            </div>

            {/* CONTROLS */}

            <div className="flex items-center gap-6">

              <button
                type="button"
                onClick={handleStop}
                disabled={saving}
                className="rounded-full border border-white/5 bg-white/5 p-5 text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <Square
                  size={24}
                  fill="currentColor"
                />
              </button>

              {isPaused ? (
                <button
                  type="button"
                  onClick={handleResume}
                  disabled={saving}
                  className="rounded-full bg-amber-500 p-8 text-[#020617] shadow-xl shadow-amber-500/30 transition-all hover:scale-110 disabled:opacity-40"
                >
                  <Play
                    size={32}
                    fill="currentColor"
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  disabled={saving}
                  className="rounded-full border border-white/10 bg-white/10 p-8 text-white transition-all hover:bg-white/20 disabled:opacity-40"
                >
                  <Pause
                    size={32}
                    fill="currentColor"
                  />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  completionHandledRef.current = true;
                  void handleComplete();
                }}
                disabled={saving}
                className="rounded-full border border-[#10B981]/20 bg-[#10B981]/10 p-5 text-[#10B981] transition-all hover:bg-[#10B981]/20 disabled:opacity-40"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {saving && (
              <p className="text-xs text-white/30">
                Saving sprint...
              </p>
            )}
          </motion.div>
        )}

        {/* =================================================
            COMPLETION
        ================================================= */}

        {state === "completion" && (
          <motion.div
            key="completion"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="w-full max-w-sm space-y-8 rounded-3xl border border-white/5 bg-[#1E293B] p-8 text-center shadow-2xl"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 opacity-20 blur-3xl" />

              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                <Trophy size={48} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">
                Sprint Completed!
              </h2>

              <p className="text-white/40">
                You're one step closer to your goal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-2xl border border-white/5 bg-[#0A0F1D] p-4">
                <span className="block text-2xl font-bold text-amber-500">
                  +{focusedMinutes > 0 ? duration.xp : 0}
                </span>

                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  XP Gained
                </span>
              </div>

              <div className="rounded-2xl border border-white/5 bg-[#0A0F1D] p-4">
                <span className="block text-2xl font-bold text-[#10B981]">
                  {focusedMinutes}m
                </span>

                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Time Focused
                </span>
              </div>

            </div>

            <Button
              onClick={handleDone}
              className="h-14 w-full rounded-2xl bg-white font-bold text-[#020617] hover:bg-white/90"
            >
              Done
            </Button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}