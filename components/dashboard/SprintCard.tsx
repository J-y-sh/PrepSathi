"use client";

import React from "react";
import { Timer } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { Button } from "@/components/ui/button";
import { useNavStore } from "@/store/useNavStore";

export function SprintCard() {
  const { setActiveTab } = useNavStore();

  return (
    <DashboardCard title="Today's Sprint">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Timer size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">Focus Session</span>
            <span className="text-sm text-white/40">15 Minute Quick Sprint</span>
          </div>
        </div>
        <Button
          onClick={() => setActiveTab("sprint")}
          className="w-full bg-amber-500 hover:bg-amber-600 text-[#020617] font-bold h-12 rounded-xl"
        >
          Start Sprint
        </Button>
      </div>
    </DashboardCard>
  );
}
