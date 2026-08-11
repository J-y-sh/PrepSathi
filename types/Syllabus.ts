export type ExamStage = "prelims" | "mains";

export type SyllabusPaper =
  | "gs1"
  | "gs2"
  | "gs3"
  | "gs4"
  | "essay"
  | "optional"
  | "prelims-gs"
  | "csat";

export interface SyllabusTopic {
  id: string;
  name: string;
  description?: string;
  children?: SyllabusTopic[];
}

export interface SyllabusSubject {
  id: string;
  name: string;
  paper: SyllabusPaper;
  topics: SyllabusTopic[];
}

export interface SyllabusSection {
  id: string;
  name: string;
  stage: ExamStage;
  subjects: SyllabusSubject[];
}

export interface UPSCSyllabus {
  id: string;
  exam: "UPSC CSE";
  targetYear: number;
  sections: SyllabusSection[];
}