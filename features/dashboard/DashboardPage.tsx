"use client";

import React from "react";

import AnalyticsPage from "@/app/analytics/page";

import { CountdownCard } from "@/components/dashboard/CountdownCard";
import { SprintCard } from "@/components/dashboard/SprintCard";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StudyOverviewCard } from "@/components/dashboard/StudyOverviewCard";
import { DashboardLayout } from "./DashboardLayout";

import {
  Newspaper,
  Layers,
  PenTool,
} from "lucide-react";

import { useNavStore } from "@/store/useNavStore";
import { useStudySessionStore } from "@/store/useStudySessionStore";

import { SprintMode } from "@/features/sprint/SprintMode";
import { PlannerMode } from "@/features/planner/PlannerMode";
import { LibraryMode } from "@/features/library/LibraryMode";
import { StudyMode } from "@/features/study/StudyMode";

import { useSyncUser } from "@/hooks/useSyncUser";

export function DashboardPage() {
  const {
    activeTab,
    setActiveTab,
  } = useNavStore();

  const {
    currentSession,
  } = useStudySessionStore();

  useSyncUser();

  /*
   * If a study session is active, show Study Mode.
   *
   * This sits above normal navigation so that
   * starting a study session takes the user directly
   * into the focused study experience.
   */
  if (currentSession) {
    return (
      <StudyMode
        onBack={() => {
          setActiveTab("library");
        }}
      />
    );
  }

  return (
    <DashboardLayout>
      {activeTab === "dashboard" ? (
        <div className="px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <CountdownCard />

          <SprintCard />

          <ProgressCard />

          <StudyOverviewCard />

          {/* Current Affairs */}

          <DashboardCard title="Current Affairs">
            <div className="flex items-center gap-4 py-2">

              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <Newspaper size={20} />
              </div>

              <p className="text-white/40 text-sm">
                No new updates today.
              </p>

            </div>
          </DashboardCard>

          {/* Flashcards */}

          <DashboardCard title="Flashcards Due">
            <div className="flex items-center gap-4 py-2">

              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <Layers size={20} />
              </div>

              <p className="text-white/40 text-sm">
                All caught up!
              </p>

            </div>
          </DashboardCard>

          {/* Answer Writing */}

          <DashboardCard title="Daily Answer Writing">
            <div className="flex items-center gap-4 py-2">

              <div className="p-2.5 rounded-xl bg-[#10B981]/10 text-[#10B981]">
                <PenTool size={20} />
              </div>

              <p className="text-white/40 text-sm">
                Next topic at 9:00 AM.
              </p>

            </div>
          </DashboardCard>

        </div>

      ) : activeTab === "sprint" ? (

        <SprintMode />

      ) : activeTab === "planner" ? (

        <PlannerMode />

      ) : activeTab === "library" ? (

        <LibraryMode />

      ) : activeTab === "analytics" ? (

        <AnalyticsPage />

      ) : (

        <div className="px-6 py-20 flex flex-col items-center justify-center text-center space-y-4">

          <div className="p-6 rounded-full bg-white/5 text-white/20">
            <Layers size={64} />
          </div>

          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
            {activeTab} Coming Soon
          </h2>

          <p className="text-white/40 max-w-xs">
            We are currently building this feature. Stay tuned!
          </p>

        </div>
      )}
    </DashboardLayout>
  );
}