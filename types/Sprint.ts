import { FieldValue } from "firebase/firestore";

export interface Sprint {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  xpAwarded: number;
  status: "completed" | "abandoned";
  completedAt: FieldValue;
}
