"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Type, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/Task";
import { Timestamp } from "firebase/firestore";

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string, dueDate?: Date) => void;
  initialData?: Task;
}

export function TaskDialog({ isOpen, onClose, onSave, initialData }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      if (initialData.dueDate) {
        const date = initialData.dueDate instanceof Timestamp
          ? initialData.dueDate.toDate()
          : new Date(initialData.dueDate as any);
        setDueDate(date.toISOString().split("T")[0]);
      }
    } else {
      setTitle("");
      setDescription("");
      setDueDate("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title, description, dueDate ? new Date(dueDate) : undefined);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="relative w-full max-w-lg bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/5"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">
                {initialData ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <Type size={14} /> Title
                </label>
                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <AlignLeft size={14} /> Description
                </label>
                <textarea
                  placeholder="Add some details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-2">
                  <Calendar size={14} /> Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 [color-scheme:dark]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl text-white/60 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-[#020617] font-bold h-12 rounded-xl"
                >
                  {initialData ? "Update Task" : "Create Task"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
