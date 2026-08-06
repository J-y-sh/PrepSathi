"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthProvider";
import { sprintService } from "@/services/firestore/sprintService";
import { cn } from "@/lib/utils";

type SprintState = "setup" | "timer" | "completion";

const SUBJECTS = [
  "History", "Geography", "Polity", "Economy",
  "Environment", "Science & Tech", "Current Affairs",
  "Ethics", "CSAT"
];

const DURATIONS = [
  { label: "15 min", value: 15, xp: 15 },
  { label: "25 min", value: 25, xp: 30 },
  { label: "50 min", value: 50, xp: 70 },
];

export function SprintMode() {
  const { user } = useAuth();
  const [state, setState] = useState<SprintState>("setup");

  // Setup state
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState(DURATIONS[0]);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleComplete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, isPaused, timeLeft]);

  const handleStart = () => {
    setTimeLeft(duration.value * 60);
    setIsActive(true);
    setIsPaused(false);
    setState("timer");
  };

  const handlePause = () => setIsPaused(true);
  const handleResume = () => setIsPaused(false);

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setState("setup");
  };

  const handleComplete = async () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (user) {
      try {
        await sprintService.completeSprint(user.uid, {
          subject,
          topic,
          durationMinutes: duration.value,
          xpAwarded: duration.xp,
        });
        setState("completion");
      } catch (error) {
        console.error("Failed to save sprint:", error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = timeLeft / (duration.value * 60);
  const strokeDasharray = 2 * Math.PI * 45; // radius 45
  const strokeDashoffset = strokeDasharray * (1 - progress);

  return (
    <div className="flex flex-col min-h-[calc(100vh-200px)] items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {state === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md bg-[#1E293B] rounded-3xl p-8 shadow-2xl border border-white/5 space-y-8"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Timer className="text-amber-500" /> Start a Sprint
              </h2>
              <p className="text-white/40 text-sm">Select your focus area and duration.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={14} /> Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <Hash size={14} /> Topic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fundamental Rights"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} /> Duration
                </label>
                <div className="flex gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "flex-1 py-3 rounded-xl font-bold transition-all border",
                        duration.value === d.value
                          ? "bg-amber-500 border-amber-500 text-[#020617]"
                          : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              onClick={handleStart}
              className="w-full bg-amber-500 hover:bg-amber-600 text-[#020617] font-bold h-14 rounded-2xl text-lg shadow-lg shadow-amber-500/20"
            >
              Begin Focus Session
            </Button>
          </motion.div>
        )}

        {state === "timer" && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center space-y-12"
          >
            <div className="text-center space-y-2">
              <span className="px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-sm font-bold border border-amber-500/20">
                {subject} {topic && `• ${topic}`}
              </span>
            </div>

            <div className="relative w-72 h-72">
              {/* Circular Progress SVG */}
              <svg className="w-full h-full -rotate-90">
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
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-amber-500"
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-black text-white tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-white/30 font-medium uppercase tracking-[0.2em] text-xs mt-2">
                  Time Remaining
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={handleStop}
                className="p-5 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5"
              >
                <Square size={24} fill="currentColor" />
              </button>

              {isPaused ? (
                <button
                  onClick={handleResume}
                  className="p-8 rounded-full bg-amber-500 text-[#020617] hover:scale-110 transition-all shadow-xl shadow-amber-500/30"
                >
                  <Play size={32} fill="currentColor" />
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="p-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10"
                >
                  <Pause size={32} fill="currentColor" />
                </button>
              )}

              <button
                onClick={handleComplete}
                className="p-5 rounded-full bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-all border border-[#10B981]/20"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </motion.div>
        )}

        {state === "completion" && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm bg-[#1E293B] rounded-3xl p-8 shadow-2xl border border-white/5 text-center space-y-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 blur-3xl opacity-20" />
              <div className="relative p-6 rounded-full bg-amber-500/20 text-amber-500 w-24 h-24 mx-auto flex items-center justify-center">
                <Trophy size={48} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">Sprint Completed!</h2>
              <p className="text-white/40">You're one step closer to your goal.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0A0F1D] p-4 rounded-2xl border border-white/5">
                <span className="block text-2xl font-bold text-amber-500">+{duration.xp}</span>
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">XP Gained</span>
              </div>
              <div className="bg-[#0A0F1D] p-4 rounded-2xl border border-white/5">
                <span className="block text-2xl font-bold text-[#10B981]">{duration.value}m</span>
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Time Focused</span>
              </div>
            </div>

            <Button
              onClick={() => setState("setup")}
              className="w-full bg-white text-[#020617] font-bold h-14 rounded-2xl hover:bg-white/90"
            >
              Done
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
