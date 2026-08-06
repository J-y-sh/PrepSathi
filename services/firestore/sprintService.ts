import { serverTimestamp } from "firebase/firestore";
import { Sprint } from "@/types/Sprint";
import { BaseService } from "./baseService";
import { userService } from "./userService";
import { increment } from "firebase/firestore";

class SprintService extends BaseService<Sprint> {
  constructor() {
    super("sprints");
  }

  async completeSprint(userId: string, sprintData: Omit<Sprint, "id" | "userId" | "completedAt" | "status">): Promise<void> {
    const sprintId = crypto.randomUUID();
    const sprint: Sprint = {
      ...sprintData,
      id: sprintId,
      userId,
      status: "completed",
      completedAt: serverTimestamp(),
    };

    // Save the sprint record
    await this.create(sprintId, sprint);

    // Update user stats
    const hoursEarned = sprintData.durationMinutes / 60;
    await userService.update(userId, {
      xp: increment(sprintData.xpAwarded),
      todayStudyHours: increment(hoursEarned),
    } as any);
  }
}

export const sprintService = new SprintService();
