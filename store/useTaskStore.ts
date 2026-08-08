import { create } from "zustand";
import { serverTimestamp } from "firebase/firestore";

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

  toggleComplete(id: string, completed: boolean): Promise<void>;

  deleteTask(id: string): Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],

  loading: false,

  error: null,

  fetchTasks: async (userId) => {
    set({ loading: true });

    try {
      const tasks = await taskService.listByUser(userId);

      set({
        tasks,
        loading: false,
      });
    } catch (e: any) {
      set({
        loading: false,
        error: e.message,
      });
    }
  },

  addTask: async (userId, task) => {
    const id = crypto.randomUUID();

    await taskService.create(id, {
      ...task,
      userId,
      completed: false,
      createdAt: serverTimestamp(),
    } as any);

    await get().fetchTasks(userId);
  },

  toggleComplete: async (id, completed) => {
    await taskService.markCompleted(id, !completed);

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !completed,
            }
          : task
      ),
    }));
  },

  deleteTask: async (id) => {
    await taskService.delete(id);

    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
    }));
  },
}));