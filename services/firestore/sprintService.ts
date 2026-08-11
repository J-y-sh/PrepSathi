import {
  increment,
  serverTimestamp,
} from "firebase/firestore";

import { Sprint } from "@/types/Sprint";
import { BaseService } from "./baseService";
import { userService } from "./userService";

class SprintService extends BaseService<Sprint> {
  constructor() {
    super("sprints");
  }

  async completeSprint(
    userId: string,
    sprintData: Omit<
      Sprint,
      "id" | "userId" | "completedAt" | "status"
    >
  ): Promise<void> {
    const sprintId = crypto.randomUUID();

    const sprint: Sprint = {
      ...sprintData,
      id: sprintId,
      userId,
      status: "completed",
      completedAt: serverTimestamp(),
    };

    /*
     * Save the completed sprint.
     */
    await this.create(
      sprintId,
      sprint
    );

    /*
     * Update user-level gamification/study stats.
     *
     * durationMinutes is the actual focused duration
     * calculated by SprintMode.
     */
    const hoursEarned =
      Math.max(
        0,
        sprintData.durationMinutes
      ) / 60;

    await userService.update(
      userId,
      {
        xp: increment(
          Math.max(
            0,
            sprintData.xpAwarded
          )
        ),

        todayStudyHours:
          increment(hoursEarned),
      } as any
    );
  }
}

export const sprintService =
  new SprintService();