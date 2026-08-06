"use client";

import React from "react";
import { DashboardCard } from "./DashboardCard";

export function ProgressCard() {
  const progress = 0; // 0 hours out of 8
  const target = 8;

  return (
    <DashboardCard title="Study Progress">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-3xl font-bold text-[#10B981]">{progress}h</span>
            <span className="text-xs text-white/40 uppercase tracking-tighter">Completed</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xl font-bold text-white/80">{target}h</span>
            <span className="text-xs text-white/40 uppercase tracking-tighter">Target</span>
          </div>
        </div>

        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-[#10B981] rounded-full transition-all duration-1000"
            style={{ width: `${(progress / target) * 100}%` }}
          />
        </div>

        <p className="text-[10px] text-white/30 text-center italic">
          Consistency is the key to UPSC success.
        </p>
      </div>
    </DashboardCard>
  );
}
