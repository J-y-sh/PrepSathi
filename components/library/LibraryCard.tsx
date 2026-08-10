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
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { LibraryResource } from "@/types/Library";
import { PlaylistProgress } from "@/types/PlaylistProgress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface LibraryCardProps {
  resource: LibraryResource;
  isGrid?: boolean;
  playlistProgress?: PlaylistProgress | null;
  playlistProgressLoading?: boolean;
  onFavorite: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onOpen: (id: string) => void;
  onStartStudy: (resource: LibraryResource) => void;
}

export function LibraryCard({
  resource,
  isGrid = true,
  playlistProgress = null,
  playlistProgressLoading = false,
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

  const hasPlaylistProgress =
    resource.type === "youtube" &&
    playlistProgress !== null;

  const progressPercentage =
    playlistProgress?.percentage ?? 0;

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
      {/* =====================================================
          TOP SECTION
      ====================================================== */}

      <div
        className={cn(
          "flex items-center justify-between",
          !isGrid && "hidden"
        )}
      >
        <div
          className={cn(
            "p-2 rounded-lg bg-white/5",
            colorClass
          )}
        >
          <Icon size={20} />
        </div>

        <button
          onClick={() =>
            onFavorite(
              resource.id,
              resource.isFavorite
            )
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
            fill={
              resource.isFavorite
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      {/* =====================================================
          RESOURCE INFORMATION
      ====================================================== */}

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

        {/* ===================================================
            PLAYLIST PROGRESS
        ==================================================== */}

        {resource.type === "youtube" && (
          <div className="mt-3">

            {playlistProgressLoading &&
            !playlistProgress ? (
              <div className="flex items-center gap-2 text-[10px] text-white/30">
                <Loader2
                  size={12}
                  className="animate-spin"
                />
                Loading progress...
              </div>
            ) : hasPlaylistProgress ? (
              <div className="space-y-1.5">

                <div className="flex items-center justify-between">

                  <span className="text-[10px] text-white/40">
                    {playlistProgress.completedVideos}{" "}
                    /{" "}
                    {playlistProgress.totalVideos}{" "}
                    videos
                  </span>

                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      progressPercentage >= 100
                        ? "text-emerald-400"
                        : "text-amber-400"
                    )}
                  >
                    {progressPercentage}%
                  </span>

                </div>

                <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">

                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      progressPercentage >= 100
                        ? "bg-emerald-400"
                        : "bg-amber-400"
                    )}
                    style={{
                      width: `${Math.min(
                        progressPercentage,
                        100
                      )}%`,
                    }}
                  />

                </div>

                {playlistProgress.completedVideos >
                  0 &&
                  playlistProgress.completedVideos <
                    playlistProgress.totalVideos && (
                    <p className="text-[9px] text-white/25">
                      Keep going — playlist in progress
                    </p>
                  )}

                {playlistProgress.completedVideos ===
                  playlistProgress.totalVideos &&
                  playlistProgress.totalVideos > 0 && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                      <CheckCircle2 size={11} />
                      Playlist completed
                    </div>
                  )}

              </div>
            ) : (
              <div className="text-[10px] text-white/25">
                No progress yet
              </div>
            )}

          </div>
        )}
      </div>

      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div
        className={cn(
          "flex items-center justify-between",
          !isGrid && "ml-auto gap-4"
        )}
      >
        <div className="flex items-center gap-2">

          {/* OPEN */}

          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              onOpen(resource.id)
            }
            className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors"
          >
            Open
            <ExternalLink size={12} />
          </a>

          {/* START STUDY */}

          <Button
            size="sm"
            onClick={() =>
              onStartStudy(resource)
            }
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg"
          >
            <Play size={14} />
            Start Study
          </Button>

        </div>

        {/* DELETE */}

        <button
          onClick={() =>
            onDelete(resource.id)
          }
          className="p-2 rounded-lg hover:bg-destructive/10 text-destructive/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 size={16} />
        </button>

        {/* FAVORITE FOR LIST VIEW */}

        {!isGrid && (
          <button
            onClick={() =>
              onFavorite(
                resource.id,
                resource.isFavorite
              )
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
              fill={
                resource.isFavorite
                  ? "currentColor"
                  : "none"
              }
            />
          </button>
        )}

      </div>
    </motion.div>
  );
}