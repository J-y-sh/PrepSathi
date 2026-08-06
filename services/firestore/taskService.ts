import { where, serverTimestamp } from "firebase/firestore";
import { Task } from "@/types/Task";
import { BaseService } from "./baseService";

class TaskService extends BaseService<Task> {
  constructor() {
    super("tasks");
  }

  async listByUser(userId: string): Promise<Task[]> {
    return this.list([where("userId", "==", userId)]);
  }

  async createWithTimestamp(id: string, data: Omit<Task, "id" | "createdAt">): Promise<void> {
    await this.create(id, {
      ...data,
      createdAt: serverTimestamp(),
    } as any);
  }
}

export const taskService = new TaskService();
