"use client";

import React, {
  useEffect,
  useState,
} from "react";

import {
  Clock3,
  CalendarDays,
  Target,
  Flame,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/features/auth/AuthProvider";
import { studySessionService } from "@/services/firestore/studySessionService";
import { StudySession } from "@/types/StudySession";
import { useNavStore } from "@/store/useNavStore";

interface StudyOverview {
  todayMinutes: number;
  weekMinutes: number;
  completedSessions: number;
  streak: number;
}

const EMPTY_OVERVIEW: StudyOverview = {
  todayMinutes: 0,
  weekMinutes: 0,
  completedSessions: 0,
  streak: 0,
};

export function StudyOverviewCard() {
  const { user } = useAuth();
  const { setActiveTab } = useNavStore();

  const [overview, setOverview] =
    useState<StudyOverview>(
      EMPTY_OVERVIEW
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!user) {
      setOverview(EMPTY_OVERVIEW);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOverview() {
      try {
        setLoading(true);

        if (!user) return;

        const sessions =
          await studySessionService.listByUser(
            user.uid
          );

        if (cancelled) return;

        setOverview(
          calculateOverview(sessions)
        );
      } catch (error) {
        console.error(
          "StudyOverviewCard: failed to load:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const formatStudyTime = (
    totalMinutes: number
  ) => {
    const safeMinutes = Math.max(
      0,
      Math.round(totalMinutes)
    );

    const hours = Math.floor(
      safeMinutes / 60
    );

    const minutes =
      safeMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-5">

      <div className="mb-5 flex items-start justify-between">

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-500">
            Study Overview
          </p>

          <h2 className="mt-1 text-lg font-bold text-white">
            Your Progress
          </h2>
        </div>

        <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-500">
          <Target size={20} />
        </div>

      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2
            size={22}
            className="animate-spin text-amber-500"
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">

            <OverviewItem
              icon={<Clock3 size={16} />}
              label="Today"
              value={formatStudyTime(
                overview.todayMinutes
              )}
            />

            <OverviewItem
              icon={<CalendarDays size={16} />}
              label="This Week"
              value={formatStudyTime(
                overview.weekMinutes
              )}
            />

            <OverviewItem
              icon={<Target size={16} />}
              label="Sessions"
              value={String(
                overview.completedSessions
              )}
            />

            <OverviewItem
              icon={<Flame size={16} />}
              label="Streak"
              value={`${overview.streak} ${
                overview.streak === 1
                  ? "day"
                  : "days"
              }`}
            />

          </div>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/[0.06] hover:text-white"
          >
            View Analytics
            <ArrowRight size={16} />
          </button>
        </>
      )}

    </div>
  );
}

function OverviewItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">

      <div className="flex items-center gap-2 text-white/30">
        {icon}

        <span className="text-[10px] uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 text-lg font-bold text-white">
        {value}
      </p>

    </div>
  );
}

function calculateOverview(
  sessions: StudySession[]
): StudyOverview {
  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(
    0,
    0,
    0,
    0
  );

  const startOfWeek = new Date(now);
  startOfWeek.setHours(
    0,
    0,
    0,
    0
  );

  /*
   * Sunday = 0.
   *
   * This keeps the existing weekly definition used
   * throughout the current dashboard.
   */
  startOfWeek.setDate(
    startOfWeek.getDate() -
      startOfWeek.getDay()
  );

  const completedSessions =
    sessions.filter(
      (session) => session.completed
    );

  let todayMinutes = 0;
  let weekMinutes = 0;

  const studyDays = new Set<string>();

  for (const session of completedSessions) {
    const date = getSessionDate(
      session.createdAt
    );

    if (!date) continue;

    const minutes =
      session.durationMinutes || 0;

    if (date >= startOfToday) {
      todayMinutes += minutes;
    }

    if (date >= startOfWeek) {
      weekMinutes += minutes;
    }

    studyDays.add(
      getDateKey(date)
    );
  }

  /*
   * Calculate consecutive completed-study days
   * backwards from today.
   */
  let streak = 0;

  const streakDate = new Date(
    startOfToday
  );

  while (
    studyDays.has(
      getDateKey(streakDate)
    )
  ) {
    streak++;

    streakDate.setDate(
      streakDate.getDate() - 1
    );
  }

  return {
    todayMinutes,
    weekMinutes,
    completedSessions:
      completedSessions.length,
    streak,
  };
}

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

function getDateKey(
  date: Date
): string {
  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ].join("-");
}