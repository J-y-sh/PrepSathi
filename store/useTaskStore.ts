import { create } from "zustand";
import { Task } from "@/types/Task";
import { taskService } from "@/services/firestore/taskService";
import { where, orderBy, Timestamp } from "firebase/firestore";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (userId: string) => Promise<void>;
  addTask: (userId: string, title: string, description: string, dueDate?: Date) => Promise<void>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskService.list([
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      ]);
      set({ tasks, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addTask: async (userId: string, title: string, description: string, dueDate?: Date) => {
    const taskId = crypto.randomUUID();
    const newTask: Omit<Task, "id" | "createdAt"> = {
      userId,
      title,
      description,
      status: "todo",
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
    };

    try {
      await taskService.createWithTimestamp(taskId, newTask);
      // Optimistic update or refetch
      get().fetchTasks(userId);
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  updateTask: async (taskId: string, data: Partial<Task>) => {
    try {
      await taskService.update(taskId, data as any);
      const { tasks } = get();
      set({
        tasks: tasks.map((t) => (t.id === taskId ? { ...t, ...data } : t)),
      });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  deleteTask: async (taskId: string) => {
    try {
      await taskService.delete(taskId);
      const { tasks } = get();
      set({ tasks: tasks.filter((t) => t.id !== taskId) });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  toggleTaskStatus: async (taskId: string) => {
    const { tasks } = get();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === "completed" ? "todo" : "completed";
    await get().updateTask(taskId, { status: newStatus });
  },
}));
