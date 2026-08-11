import {
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { Task } from "@/types/Task";
import { BaseService } from "./baseService";

class TaskService extends BaseService<Task> {
  constructor() {
    super("tasks");
  }

  async listByUser(userId: string): Promise<Task[]> {
    return this.list([
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    ]);
  }

  async markCompleted(id: string, completed: boolean) {
    await this.update(id, {
      completed,
      completedAt: completed
        ? serverTimestamp()
        : undefined,
    } as any);
  }
}

export const taskService = new TaskService();