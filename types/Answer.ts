import { FieldValue } from "firebase/firestore";

export interface Answer {
  id: string;
  userId: string;
  questionId: string;
  content: string;
  feedback: string | null;
  score: number | null;
  createdAt: FieldValue;
}
