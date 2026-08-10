"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { DashboardCard } from "./DashboardCard";
import { useAuth } from "@/features/auth/AuthProvider";
import { studySessionService } from "@/services/firestore/studySessionService";
import { StudySession } from "@/types/StudySession";
import { useStudySessionStore } from "@/store/useStudySessionStore";

export function ProgressCard() {
  const { user } = useAuth();

  const {
    currentSession,
    elapsedSeconds,
  } = useStudySessionStore();

  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const target = 8;

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadProgress = async () => {
      try {
        setLoading(true);

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
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const progress = useMemo(() => {
    const today = new Date();

    const historicalMinutes =
      sessions.reduce(
        (sum, session) => {
          const createdAt =
            session.createdAt;

          if (
            !createdAt ||
            typeof createdAt !== "object" ||
            !("toDate" in createdAt)
          ) {
            return sum;
          }

          const sessionDate =
            createdAt.toDate();

          const isToday =
            sessionDate.getFullYear() ===
              today.getFullYear() &&
            sessionDate.getMonth() ===
              today.getMonth() &&
            sessionDate.getDate() ===
              today.getDate();

          if (!isToday) {
            return sum;
          }

          return (
            sum +
            (session.durationMinutes || 0)
          );
        },
        0
      );

    const activeSessionMinutes =
      currentSession
        ? elapsedSeconds / 60
        : 0;

    return (
      historicalMinutes +
      activeSessionMinutes
    ) / 60;
  }, [
    sessions,
    currentSession,
    elapsedSeconds,
  ]);

  const percentage = Math.min(
    (progress / target) * 100,
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
                  {progress.toFixed(1)}h
                </p>

                <p className="text-[10px] uppercase tracking-wider text-white/30">
                  Completed
                </p>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {target}h
                </p>

                <p className="text-[10px] uppercase tracking-wider text-white/30">
                  Target
                </p>
              </div>

            </div>

            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5">

              <div
                className="h-full bg-[#10B981] rounded-full transition-all duration-1000"
                style={{
                  width: `${percentage}%`,
                }}
              />

            </div>

            <div className="flex items-center justify-between">

              <p className="text-[10px] text-white/30 italic">
                Consistency is the key to UPSC success.
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