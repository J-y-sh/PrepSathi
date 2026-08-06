import { FieldValue } from "firebase/firestore";

export interface User {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL: string | null;
  targetExam: string;
  createdAt: FieldValue;
  lastLogin: FieldValue;
  streak: number;
  xp: number;
  todayStudyHours: number;
  theme: "light" | "dark";
}
