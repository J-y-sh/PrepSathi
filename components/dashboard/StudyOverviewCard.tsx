"use client";

import React, { useEffect, useState } from "react";
import {
  Clock3,
  CalendarDays,
  Target,
  Flame,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "@/features/auth/AuthProvider";
import { studySessionService } from "@/services/firestore/studySessionService";
import { StudySession } from "@/types/StudySession";

interface StudyOverview {
  todayMinutes: number;
  weekMinutes: number;
  completedSessions: number;
  streak: number;
}

export function StudyOverviewCard() {
  const { user } = useAuth();

  const [overview, setOverview] =
    useState<StudyOverview>({
      todayMinutes: 0,
      weekMinutes: 0,
      completedSessions: 0,
      streak: 0,
    });

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadOverview = async () => {
      try {
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
      }
    };

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const formatStudyTime = (
    totalMinutes: number
  ) => {
    const hours = Math.floor(
      totalMinutes / 60
    );

    const minutes =
      totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    if (minutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-5">

      <div className="flex items-start justify-between mb-5">

        <div>
          <p className="text-xs text-amber-500 uppercase tracking-widest font-bold">
            Study Overview
          </p>

          <h2 className="text-lg font-bold text-white mt-1">
            Your Progress
          </h2>
        </div>

        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
          <Target size={20} />
        </div>

      </div>

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
          label="Completed"
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
        onClick={() => {
          window.dispatchEvent(
            new CustomEvent(
              "prepsathi:navigate",
              {
                detail: {
                  tab: "analytics",
                },
              }
            )
          );
        }}
        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.06] transition-all text-sm font-medium"
      >
        View Analytics

        <ArrowRight size={16} />
      </button>

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
    <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">

      <div className="flex items-center gap-2 text-white/30">
        {icon}

        <span className="text-[10px] uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="text-lg font-bold text-white mt-2">
        {value}
      </p>

    </div>
  );
}

function calculateOverview(
  sessions: StudySession[]
): StudyOverview {
  const today = new Date();

  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(
    today.getDate() - today.getDay()
  );

  const todayMinutes = sessions.reduce(
    (sum, session) => {
      const date = getSessionDate(
        session.createdAt
      );

      if (!date) return sum;

      return date >= startOfToday
        ? sum + (session.durationMinutes || 0)
        : sum;
    },
    0
  );

  const weekMinutes = sessions.reduce(
    (sum, session) => {
      const date = getSessionDate(
        session.createdAt
      );

      if (!date) return sum;

      return date >= weekStart
        ? sum + (session.durationMinutes || 0)
        : sum;
    },
    0
  );

  const completedSessions =
    sessions.filter(
      (session) => session.completed
    ).length;

  const studyDays = new Set(
    sessions
      .filter(
        (session) => session.completed
      )
      .map((session) => {
        const date = getSessionDate(
          session.createdAt
        );

        if (!date) return null;

        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
      .filter(Boolean)
  );

  let streak = 0;

  const streakDate = new Date();
  streakDate.setHours(0, 0, 0, 0);

  while (true) {
    const key = `${streakDate.getFullYear()}-${streakDate.getMonth()}-${streakDate.getDate()}`;

    if (!studyDays.has(key)) {
      break;
    }

    streak++;

    streakDate.setDate(
      streakDate.getDate() - 1
    );
  }

  return {
    todayMinutes,
    weekMinutes,
    completedSessions,
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