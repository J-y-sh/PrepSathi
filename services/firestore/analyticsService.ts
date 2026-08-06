import { where, serverTimestamp } from "firebase/firestore";
import { Analytics } from "@/types/Analytics";
import { BaseService } from "./baseService";

class AnalyticsService extends BaseService<Analytics> {
  constructor() {
    super("analytics");
  }

  async listByUser(userId: string): Promise<Analytics[]> {
    return this.list([where("userId", "==", userId)]);
  }

  async createWithTimestamp(id: string, data: Omit<Analytics, "id" | "createdAt">): Promise<void> {
    await this.create(id, {
      ...data,
      createdAt: serverTimestamp(),
    } as any);
  }
}

export const analyticsService = new AnalyticsService();
