import { FieldValue } from "firebase/firestore";

export type ResourceType = "pdf" | "youtube" | "link";

export interface LibraryResource {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: string;
  type: ResourceType;
  url: string;
  isFavorite: boolean;
  lastOpenedAt?: FieldValue;
  createdAt: FieldValue;
}
