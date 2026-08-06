"use client";

import React, { useEffect, useState } from "react";
import { DashboardCard } from "./DashboardCard";

export function CountdownCard() {
  const [daysLeft, setDaysLeft] = useState(0);
  const targetDate = new Date("2028-05-28");

  useEffect(() => {
    const calculateDays = () => {
      const diff = targetDate.getTime() - new Date().getTime();
      setDaysLeft(Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };
    calculateDays();
  }, []);

  return (
    <DashboardCard title="UPSC Countdown">
      <div className="flex flex-col gap-1">
        <span className="text-4xl font-black text-amber-500">{daysLeft}</span>
        <span className="text-sm text-white/60 font-medium">Days until Prelims 2028</span>
        <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 w-1/3 rounded-full" />
        </div>
      </div>
    </DashboardCard>
  );
}
