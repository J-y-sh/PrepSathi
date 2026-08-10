"use client";

import React from "react";
import { Task } from "@/types/Task";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Timestamp } from "firebase/firestore";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({
  task,
  onToggle,
  onDelete,
  onEdit,
}: TaskCardProps) {
  const isCompleted =
    task.completed;

  const formatDate = (
    date: Timestamp | Date | undefined
  ) => {
    if (!date) return null;

    const d =
      date instanceof Timestamp
        ? date.toDate()
        : date;

    return d.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  };

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.95,
      }}
      className={cn(
        "group bg-[#1E293B] border border-white/5 rounded-2xl p-4 flex items-start gap-4 transition-all hover:bg-[#1E293B]/80",
        isCompleted &&
          "opacity-60"
      )}
    >
      <button
        onClick={() =>
          onToggle(task.id)
        }
        className={cn(
          "mt-1 transition-colors",
          isCompleted
            ? "text-[#10B981]"
            : "text-white/20 hover:text-white/40"
        )}
      >
        {isCompleted ? (
          <CheckCircle2
            size={22}
          />
        ) : (
          <Circle size={22} />
        )}
      </button>

      <div className="flex-1 min-w-0 space-y-1">
        <h4
          className={cn(
            "font-semibold text-white truncate",
            isCompleted &&
              "line-through text-white/40"
          )}
        >
          {task.title}
        </h4>

        {task.description && (
          <p className="text-sm text-white/40 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
            {task.subject}
          </span>

          {task.priority && (
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                task.priority ===
                  "high"
                  ? "text-red-400"
                  : task.priority ===
                    "medium"
                  ? "text-amber-400"
                  : "text-emerald-400"
              )}
            >
              {task.priority}
            </span>
          )}
        </div>

        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-500/80 pt-1">
            <Clock size={12} />
            <span>
              {formatDate(
                task.dueDate
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() =>
            onEdit(task)
          }
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
        >
          <Edit2 size={16} />
        </button>

        <button
          onClick={() =>
            onDelete(task.id)
          }
          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}