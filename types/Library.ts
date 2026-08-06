import { FieldValue } from "firebase/firestore";

export interface Library {
  id: string;
  title: string;
  category: string;
  content: string;
  url: string;
  createdAt: FieldValue;
}
