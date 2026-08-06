"use client";

import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/dashboard/BottomNav";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#020617]">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 pb-24 md:pb-8 overflow-y-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
