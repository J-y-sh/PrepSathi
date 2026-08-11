"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
} from "lucide-react";

import { syllabusService } from "@/services/syllabus/syllabusService";
import {
  syllabusProgressService,
  type SyllabusProgressStatus,
} from "@/services/firestore/syllabusProgressService";

import { useAuth } from "@/features/auth/AuthProvider";
import type { SyllabusTopic } from "@/types/Syllabus";

const statuses: {
  value: SyllabusProgressStatus;
  label: string;
}[] = [
  { value: "not-started", label: "Not started" },
  { value: "learning", label: "Learning" },
  { value: "revising", label: "Revising" },
  { value: "completed", label: "Completed" },
];

function TopicItem({
  topic,
  progress,
  onStatusChange,
}: {
  topic: SyllabusTopic;
  progress: Record<string, SyllabusProgressStatus>;
  onStatusChange: (
    topicId: string,
    status: SyllabusProgressStatus
  ) => void;
}) {
  const [open, setOpen] = useState(false);

  const hasChildren = Boolean(topic.children?.length);

  const status = progress[topic.id] ?? "not-started";

  const statusLabel =
    statuses.find((item) => item.value === status)?.label ??
    "Not started";

  const nextStatus: SyllabusProgressStatus =
    status === "not-started"
      ? "learning"
      : status === "learning"
        ? "revising"
        : status === "revising"
          ? "completed"
          : "not-started";

  return (
    <div className="border-b border-slate-800/70 last:border-0">
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => hasChildren && setOpen(!open)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {hasChildren ? (
            open ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            )
          ) : (
            <div className="w-4 shrink-0" />
          )}

          <span className="truncate text-sm text-slate-200">
            {topic.name}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange(topic.id, nextStatus)}
          title={`Change status. Current: ${statusLabel}`}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs"
        >
          {status === "completed" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          ) : (
            <Circle
              className={`h-4 w-4 ${
                status === "learning"
                  ? "text-amber-400"
                  : status === "revising"
                    ? "text-blue-400"
                    : "text-slate-600"
              }`}
            />
          )}

          <span className="hidden text-slate-400 sm:inline">
            {statusLabel}
          </span>
        </button>
      </div>

      {open && topic.children?.length ? (
        <div className="ml-7 border-l border-slate-700">
          {topic.children.map((child) => (
            <TopicItem
              key={child.id}
              topic={child}
              progress={progress}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function SyllabusPage() {
  const { user } = useAuth();

  const syllabus = syllabusService.getSyllabus();

  const [stage, setStage] = useState<"prelims" | "mains">("prelims");

  const [progress, setProgress] = useState<
    Record<string, SyllabusProgressStatus>
  >({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      if (!user) {
        if (active) {
          setProgress({});
          setLoading(false);
        }

        return;
      }

      try {
        const records =
          await syllabusProgressService.listByUser(user.uid);

        if (!active) return;

        const mapped: Record<
          string,
          SyllabusProgressStatus
        > = {};

        for (const record of records) {
          mapped[record.topicId] = record.status;
        }

        setProgress(mapped);
      } catch (error) {
        console.error(
          "Failed to load syllabus progress:",
          error
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, [user]);

  const section = syllabus.sections.find(
    (item) => item.stage === stage
  );

  const allTopics = useMemo(() => {
    const topics: SyllabusTopic[] = [];

    function collect(items: SyllabusTopic[]) {
      for (const topic of items) {
        topics.push(topic);

        if (topic.children?.length) {
          collect(topic.children);
        }
      }
    }

    section?.subjects.forEach((subject) => {
      collect(subject.topics);
    });

    return topics;
  }, [section]);

  const completedCount = allTopics.filter(
    (topic) => progress[topic.id] === "completed"
  ).length;

  const progressPercentage =
    allTopics.length > 0
      ? Math.round(
          (completedCount / allTopics.length) * 100
        )
      : 0;

  async function handleStatusChange(
    topicId: string,
    status: SyllabusProgressStatus
  ) {
    if (!user) {
      alert("Please sign in to save syllabus progress.");
      return;
    }

    setProgress((current) => ({
      ...current,
      [topicId]: status,
    }));

    try {
      await syllabusProgressService.setStatus(
        user.uid,
        topicId,
        status
      );
    } catch (error) {
      console.error(
        "Failed to save syllabus progress:",
        error
      );

      setProgress((current) => {
        const next = { ...current };
        delete next[topicId];
        return next;
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] px-4 pb-24 pt-6 text-white md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-amber-400" />

            <span className="text-sm font-medium text-amber-400">
              UPSC CSE {syllabus.targetYear}
            </span>
          </div>

          <h1 className="text-2xl font-bold md:text-3xl">
            Syllabus
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Track your preparation topic by topic.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-[#1E293B] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-slate-400">
              {stage === "prelims" ? "Prelims" : "Mains"} completion
            </span>

            <span className="font-semibold text-amber-400">
              {progressPercentage}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-slate-500">
            {completedCount} of {allTopics.length} topics completed
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => setStage("prelims")}
            className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
              stage === "prelims"
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400"
            }`}
          >
            Prelims
          </button>

          <button
            type="button"
            onClick={() => setStage("mains")}
            className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
              stage === "mains"
                ? "bg-amber-500 text-slate-950"
                : "text-slate-400"
            }`}
          >
            Mains
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-800 bg-[#1E293B] p-6 text-center text-sm text-slate-400">
            Loading your progress...
          </div>
        ) : (
          <div className="space-y-4">
            {section?.subjects.map((subject) => (
              <section
                key={subject.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-[#1E293B]"
              >
                <div className="border-b border-slate-800 px-4 py-4">
                  <h2 className="font-semibold text-white">
                    {subject.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    {subject.topics.length} topics
                  </p>
                </div>

                {subject.topics.length > 0 ? (
                  <div>
                    {subject.topics.map((topic) => (
                      <TopicItem
                        key={topic.id}
                        topic={topic}
                        progress={progress}
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-5 text-sm text-slate-500">
                    Detailed topics will be added here.
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}