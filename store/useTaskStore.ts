import { create } from "zustand";
import { serverTimestamp, Timestamp } from "firebase/firestore";

import { Task } from "@/types/Task";
import { taskService } from "@/services/firestore/taskService";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  fetchTasks(userId: string): Promise<void>;

  addTask(
    userId: string,
    task: Omit<
      Task,
      | "id"
      | "userId"
      | "createdAt"
      | "completed"
      | "completedAt"
    >
  ): Promise<void>;

  updateTask(
    id: string,
    updates: Partial<
      Pick<
        Task,
        | "title"
        | "description"
        | "subject"
        | "priority"
        | "dueDate"
        | "color"
        | "estimatedMinutes"
      >
    >
  ): Promise<void>;

  toggleComplete(
    id: string,
    completed: boolean
  ): Promise<void>;

  toggleTaskStatus(
    id: string
  ): Promise<void>;

  deleteTask(
    id: string
  ): Promise<void>;
}

export const useTaskStore =
  create<TaskStore>((set, get) => ({
    tasks: [],

    loading: false,

    error: null,

    // =======================================================
    // FETCH TASKS
    // =======================================================

    fetchTasks: async (userId) => {
      set({
        loading: true,
        error: null,
      });

      try {
        const tasks =
          await taskService.listByUser(userId);

        set({
          tasks,
          loading: false,
        });
      } catch (e: unknown) {
        console.error(
          "TaskStore: failed to fetch tasks:",
          e
        );

        set({
          loading: false,
          error:
            e instanceof Error
              ? e.message
              : "Failed to load tasks.",
        });
      }
    },

    // =======================================================
    // ADD TASK
    // =======================================================

    addTask: async (userId, task) => {
      const id =
        crypto.randomUUID();

      await taskService.create(id, {
        ...task,
        userId,
        completed: false,
        createdAt: serverTimestamp(),
      });

      await get().fetchTasks(userId);
    },

    // =======================================================
    // UPDATE TASK
    // =======================================================

    updateTask: async (
      id,
      updates
    ) => {
      await taskService.update(
        id,
        updates
      );

      set((state) => ({
        tasks: state.tasks.map(
          (task) =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                }
              : task
        ),
      }));
    },

    // =======================================================
    // TOGGLE COMPLETE
    // =======================================================

    toggleComplete: async (
      id,
      completed
    ) => {
      const nextCompleted =
        !completed;

      await taskService.markCompleted(
        id,
        nextCompleted
      );

      set((state) => ({
        tasks: state.tasks.map(
          (task) =>
            task.id === id
              ? {
                  ...task,
                  completed:
                    nextCompleted,
                  completedAt:
                    nextCompleted
                      ? Timestamp.now()
                      : undefined,
                }
              : task
        ),
      }));
    },

    // =======================================================
    // TOGGLE TASK STATUS
    // =======================================================

    toggleTaskStatus: async (
      id
    ) => {
      const task =
        get().tasks.find(
          (item) =>
            item.id === id
        );

      if (!task) return;

      await get().toggleComplete(
        id,
        task.completed
      );
    },

    // =======================================================
    // DELETE TASK
    // =======================================================

    deleteTask: async (
      id
    ) => {
      await taskService.delete(id);

      set((state) => ({
        tasks:
          state.tasks.filter(
            (task) =>
              task.id !== id
          ),
      }));
    },
  }));