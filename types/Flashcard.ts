import { FieldValue } from "firebase/firestore";

export interface Flashcard {
  id: string;
  userId: string;
  front: string;
  back: string;
  tags: string[];
  difficulty: "easy" | "medium" | "hard";
  nextReview: FieldValue;
  createdAt: FieldValue;
}
