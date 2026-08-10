"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Clock3,
  BookOpen,
  Target,
  TrendingUp,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { Timestamp } from "firebase/firestore";

import { useAuth } from "@/features/auth/AuthProvider";
import { studySessionService } from "@/services/firestore/studySessionService";
import { StudySession } from "@/types/StudySession";
import { studyInsightsService } from "@/services/analytics/studyInsightsService";

export default function AnalyticsPage() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        console.log(
          "Analytics: loading study sessions for:",
          user.uid
        );

        const data =
          await studySessionService.listByUser(user.uid);

        if (cancelled) return;

        setSessions(data);

        console.log(
          "Analytics: sessions loaded:",
          data.length
        );
      } catch (err) {
        console.error(
          "Analytics: failed to load sessions:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load analytics."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const analytics = useMemo(() => {
    const totalMinutes = sessions.reduce(
      (sum, session) =>
        sum + (session.durationMinutes || 0),
      0
    );

    const completedSessions = sessions.filter(
      (session) => session.completed
    ).length;

    const averageProgress =
      sessions.length > 0
        ? sessions.reduce(
            (sum, session) =>
              sum + (session.progress || 0),
            0
          ) / sessions.length
        : 0;

    const categories = new Map<
      string,
      {
        minutes: number;
        sessions: number;
      }
    >();

    sessions.forEach((session) => {
      const category =
        session.category?.trim() ||
        "Uncategorized";

      const existing =
        categories.get(category) || {
          minutes: 0,
          sessions: 0,
        };

      categories.set(category, {
        minutes:
          existing.minutes +
          (session.durationMinutes || 0),
        sessions:
          existing.sessions + 1,
      });
    });

    const categoryData = Array.from(
      categories.entries()
    )
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .sort(
        (a, b) => b.minutes - a.minutes
      );

    const resourceCount = new Set(
      sessions.map(
        (session) => session.resourceId
      )
    ).size;

    const today = new Date();

    const isSameDay = (
      a: Date,
      b: Date
    ) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    const todayMinutes = sessions.reduce(
      (sum, session) => {
        const date =
          getSessionDate(session.createdAt);

        if (!date) {
          return sum;
        }

        return isSameDay(date, today)
          ? sum + (session.durationMinutes || 0)
          : sum;
      },
      0
    );

    const weekStart = new Date(today);

    weekStart.setHours(0, 0, 0, 0);

    weekStart.setDate(
      today.getDate() - today.getDay()
    );

    const weekMinutes = sessions.reduce(
      (sum, session) => {
        const date =
          getSessionDate(session.createdAt);

        if (!date) {
          return sum;
        }

        return date >= weekStart
          ? sum + (session.durationMinutes || 0)
          : sum;
      },
      0
    );

    const completionRate =
      sessions.length > 0
        ? (completedSessions / sessions.length) * 100
        : 0;

    const studyDays = new Set(
      sessions
        .filter(
          (session) => session.completed
        )
        .map((session) => {
          const date =
            getSessionDate(session.createdAt);

          if (!date) {
            return null;
          }

          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        })
        .filter(
          (key): key is string =>
            key !== null
        )
    );

    let streak = 0;

    const streakDate = new Date();

    streakDate.setHours(0, 0, 0, 0);

    while (true) {
      const key =
        `${streakDate.getFullYear()}-${streakDate.getMonth()}-${streakDate.getDate()}`;

      if (!studyDays.has(key)) {
        break;
      }

      streak++;

      streakDate.setDate(
        streakDate.getDate() - 1
      );
    }

    const activityData =
      buildSevenDayActivity(sessions);

    const maxActivityMinutes =
      Math.max(
        ...activityData.map(
          (day) => day.minutes
        ),
        1
      );

    const insights =
      studyInsightsService.analyze(
        sessions
      );

    return {
      totalMinutes,
      todayMinutes,
      completedSessions,
      averageProgress,
      weekMinutes,
      completionRate,
      streak,
      categoryData,
      resourceCount,
      activityData,
      maxActivityMinutes,
      insights,
    };
  }, [sessions]);

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

    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-3 text-white/50">
            <Loader2
              size={20}
              className="animate-spin"
            />

            <p className="text-sm">
              Loading your analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-xl font-bold">
              Unable to load analytics
            </h1>

            <p className="text-white/40 text-sm mt-2">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}

        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <BarChart3 size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Analytics
            </h1>

            <p className="text-white/40 text-sm mt-1">
              Understand your UPSC study progress.
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <AnalyticsCard
            icon={<Clock3 size={20} />}
            label="Total Study Time"
            value={formatStudyTime(
              analytics.totalMinutes
            )}
          />

          <AnalyticsCard
            icon={<BookOpen size={20} />}
            label="Resources Studied"
            value={String(
              analytics.resourceCount
            )}
          />

          <AnalyticsCard
            icon={<Target size={20} />}
            label="Sessions Completed"
            value={String(
              analytics.completedSessions
            )}
          />

          <AnalyticsCard
            icon={<TrendingUp size={20} />}
            label="Average Progress"
            value={`${Math.round(
              analytics.averageProgress
            )}%`}
          />

        </div>

        {/* PERIOD SUMMARY */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">

          <AnalyticsCard
            icon={<Clock3 size={20} />}
            label="Today"
            value={formatStudyTime(
              analytics.todayMinutes
            )}
          />

          <AnalyticsCard
            icon={<CalendarDays size={20} />}
            label="This Week"
            value={formatStudyTime(
              analytics.weekMinutes
            )}
          />

          <AnalyticsCard
            icon={<TrendingUp size={20} />}
            label="Study Streak"
            value={`${analytics.streak} ${
              analytics.streak === 1
                ? "day"
                : "days"
            }`}
          />

        </section>

        {/* SESSION COMPLETION */}

        <section className="bg-[#1E293B] border border-white/5 rounded-2xl p-6">

          <div className="flex items-center justify-between mb-3">

            <div>
              <h2 className="font-bold text-lg">
                Session Completion
              </h2>

              <p className="text-white/30 text-xs mt-1">
                How consistently you finish your study sessions.
              </p>
            </div>

            <span className="text-xl font-bold text-emerald-400">
              {Math.round(
                analytics.completionRate
              )}%
            </span>

          </div>

          <div className="h-2 bg-white/5 rounded-full overflow-hidden">

            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{
                width: `${analytics.completionRate}%`,
              }}
            />

          </div>

        </section>

        {/* SEVEN DAY ACTIVITY */}

        <section className="bg-[#1E293B] border border-white/5 rounded-2xl p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="font-bold text-lg">
                Study Activity
              </h2>

              <p className="text-white/30 text-xs mt-1">
                Your study time over the last 7 days.
              </p>
            </div>

            <CalendarDays
              size={20}
              className="text-amber-500"
            />

          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4">

            {analytics.activityData.map(
              (day) => {
                const height =
                  day.minutes > 0
                    ? Math.max(
                        (day.minutes /
                          analytics.maxActivityMinutes) *
                          100,
                        8
                      )
                    : 4;

                return (
                  <div
                    key={day.key}
                    className="flex flex-col items-center"
                  >
                    <div className="w-full h-36 flex items-end justify-center">

                      <div
                        className={`w-full max-w-10 rounded-t-lg transition-all ${
                          day.isToday
                            ? "bg-amber-400"
                            : "bg-amber-500/50"
                        }`}
                        style={{
                          height: `${height}%`,
                        }}
                        title={`${day.minutes} minutes`}
                      />

                    </div>

                    <p
                      className={`text-[10px] sm:text-xs mt-3 ${
                        day.isToday
                          ? "text-amber-400 font-bold"
                          : "text-white/30"
                      }`}
                    >
                      {day.label}
                    </p>

                    <p className="text-[10px] text-white/20 mt-1">
                      {day.minutes}m
                    </p>
                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* STUDY BY CATEGORY */}

        <section className="bg-[#1E293B] border border-white/5 rounded-2xl p-6">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="font-bold text-lg">
                Study by Category
              </h2>

              <p className="text-white/30 text-xs mt-1">
                Where you are spending your study time.
              </p>
            </div>

            <CalendarDays
              size={20}
              className="text-amber-500"
            />

          </div>

          {analytics.categoryData.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">
              No study data available yet.
            </div>
          ) : (
            <div className="space-y-5">

              {analytics.categoryData.map(
                (category) => {
                  const percentage =
                    analytics.totalMinutes > 0
                      ? (category.minutes /
                          analytics.totalMinutes) *
                        100
                      : 0;

                  return (
                    <div
                      key={category.name}
                    >
                      <div className="flex items-center justify-between mb-2">

                        <div>
                          <p className="text-sm font-semibold">
                            {category.name}
                          </p>

                          <p className="text-[11px] text-white/30">
                            {category.sessions}{" "}
                            {category.sessions === 1
                              ? "session"
                              : "sessions"}
                          </p>
                        </div>

                        <span className="text-sm font-bold text-amber-400">
                          {formatStudyTime(
                            category.minutes
                          )}
                        </span>

                      </div>

                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">

                        <div
                          className="h-full bg-amber-500 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* RECENT SESSIONS */}

        <section className="bg-[#1E293B] border border-white/5 rounded-2xl p-6">

          <div className="mb-6">
            <h2 className="font-bold text-lg">
              Recent Study Sessions
            </h2>

            <p className="text-white/30 text-xs mt-1">
              Your latest learning activity.
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="py-12 text-center">

              <BookOpen
                size={40}
                className="mx-auto text-white/10 mb-3"
              />

              <p className="text-white/40 text-sm">
                No study sessions yet.
              </p>

              <p className="text-white/20 text-xs mt-1">
                Start studying from your library.
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {sessions
                .slice(0, 10)
                .map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5"
                  >

                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                      <BookOpen size={18} />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-semibold truncate">
                        {session.resourceTitle}
                      </p>

                      <p className="text-xs text-white/30 mt-1">
                        {session.category}
                      </p>

                    </div>

                    <div className="text-right shrink-0">

                      <p className="text-sm font-bold text-white">
                        {formatStudyTime(
                          session.durationMinutes
                        )}
                      </p>

                      <p
                        className={`text-[11px] mt-1 ${
                          session.completed
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {session.completed
                          ? "Completed"
                          : `${Math.round(
                              session.progress
                            )}% progress`}
                      </p>

                    </div>

                  </div>
                ))}

            </div>
          )}

        </section>

        {/* AI INSIGHTS */}

        <section className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">

          <div className="flex items-start gap-4 mb-6">

            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp size={22} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400">
                PrepSathi AI
              </p>

              <h2 className="text-lg font-bold mt-1">
                Your Study Insights
              </h2>

              <p className="text-sm text-white/30 mt-2 max-w-2xl">
                Insights generated from your study sessions,
                progress, and subject activity.
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {analytics.insights.map(
              (insight) => (
                <div
                  key={`${insight.type}-${insight.category ?? insight.title}`}
                  className="rounded-xl bg-white/[0.03] border border-white/5 p-5"
                >

                  <p className="text-[10px] uppercase tracking-widest font-bold text-purple-400">
                    {insight.type === "strength"
                      ? "Strength"
                      : insight.type === "weakness"
                      ? "Needs Attention"
                      : "Recommendation"}
                  </p>

                  <h3 className="text-sm font-bold text-white mt-2">
                    {insight.title}
                  </h3>

                  <p className="text-xs text-white/40 leading-relaxed mt-2">
                    {insight.description}
                  </p>

                </div>
              )
            )}

          </div>

        </section>

      </div>
    </div>
  );
}

function buildSevenDayActivity(
  sessions: StudySession[]
) {
  const today = new Date();

  const days = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(today);

      date.setHours(0, 0, 0, 0);

      date.setDate(
        today.getDate() - (6 - index)
      );

      return date;
    }
  );

  return days.map((date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    const minutes = sessions.reduce(
      (sum, session) => {
        const sessionDate =
          getSessionDate(
            session.createdAt
          );

        if (!sessionDate) {
          return sum;
        }

        if (
          sessionDate.getFullYear() === year &&
          sessionDate.getMonth() === month &&
          sessionDate.getDate() === day
        ) {
          return (
            sum +
            (session.durationMinutes || 0)
          );
        }

        return sum;
      },
      0
    );

    const isToday =
      date.getFullYear() ===
        today.getFullYear() &&
      date.getMonth() ===
        today.getMonth() &&
      date.getDate() ===
        today.getDate();

    return {
      key: `${year}-${month + 1}-${day}`,
      label: date.toLocaleDateString(
        "en-US",
        {
          weekday: "short",
        }
      ),
      minutes,
      isToday,
    };
  });
}

function getSessionDate(
  value: StudySession["createdAt"]
): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

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

function AnalyticsCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#1E293B] border border-white/5 rounded-2xl p-5">

      <div className="flex items-center justify-between mb-5">

        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
          {icon}
        </div>

      </div>

      <p className="text-xs text-white/30 uppercase tracking-widest font-semibold">
        {label}
      </p>

      <p className="text-2xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}