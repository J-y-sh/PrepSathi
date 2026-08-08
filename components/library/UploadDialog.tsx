"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Upload,
  CirclePlay,
  Link as LinkIcon,
  FileText,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceType } from "@/types/Library";
import { cn } from "@/lib/utils";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: { title: string; category: string; type: ResourceType; url?: string; file?: File }) => Promise<void>;
}

const CATEGORIES = [
  "General Studies", "History", "Geography", "Polity",
  "Economy", "Environment", "Science", "Ethics", "CSAT"
];

export function UploadDialog({ isOpen, onClose, onUpload }: UploadDialogProps) {
  const [type, setType] = useState<ResourceType>("pdf");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (type === "pdf" && !file) || (type !== "pdf" && !url)) return;

    setLoading(true);
    try {
      await onUpload({ title, category, type, url, file: file || undefined });
      onClose();
      // Reset
      setTitle("");
      setUrl("");
      setFile(null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
              <h2 className="text-xl font-bold text-white">Add to Library</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-white/40"><X size={20} /></button>
            </div>

            <div className="flex gap-2 mb-8 p-1 bg-[#0A0F1D] rounded-2xl">
              {(["pdf", "youtube", "link"] as ResourceType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    type === t ? "bg-amber-500 text-[#020617]" : "text-white/40 hover:text-white"
                  )}
                >
                  {t === "pdf" && <FileText size={14} />}
                  {t === "youtube" && <CirclePlay size={14} />}
                  {t === "link" && <LinkIcon size={14} />}
                  {t}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Resource Name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {type === "pdf" ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">File</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="text-white/20 mb-2" size={24} />
                      <p className="text-xs text-white/40">{file ? file.name : "Select PDF file"}</p>
                    </div>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                    {type === "youtube" ? "YouTube URL" : "URL"}
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              )}

              <Button
                disabled={loading}
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-[#020617] font-bold h-14 rounded-2xl mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Add Resource"}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
