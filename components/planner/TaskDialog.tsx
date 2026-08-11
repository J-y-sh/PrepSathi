"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Type,
  AlignLeft,
  BookOpen,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Task, TaskStage } from "@/types/Task";
import { Timestamp } from "firebase/firestore";
import { syllabusService } from "@/services/syllabus/syllabusService";

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    title: string,
    description: string,
    dueDate?: Date,
    subject?: string,
    topicId?: string,
    stage?: TaskStage
  ) => void;
  initialData?: Task;
}

export function TaskDialog({
  isOpen,
  onClose,
  onSave,
  initialData,
}: TaskDialogProps) {
  const syllabus = syllabusService.getSyllabus();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [stage, setStage] = useState<TaskStage>("prelims");
  const [subject, setSubject] = useState("");
  const [topicId, setTopicId] = useState("");

  const selectedSection = useMemo(
    () =>
      syllabus.sections.find(
        (section) => section.stage === stage
      ),
    [syllabus.sections, stage]
  );

  const subjects = selectedSection?.subjects ?? [];

  const selectedSubject = subjects.find(
    (item) => item.id === subject
  );

  const topics = selectedSubject?.topics ?? [];

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");

      setStage(initialData.stage ?? "prelims");
      setSubject(initialData.subject || "");
      setTopicId(initialData.topicId || "");

      if (initialData.dueDate) {
        const date =
          initialData.dueDate instanceof Timestamp
            ? initialData.dueDate.toDate()
            : new Date(initialData.dueDate);

        setDueDate(
          date.toISOString().split("T")[0]
        );
      } else {
        setDueDate("");
      }
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
      setStage("prelims");
      setSubject("");
      setTopicId("");
    }
  }, [initialData, isOpen]);

  const handleStageChange = (
    nextStage: TaskStage
  ) => {
    setStage(nextStage);
    setSubject("");
    setTopicId("");
  };

  const handleSubjectChange = (
    nextSubject: string
  ) => {
    setSubject(nextSubject);
    setTopicId("");
  };

  const handleSubmit = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!title.trim()) return;

    onSave(
      title.trim(),
      description.trim(),
      dueDate
        ? new Date(dueDate)
        : undefined,
      subject || undefined,
      topicId || undefined,
      stage
    );

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{
              opacity: 0,
              y: 100,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 100,
              scale: 0.95,
            }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/5 bg-[#1E293B] p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {initialData
                  ? "Edit Task"
                  : "New Study Task"}
              </h2>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Stage */}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <BookOpen size={14} />
                  Exam Stage
                </label>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#0A0F1D] p-1">
                  {(
                    [
                      "prelims",
                      "mains",
                    ] as TaskStage[]
                  ).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        handleStageChange(item)
                      }
                      className={`rounded-lg px-3 py-2.5 text-sm font-semibold capitalize transition ${
                        stage === item
                          ? "bg-amber-500 text-[#020617]"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Subject
                </label>

                <select
                  value={subject}
                  onChange={(e) =>
                    handleSubjectChange(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0A0F1D] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">
                    Select subject
                  </option>

                  {subjects.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Topic */}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  Topic
                </label>

                <select
                  value={topicId}
                  onChange={(e) =>
                    setTopicId(e.target.value)
                  }
                  disabled={!subject}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0F1D] px-4 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="">
                    {subject
                      ? "Select topic"
                      : "Select subject first"}
                  </option>

                  {topics.map((topic) => (
                    <option
                      key={topic.id}
                      value={topic.id}
                    >
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <Type size={14} />
                  Task
                </label>

                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="e.g. Read Fundamental Rights"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0A0F1D] px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Description */}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <AlignLeft size={14} />
                  Notes
                </label>

                <textarea
                  placeholder="What exactly do you want to complete?"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#0A0F1D] px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Due Date */}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
                  <Calendar size={14} />
                  Due Date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0A0F1D] px-4 py-3 text-white [color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="h-12 flex-1 rounded-xl text-white/60 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="h-12 flex-1 rounded-xl bg-amber-500 font-bold text-[#020617] hover:bg-amber-600"
                >
                  {initialData
                    ? "Update Task"
                    : "Create Task"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}