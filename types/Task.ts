import { FieldValue } from "firebase/firestore";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed";
  dueDate: FieldValue | null;
  createdAt: FieldValue;
}
