"use client";

import React, {
  useState,
  useEffect,
  useMemo,
} from "react";

import {
  Plus,
  CheckCircle2,
  ListTodo,
  Loader2,
} from "lucide-react";

import { useAuth } from "@/features/auth/AuthProvider";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskCard } from "@/components/planner/TaskCard";
import { TaskDialog } from "@/components/planner/TaskDialog";
import { DeleteConfirmDialog } from "@/components/planner/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Task } from "@/types/Task";
import { Timestamp } from "firebase/firestore";

type FilterType =
  | "today"
  | "upcoming"
  | "completed";

export function PlannerMode() {
  const { user } = useAuth();

  const {
    tasks,
    loading,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
  } = useTaskStore();

  const [activeFilter, setActiveFilter] =
    useState<FilterType>("today");

  const [isDialogOpen, setIsDialogOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState<Task | undefined>(
      undefined
    );

  const [
    deletingTaskId,
    setDeletingTaskId,
  ] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchTasks(user.uid);
    }
  }, [user, fetchTasks]);

  const filteredTasks = useMemo(() => {
    const now = new Date();

    now.setHours(
      0,
      0,
      0,
      0
    );

    return tasks.filter((task) => {
      const taskDate =
        task.dueDate instanceof Timestamp
          ? task.dueDate.toDate()
          : task.dueDate
          ? new Date(
              task.dueDate as any
            )
          : null;

      if (taskDate) {
        taskDate.setHours(
          0,
          0,
          0,
          0
        );
      }

      if (
        activeFilter ===
        "completed"
      ) {
        return task.completed;
      }

      if (task.completed) {
        return false;
      }

      if (
        activeFilter ===
        "today"
      ) {
        return (
          !taskDate ||
          taskDate.getTime() <=
            now.getTime()
        );
      }

      if (
        activeFilter ===
        "upcoming"
      ) {
        return (
          !!taskDate &&
          taskDate.getTime() >
            now.getTime()
        );
      }

      return true;
    });
  }, [
    tasks,
    activeFilter,
  ]);

  const stats = useMemo(() => {
    const total =
      tasks.length;

    const completed =
      tasks.filter(
        (task) =>
          task.completed
      ).length;

    const percentage =
      total === 0
        ? 0
        : Math.round(
            (completed /
              total) *
              100
          );

    return {
      total,
      completed,
      percentage,
    };
  }, [tasks]);

  const handleSaveTask = async (
    title: string,
    description: string,
    dueDate?: Date
  ) => {
    if (!user) return;

    if (editingTask) {
      await updateTask(
        editingTask.id,
        {
          title,
          description,
          dueDate:
            dueDate
              ? Timestamp.fromDate(
                  dueDate
                )
              : undefined,
        }
      );
    } else {
      await addTask(
        user.uid,
        {
          title,
          description,
          dueDate:
            dueDate
              ? Timestamp.fromDate(
                  dueDate
                )
              : undefined,
          subject:
            "General",
          priority:
            "medium",
        }
      );
    }

    setEditingTask(
      undefined
    );

    setIsDialogOpen(
      false
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-4 space-y-8 pb-32">

      {/* Header & Stats */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">

        <div className="space-y-4 flex-1">

          <div className="flex items-center gap-3">

            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
              <ListTodo
                size={24}
              />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Daily Planner
              </h2>

              <p className="text-white/40 text-sm">
                Organize your study sessions effectively.
              </p>
            </div>

          </div>

          <div className="space-y-2">

            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-white/40">
              <span>
                Overall Progress
              </span>

              <span className="text-amber-500">
                {stats.percentage}%
              </span>
            </div>

            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">

              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{
                  width: `${stats.percentage}%`,
                }}
              />

            </div>

          </div>

        </div>

        <Button
          onClick={() => {
            setEditingTask(
              undefined
            );

            setIsDialogOpen(
              true
            );
          }}
          className="bg-amber-500 hover:bg-amber-600 text-[#020617] font-bold h-12 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/10"
        >
          <Plus size={20} />
          Add Task
        </Button>

      </div>

      {/* Filters */}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">

        {(
          [
            "today",
            "upcoming",
            "completed",
          ] as FilterType[]
        ).map((filter) => (
          <button
            key={filter}
            onClick={() =>
              setActiveFilter(
                filter
              )
            }
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap border",
              activeFilter ===
                filter
                ? "bg-white text-[#020617] border-white shadow-lg"
                : "bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white"
            )}
          >
            {filter}
          </button>
        ))}

      </div>

      {/* Task List */}

      <div className="space-y-3 min-h-[400px]">

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/20">
            <Loader2
              className="animate-spin mb-2"
              size={32}
            />

            <p className="text-sm font-medium">
              Syncing with Firestore...
            </p>
          </div>
        ) : filteredTasks.length >
          0 ? (
          filteredTasks.map(
            (task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={
                  toggleTaskStatus
                }
                onDelete={
                  setDeletingTaskId
                }
                onEdit={(task) => {
                  setEditingTask(
                    task
                  );

                  setIsDialogOpen(
                    true
                  );
                }}
              />
            )
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">

            <div className="p-6 rounded-full bg-white/5 text-white/10">
              <CheckCircle2
                size={48}
              />
            </div>

            <div className="space-y-1">

              <h3 className="text-white/60 font-bold">
                No tasks found
              </h3>

              <p className="text-white/20 text-sm max-w-[200px]">
                {activeFilter ===
                "completed"
                  ? "Finish a task to see it here!"
                  : "Enjoy your free time or add a new goal."}
              </p>

            </div>

          </div>
        )}

      </div>

      {/* Dialogs */}

      <TaskDialog
        isOpen={
          isDialogOpen
        }
        onClose={() => {
          setIsDialogOpen(
            false
          );

          setEditingTask(
            undefined
          );
        }}
        onSave={
          handleSaveTask
        }
        initialData={
          editingTask
        }
      />

      <DeleteConfirmDialog
        isOpen={
          !!deletingTaskId
        }
        onClose={() =>
          setDeletingTaskId(
            null
          )
        }
        onConfirm={() => {
          if (
            deletingTaskId
          ) {
            deleteTask(
              deletingTaskId
            );

            setDeletingTaskId(
              null
            );
          }
        }}
      />

    </div>
  );
}