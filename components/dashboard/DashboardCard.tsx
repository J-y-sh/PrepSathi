"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function DashboardCard({ children, className, title }: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "bg-[#1E293B] rounded-2xl p-5 shadow-lg border border-white/5 flex flex-col gap-3",
        className
      )}
    >
      {title && (
        <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="flex-1">{children}</div>
    </motion.div>
  );
}
