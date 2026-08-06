"use client";

import React from "react";
import {
  LayoutDashboard,
  Timer,
  Library,
  FlaskConical,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavStore } from "@/store/useNavStore";

const navItems = [
  { icon: LayoutDashboard, label: "Home", id: "dashboard" as const },
  { icon: Timer, label: "Sprint", id: "sprint" as const },
  { icon: Library, label: "Library", id: "library" as const },
  { icon: FlaskConical, label: "Sandbox", id: "sandbox" as const },
  { icon: BarChart3, label: "Data", id: "analytics" as const },
];

export function BottomNav() {
  const { activeTab, setActiveTab } = useNavStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0F1D]/80 backdrop-blur-lg border-t border-white/5 px-6 py-3 flex items-center justify-between z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            item.id === activeTab ? "text-amber-500" : "text-white/40"
          )}
        >
          <item.icon size={24} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
