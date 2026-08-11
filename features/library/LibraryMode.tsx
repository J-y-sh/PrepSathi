"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Grid,
  List,
  Library as LibraryIcon,
  Loader2,
  Star,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/AuthProvider";
import { useLibraryStore } from "@/store/useLibraryStore";

import { LibraryCard } from "@/components/library/LibraryCard";
import { UploadDialog } from "@/components/library/UploadDialog";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { LibraryResource } from "@/types/Library";
import { PlaylistProgress } from "@/types/PlaylistProgress";
import { playlistProgressService } from "@/services/firestore/playlistProgressService";

const CATEGORIES = [
  "All",
  "General Studies",
  "History",
  "Geography",
  "Polity",
  "Economy",
  "Environment",
  "Science",
  "Ethics",
  "CSAT",
];

export function LibraryMode() {
  const { user } = useAuth();

  const {
    resources,
    loading,
    fetchResources,
    addResource,
    uploadFile,
    toggleFavorite,
    deleteResource,
  } = useLibraryStore();

  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isGrid, setIsGrid] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] =
    useState(false);

  const [playlistProgress, setPlaylistProgress] =
    useState<Record<string, PlaylistProgress>>({});

  const [loadingPlaylistProgress, setLoadingPlaylistProgress] =
    useState(false);

  // =========================================================
  // FETCH USER LIBRARY
  // =========================================================

  useEffect(() => {
    if (!user) return;

    console.log(
      "LibraryMode: fetching resources for",
      user.uid
    );

    fetchResources(user.uid);
  }, [user, fetchResources]);

  // =========================================================
  // LOAD PLAYLIST PROGRESS
  // =========================================================

  useEffect(() => {
    if (!user || resources.length === 0) {
      return;
    }

    let cancelled = false;

    const loadPlaylistProgress = async () => {
      const youtubeResources = resources.filter(
        (resource) =>
          resource.type === "youtube" &&
          resource.url
      );

      if (youtubeResources.length === 0) {
        return;
      }

      setLoadingPlaylistProgress(true);

      const progressMap: Record<
        string,
        PlaylistProgress
      > = {};

      try {
        await Promise.all(
          youtubeResources.map(async (resource) => {
            try {
              const parsedUrl = new URL(resource.url);

              const playlistId =
                parsedUrl.searchParams.get("list");

              if (!playlistId || !resource.id) {
                return;
              }

              /*
               * We need the playlist's actual video count.
               *
               * The playlist metadata endpoint used by
               * YouTubePlayer is reused here so LibraryMode
               * doesn't need to know anything about the
               * YouTube API implementation.
               */
              const response = await fetch(
                `/api/youtube/playlist?playlistId=${encodeURIComponent(
                  playlistId
                )}`
              );

              if (!response.ok) {
                console.error(
                  "[PlaylistProgress] Failed to load playlist metadata:",
                  resource.title
                );
                return;
              }

              const data = await response.json();

              const totalVideos =
                data.totalResults ??
                data.videos?.length ??
                0;

              if (totalVideos <= 0) {
                return;
              }

              const progress =
                await playlistProgressService.getPlaylistProgress(
                  user.uid,
                  resource.id,
                  playlistId,
                  totalVideos
                );

              progressMap[resource.id] = progress;
            } catch (error) {
              console.error(
                "[PlaylistProgress] Failed for resource:",
                resource.title,
                error
              );
            }
          })
        );

        if (!cancelled) {
          setPlaylistProgress(progressMap);
        }
      } finally {
        if (!cancelled) {
          setLoadingPlaylistProgress(false);
        }
      }
    };

    loadPlaylistProgress();

    return () => {
      cancelled = true;
    };
  }, [user, resources]);

  // =========================================================
  // FILTER RESOURCES
  // =========================================================

  const filteredResources = useMemo(() => {
    const normalizedSearch = search
      .toLowerCase()
      .trim();

    return resources.filter((resource) => {
      const matchesSearch =
        !normalizedSearch ||
        resource.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        resource.category
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        activeCategory === "All" ||
        resource.category === activeCategory;

      const matchesFavorite =
        !showOnlyFavorites ||
        resource.isFavorite;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesFavorite
      );
    });
  }, [
    resources,
    search,
    activeCategory,
    showOnlyFavorites,
  ]);

  // =========================================================
  // ADD / UPLOAD RESOURCE
  // =========================================================

  const handleUpload = async (data: {
    title: string;
    category: string;
    type: "pdf" | "youtube" | "link";
    url?: string;
    file?: File;
  }) => {
    if (!user) return;

    try {
      let finalUrl = data.url;

      if (data.type === "pdf" && data.file) {
        finalUrl = await uploadFile(
          user.uid,
          data.file
        );
      }

      if (!finalUrl) {
        throw new Error(
          "No resource URL was provided."
        );
      }

      await addResource(user.uid, {
        title: data.title,
        category: data.category,
        type: data.type,
        url: finalUrl,
      });

      console.log(
        "Library resource added successfully"
      );

      await fetchResources(user.uid);

      setIsUploadOpen(false);
    } catch (error) {
      console.error(
        "Failed to add library resource:",
        error
      );
    }
  };

  // =========================================================
  // START STUDY
  // =========================================================

  const handleStartStudy = (
    resource: LibraryResource
  ) => {
    if (!resource.id) {
      console.error(
        "Cannot start study: resource ID missing."
      );
      return;
    }

    console.log(
      "Opening in-app study viewer:",
      resource.title
    );

    router.push(`/study/${resource.id}`);
  };

  // =========================================================
  // NORMAL OPEN
  // =========================================================

  const handleOpen = (
    resource: LibraryResource
  ) => {
    if (!resource.id) {
      console.error(
        "Cannot open resource: resource ID missing."
      );
      return;
    }

    router.push(`/study/${resource.id}`);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="max-w-6xl mx-auto px-6 py-4 space-y-8 pb-32">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

        <div className="flex items-center gap-4">

          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <LibraryIcon size={24} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Smart Library
            </h2>

            <p className="text-white/40 text-sm">
              Organize your UPSC study materials.
            </p>
          </div>

        </div>

        <div className="flex items-center gap-3">

          {/* GRID / LIST TOGGLE */}

          <div className="flex bg-[#1E293B] rounded-xl p-1 border border-white/5">

            <button
              onClick={() => setIsGrid(true)}
              className={cn(
                "p-2 rounded-lg transition-all",
                isGrid
                  ? "bg-white/10 text-white"
                  : "text-white/20 hover:text-white/50"
              )}
              aria-label="Grid view"
            >
              <Grid size={18} />
            </button>

            <button
              onClick={() => setIsGrid(false)}
              className={cn(
                "p-2 rounded-lg transition-all",
                !isGrid
                  ? "bg-white/10 text-white"
                  : "text-white/20 hover:text-white/50"
              )}
              aria-label="List view"
            >
              <List size={18} />
            </button>

          </div>

          {/* ADD NEW */}

          <Button
            onClick={() => setIsUploadOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-[#020617] font-bold h-11 px-6 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            Add New
          </Button>

        </div>

      </div>

      {/* SEARCH + FAVORITES */}

      <div className="flex flex-col md:flex-row gap-4">

        <div className="relative flex-1">

          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
            size={18}
          />

          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-[#1E293B] border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
          />

        </div>

        <button
          onClick={() =>
            setShowOnlyFavorites(
              (current) => !current
            )
          }
          className={cn(
            "px-5 py-3.5 rounded-2xl border transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest",
            showOnlyFavorites
              ? "bg-amber-500/10 border-amber-500/50 text-amber-500"
              : "bg-[#1E293B] border-white/5 text-white/40 hover:text-white"
          )}
        >
          <Star
            size={16}
            fill={
              showOnlyFavorites
                ? "currentColor"
                : "none"
            }
          />

          Favorites
        </button>

      </div>

      {/* CATEGORY FILTERS */}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">

        {CATEGORIES.map((category) => (

          <button
            key={category}
            onClick={() =>
              setActiveCategory(category)
            }
            className={cn(
              "px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border",
              activeCategory === category
                ? "bg-white text-[#020617] border-white"
                : "bg-white/5 text-white/40 border-transparent hover:bg-white/10 hover:text-white"
            )}
          >
            {category}
          </button>

        ))}

      </div>

      {/* RESOURCE GRID / LIST */}

      <div
        className={cn(
          "min-h-[400px]",
          isGrid
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-3"
        )}
      >

        {loading ? (

          <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/20">

            <Loader2
              className="animate-spin mb-2"
              size={32}
            />

            <p className="text-sm font-medium">
              Loading your library...
            </p>

          </div>

        ) : filteredResources.length > 0 ? (

          <AnimatePresence mode="popLayout">

            {filteredResources.map(
              (resource) => (

                <LibraryCard
                  key={resource.id}
                  resource={resource}
                  isGrid={isGrid}
                  playlistProgress={
                    playlistProgress[
                      resource.id
                    ] ?? null
                  }
                  playlistProgressLoading={
                    loadingPlaylistProgress &&
                    resource.type === "youtube"
                  }
                  onFavorite={toggleFavorite}
                  onDelete={deleteResource}
                  onOpen={() =>
                    handleOpen(resource)
                  }
                  onStartStudy={() =>
                    handleStartStudy(resource)
                  }
                />

              )
            )}

          </AnimatePresence>

        ) : (

          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4">

            <div className="p-6 rounded-full bg-white/5 text-white/10">
              <LibraryIcon size={48} />
            </div>

            <div className="space-y-1">

              <h3 className="text-white/60 font-bold">

                {search ||
                activeCategory !== "All" ||
                showOnlyFavorites
                  ? "No resources found"
                  : "Your library is empty"}

              </h3>

              <p className="text-white/20 text-sm max-w-[250px]">

                {search ||
                activeCategory !== "All" ||
                showOnlyFavorites
                  ? "Try changing your search or filters."
                  : "Start adding PDFs, YouTube lectures, and study links."}

              </p>

            </div>

            {!search &&
              activeCategory === "All" &&
              !showOnlyFavorites && (

                <Button
                  onClick={() =>
                    setIsUploadOpen(true)
                  }
                  className="bg-amber-500 hover:bg-amber-600 text-[#020617] font-bold rounded-xl"
                >
                  <Plus size={18} />
                  Add Your First Resource
                </Button>

              )}

          </div>

        )}

      </div>

      {/* UPLOAD DIALOG */}

      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() =>
          setIsUploadOpen(false)
        }
        onUpload={handleUpload}
      />

    </div>
  );
}