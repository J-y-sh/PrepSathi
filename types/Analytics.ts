import { FieldValue } from "firebase/firestore";

export interface Analytics {
  id: string;
  userId: string;
  date: string; // ISO date string for easy querying
  studyMinutes: number;
  tasksCompleted: number;
  xpGained: number;
  createdAt: FieldValue;
}
