import { Timestamp } from "firebase/firestore";

export type Priority = "low" | "medium" | "high";

export type TaskStage = "prelims" | "mains";

export interface Task {
  id: string;

  userId: string;

  title: string;

  description?: string;

  subject: string;

  topicId?: string;

  stage?: TaskStage;

  priority: Priority;

  completed: boolean;

  dueDate?: Timestamp;

  createdAt: Timestamp;

  completedAt?: Timestamp;

  color?: string;

  estimatedMinutes?: number;
}