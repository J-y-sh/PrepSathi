import { StudySession } from "@/types/StudySession";

export interface StudyInsight {
  type: "strength" | "weakness" | "recommendation";
  title: string;
  description: string;
  category?: string;
}

interface CategoryStats {
  category: string;
  sessions: number;
  minutes: number;
  averageProgress: number;
}

class StudyInsightsService {
  analyze(
    sessions: StudySession[]
  ): StudyInsight[] {
    if (sessions.length === 0) {
      return [
        {
          type: "recommendation",
          title: "Start building your study profile",
          description:
            "Complete your first study session so PrepSathi can identify your strengths, weak areas, and next study recommendation.",
        },
      ];
    }

    /*
     * =======================================================
     * CATEGORY ANALYSIS
     * =======================================================
     */

    const categoryMap =
      new Map<string, CategoryStats>();

    for (const session of sessions) {
      const category =
        session.category?.trim() ||
        "Uncategorized";

      const existing =
        categoryMap.get(category);

      if (existing) {
        existing.sessions += 1;

        existing.minutes +=
          Number(session.durationMinutes) || 0;

        existing.averageProgress +=
          Number(session.progress) || 0;
      } else {
        categoryMap.set(category, {
          category,
          sessions: 1,
          minutes:
            Number(session.durationMinutes) || 0,
          averageProgress:
            Number(session.progress) || 0,
        });
      }
    }

    const categories =
      Array.from(categoryMap.values()).map(
        (item) => ({
          ...item,

          averageProgress:
            item.averageProgress /
            item.sessions,
        })
      );

    if (categories.length === 0) {
      return [
        {
          type: "recommendation",
          title: "Keep studying",
          description:
            "Complete more study sessions to build enough data for personalized recommendations.",
        },
      ];
    }

    /*
     * =======================================================
     * STRONGEST CATEGORY
     * =======================================================
     */

    const strongest =
      [...categories].sort(
        (a, b) =>
          b.averageProgress -
          a.averageProgress
      )[0];

    /*
     * =======================================================
     * MOST STUDIED CATEGORY
     * =======================================================
     */

    const mostStudied =
      [...categories].sort(
        (a, b) =>
          b.minutes - a.minutes
      )[0];

    /*
     * =======================================================
     * WEAKEST CATEGORY
     * =======================================================
     *
     * Lower progress + lower study time
     * means greater need for attention.
     */

    const weakest =
      [...categories].sort(
        (a, b) => {
          const scoreA =
            a.averageProgress * 0.7 +
            Math.min(
              a.minutes / 120,
              1
            ) *
              100 *
              0.3;

          const scoreB =
            b.averageProgress * 0.7 +
            Math.min(
              b.minutes / 120,
              1
            ) *
              100 *
              0.3;

          return scoreA - scoreB;
        }
      )[0];

    /*
     * =======================================================
     * COMPLETION RATE
     * =======================================================
     */

    const completedCount =
      sessions.filter(
        (session) =>
          session.completed
      ).length;

    const completionRate =
      Math.round(
        (completedCount /
          sessions.length) *
          100
      );

    /*
     * =======================================================
     * TOTAL STUDY TIME
     * =======================================================
     */

    const totalMinutes =
      sessions.reduce(
        (total, session) =>
          total +
          (Number(
            session.durationMinutes
          ) || 0),
        0
      );

    /*
     * =======================================================
     * AVERAGE SESSION
     * =======================================================
     */

    const averageSession =
      sessions.length > 0
        ? Math.round(
            totalMinutes /
              sessions.length
          )
        : 0;

    /*
     * =======================================================
     * BUILD INSIGHTS
     * =======================================================
     */

    return [
      {
        type: "strength",

        title:
          `Strongest area: ${strongest.category}`,

        description:
          `Your average progress in ${strongest.category} is ${Math.round(
            strongest.averageProgress
          )}%, based on ${strongest.sessions} ${
            strongest.sessions === 1
              ? "session"
              : "sessions"
          }.`,

        category:
          strongest.category,
      },

      {
        type: "weakness",

        title:
          `Needs attention: ${weakest.category}`,

        description:
          `${weakest.category} currently has an average progress of ${Math.round(
            weakest.averageProgress
          )}%. Give this area more focused study time.`,

        category:
          weakest.category,
      },

      {
        type: "recommendation",

        title:
          `Next focus: ${weakest.category}`,

        description:
          `Consider spending your next 30-minute study session on ${weakest.category} to strengthen your weaker area. You have studied ${mostStudied.category} the most so far.`,

        category:
          weakest.category,
      },

      {
        type: "recommendation",

        title:
          "Study consistency",

        description:
          `You have recorded ${sessions.length} study ${
            sessions.length === 1
              ? "session"
              : "sessions"
          }, totaling ${totalMinutes} minutes. Your average session is ${averageSession} minutes and your completion rate is ${completionRate}%.`,
      },
    ];
  }
}

export const studyInsightsService =
  new StudyInsightsService();