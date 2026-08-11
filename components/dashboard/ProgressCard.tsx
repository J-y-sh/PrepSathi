"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { DashboardCard } from "./DashboardCard";
import { useAuth } from "@/features/auth/AuthProvider";
import { studySessionService } from "@/services/firestore/studySessionService";
import { StudySession } from "@/types/StudySession";
import { useStudySessionStore } from "@/store/useStudySessionStore";

const DAILY_TARGET_HOURS = 8;

function getSessionDate(
  value: StudySession["createdAt"]
): Date | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate();
  }

  return null;
}

function isSameDay(
  date: Date,
  target: Date
): boolean {
  return (
    date.getFullYear() === target.getFullYear() &&
    date.getMonth() === target.getMonth() &&
    date.getDate() === target.getDate()
  );
}

export function ProgressCard() {
  const { user } = useAuth();

  const {
    currentSession,
    elapsedSeconds,
  } = useStudySessionStore();

  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadProgress() {
      try {
        setLoading(true);

        if (!user) return;

        const data =
          await studySessionService.listByUser(
            user.uid
          );

        if (!cancelled) {
          setSessions(data);
        }
      } catch (error) {
        console.error(
          "ProgressCard: failed to load study sessions:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const completedHours = useMemo(() => {
    const today = new Date();

    const completedMinutes =
      sessions.reduce((total, session) => {
        if (!session.completed) {
          return total;
        }

        const date = getSessionDate(
          session.createdAt
        );

        if (!date || !isSameDay(date, today)) {
          return total;
        }

        return total + (session.durationMinutes || 0);
      }, 0);

    /*
     * Add the currently active session visually.
     *
     * This does not get persisted until the session finishes,
     * so the dashboard remains responsive during live study.
     */
    const activeMinutes =
      currentSession && elapsedSeconds > 0
        ? elapsedSeconds / 60
        : 0;

    return (
      completedMinutes / 60 +
      activeMinutes / 60
    );
  }, [
    sessions,
    currentSession,
    elapsedSeconds,
  ]);

  const percentage = Math.min(
    (completedHours / DAILY_TARGET_HOURS) * 100,
    100
  );

  return (
    <DashboardCard title="Today's Progress">
      <div className="flex flex-col gap-4">

        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2
              size={20}
              className="animate-spin text-amber-500"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">

              <div>
                <p className="text-2xl font-bold text-white">
                  {completedHours.toFixed(1)}h
                </p>

                <p className="text-[10px] uppercase tracking-wider text-white/30">
                  Studied Today
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {DAILY_TARGET_HOURS}h
                </p>

                <p className="text-[10px] uppercase tracking-wider text-white/30">
                  Daily Target
                </p>
              </div>

            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-white/5 p-0.5">

              <div
                className="h-full rounded-full bg-[#10B981] transition-all duration-1000"
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

            <div className="flex items-center justify-between">

              <p className="text-[10px] italic text-white/30">
                {completedHours >= DAILY_TARGET_HOURS
                  ? "Daily target achieved. Excellent work."
                  : "Consistency is the key to UPSC success."}
              </p>

              <p className="text-[10px] font-semibold text-emerald-400">
                {Math.round(percentage)}%
              </p>

            </div>
          </>
        )}

      </div>
    </DashboardCard>
  );
}