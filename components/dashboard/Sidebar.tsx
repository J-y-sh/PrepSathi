"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  Timer,
  Library,
  FlaskConical,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthProvider";
import { useNavStore } from "@/store/useNavStore";

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    id: "dashboard" as const,
  },
  {
    icon: ListTodo,
    label: "Planner",
    id: "planner" as const,
  },
  {
    icon: BookOpen,
    label: "Syllabus",
    id: "syllabus" as const,
  },
  {
    icon: Timer,
    label: "Sprint",
    id: "sprint" as const,
  },
  {
    icon: Library,
    label: "Library",
    id: "library" as const,
  },
  {
    icon: FlaskConical,
    label: "Sandbox",
    id: "sandbox" as const,
  },
  {
    icon: BarChart3,
    label: "Analytics",
    id: "analytics" as const,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { logout } = useAuth();
  const { activeTab, setActiveTab } = useNavStore();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-[#0A0F1D] border-r border-white/5 transition-all duration-300 h-screen sticky top-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            PrepSathi
          </span>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center w-full gap-3 px-3 py-3 rounded-xl transition-all group",
                isActive
                  ? "bg-amber-500/10 text-amber-500"
                  : "text-white/60 hover:text-white hover:bg-white/5",
                isCollapsed && "justify-center"
              )}
              aria-label={isCollapsed ? item.label : undefined}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={22} />

              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 mt-auto border-t border-white/5">
        <button
          onClick={() => logout()}
          className={cn(
            "flex items-center w-full gap-3 px-3 py-3 rounded-xl text-white/60 hover:text-destructive hover:bg-destructive/10 transition-all group",
            isCollapsed && "justify-center"
          )}
          aria-label={isCollapsed ? "Logout" : undefined}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut size={22} />

          {!isCollapsed && (
            <span className="font-medium">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}