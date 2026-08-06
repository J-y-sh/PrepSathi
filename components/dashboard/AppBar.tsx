"use client";

import React from "react";
import { Bell, Settings } from "lucide-react";
import { useAuth } from "@/features/auth/AuthProvider";

export function AppBar() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="flex items-center justify-between px-6 py-4 md:py-8 bg-transparent">
      <div className="flex flex-col">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Hi, {user?.displayName?.split(" ")[0] || "Scholar"} 👋
        </h1>
        <p className="text-white/40 text-sm">{today}</p>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button className="p-2.5 rounded-xl bg-[#1E293B] border border-white/5 text-white/60 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        <button className="p-2.5 rounded-xl bg-[#1E293B] border border-white/5 text-white/60 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
