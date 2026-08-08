import { Timestamp, FieldValue } from "firebase/firestore";
import { ResourceType } from "./Library";

export interface StudySession {
  id: string;

  userId: string;

  resourceId: string;

  resourceTitle: string;

  resourceType: ResourceType;

  resourceUrl: string;

  category: string;

  startedAt: Timestamp | FieldValue;

  endedAt?: Timestamp | FieldValue;

  durationMinutes: number;

  progress: number;

  completed: boolean;

  createdAt: Timestamp | FieldValue;
}