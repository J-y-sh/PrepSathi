"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Play,
  Link as LinkIcon,
  Star,
  ExternalLink,
  Trash2,
} from "lucide-react";

import { LibraryResource } from "@/types/Library";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LibraryCardProps {
  resource: LibraryResource;
  isGrid?: boolean;
  onFavorite: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  onStartStudy: (resource: LibraryResource) => void;
}

export function LibraryCard({
  resource,
  isGrid = true,
  onFavorite,
  onDelete,
  onOpen,
  onStartStudy,
}: LibraryCardProps) {
  const Icon =
    resource.type === "pdf"
      ? FileText
      : resource.type === "youtube"
        ? Play
        : LinkIcon;

  const colorClass =
    resource.type === "pdf"
      ? "text-red-400"
      : resource.type === "youtube"
        ? "text-red-500"
        : "text-blue-400";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-[#1E293B] border border-white/5 rounded-2xl group transition-all hover:bg-[#1E293B]/80",
        isGrid
          ? "p-5 flex flex-col gap-4"
          : "p-4 flex items-center gap-4"
      )}
    >
      {/* Top section */}
      <div
        className={cn(
          "flex items-center justify-between",
          !isGrid && "hidden"
        )}
      >
        <div className={cn("p-2 rounded-lg bg-white/5", colorClass)}>
          <Icon size={24} />
        </div>

        <button
          onClick={() =>
            onFavorite(resource.id, resource.isFavorite)
          }
          className={cn(
            "p-2 rounded-full transition-colors",
            resource.isFavorite
              ? "text-amber-500 bg-amber-500/10"
              : "text-white/20 hover:text-white/40"
          )}
        >
          <Star
            size={18}
            fill={resource.isFavorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      {/* Resource information */}
      <div className="flex-1 min-w-0">
        {!isGrid && (
          <div
            className={cn(
              "p-2 rounded-lg bg-white/5 inline-flex mr-4",
              colorClass
            )}
          >
            <Icon size={20} />
          </div>
        )}

        <h4 className="text-white font-bold truncate">
          {resource.title}
        </h4>

        <p className="text-white/40 text-xs mt-1 truncate">
          {resource.category}
        </p>
      </div>

      {/* Actions */}
      <div
        className={cn(
          "flex items-center justify-between",
          !isGrid && "ml-auto gap-4"
        )}
      >
        <div className="flex items-center gap-2">
          {/* Open */}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onOpen(resource.id)}
            className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors"
          >
            Open
            <ExternalLink size={12} />
          </a>

          {/* Start Study */}
          <Button
            size="sm"
            onClick={() => onStartStudy(resource)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg"
          >
            Start Study
          </Button>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(resource.id)}
          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={16} />
        </button>

        {/* Favorite for list view */}
        {!isGrid && (
          <button
            onClick={() =>
              onFavorite(resource.id, resource.isFavorite)
            }
            className={cn(
              "p-2 rounded-full transition-colors",
              resource.isFavorite
                ? "text-amber-500 bg-amber-500/10"
                : "text-white/20 hover:text-white/40"
            )}
          >
            <Star
              size={18}
              fill={resource.isFavorite ? "currentColor" : "none"}
            />
          </button>
        )}
      </div>
    </motion.div>
  );
}