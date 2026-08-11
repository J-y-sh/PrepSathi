"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  Play,
  FileText,
  Link as LinkIcon,
} from "lucide-react";

import { useAuth } from "@/features/auth/AuthProvider";
import { libraryService } from "@/services/firestore/libraryService";
import { useStudySessionStore } from "@/store/useStudySessionStore";
import { LibraryResource } from "@/types/Library";
import YouTubePlayer from "@/components/study/YouTubePlayer";

export default function StudyViewerPage() {
  const params = useParams();
  const router = useRouter();

  const { user } = useAuth();
  const { startSession } = useStudySessionStore();

  const [resource, setResource] =
    useState<LibraryResource | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD RESOURCE
  // =========================================================

  useEffect(() => {
    if (!user || !params.id) {
      return;
    }

    let cancelled = false;

    const loadResource = async () => {
      try {
        setLoading(true);
        setError("");

        const resourceId = String(params.id);

        console.log(
          "StudyViewer: loading resource:",
          resourceId
        );

        // -----------------------------------------------------
        // GET RESOURCE
        // -----------------------------------------------------

        const data =
          await libraryService.get(resourceId);

        if (!data) {
          throw new Error(
            "Study resource not found."
          );
        }

        // -----------------------------------------------------
        // SECURITY CHECK
        // -----------------------------------------------------

        if (data.userId !== user.uid) {
          throw new Error(
            "You do not have permission to access this resource."
          );
        }

        if (!data.id) {
          throw new Error(
            "Resource ID is missing."
          );
        }

        if (!data.url) {
          throw new Error(
            "Resource URL is missing."
          );
        }

        if (cancelled) {
          return;
        }

        setResource(data);

        console.log(
          "StudyViewer: resource loaded:",
          data
        );

        // -----------------------------------------------------
        // MARK RESOURCE AS OPENED
        // -----------------------------------------------------

        try {
          await libraryService.markAsOpened(
            data.id
          );
        } catch (markError) {
          console.error(
            "StudyViewer: failed to mark resource as opened:",
            markError
          );
        }

        // -----------------------------------------------------
        // START STUDY SESSION
        // -----------------------------------------------------

        try {
          await startSession({
            userId: user.uid,
            resourceId: data.id,
            resourceTitle: data.title,
            resourceType: data.type,
            resourceUrl: data.url,
            category: data.category,
            progress: 0,
            completed: false,
            durationMinutes: 0,
          });

          console.log(
            "StudyViewer: study session started:",
            data.id
          );
        } catch (sessionError) {
          /*
           * Study-session tracking failure should never
           * prevent the actual resource from opening.
           */
          console.error(
            "StudyViewer: failed to start study session:",
            sessionError
          );
        }
      } catch (err) {
        console.error(
          "StudyViewer: failed to load resource:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load this study resource."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadResource();

    return () => {
      cancelled = true;
    };
  }, [user, params.id, startSession]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white/40">
          <Loader2
            size={32}
            className="animate-spin text-amber-500"
          />

          <p className="text-sm">
            Preparing your study session...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error || !resource) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <FileText size={24} />
          </div>

          <h1 className="text-xl font-bold text-white mb-2">
            Unable to open resource
          </h1>

          <p className="text-white/40 text-sm mb-6">
            {error || "Resource not found."}
          </p>

          <button
            onClick={() => router.back()}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#020617] font-bold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RESOURCE ICON
  // =========================================================

  const ResourceIcon =
    resource.type === "pdf"
      ? FileText
      : resource.type === "youtube"
      ? Play
      : LinkIcon;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="h-screen bg-[#020617] text-white flex flex-col overflow-hidden">
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="h-16 shrink-0 border-b border-white/5 bg-[#0B1120] flex items-center px-4 md:px-6 gap-4">
        {/* BACK */}

        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-xl hover:bg-white/5 text-white/60 hover:text-white transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="h-8 w-px bg-white/10" />

        {/* RESOURCE INFORMATION */}

        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <ResourceIcon size={18} />
          </div>

          <div className="min-w-0">
            <h1 className="font-bold text-sm md:text-base truncate">
              {resource.title}
            </h1>

            <p className="text-white/30 text-xs truncate">
              {resource.category}
            </p>
          </div>
        </div>

        {/* OPEN ORIGINAL */}

        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          title="Open original resource"
          aria-label="Open original resource"
        >
          <ExternalLink size={18} />
        </a>
      </header>

      {/* =====================================================
          RESOURCE VIEWER
      ====================================================== */}

      <main className="flex-1 min-h-0 bg-[#020617]">
        {/* ===================================================
            PDF
        ==================================================== */}

        {resource.type === "pdf" && (
          <iframe
            src={`${resource.url}#toolbar=1&navpanes=0&scrollbar=1`}
            title={resource.title}
            className="w-full h-full border-0"
          />
        )}

        {/* ===================================================
            YOUTUBE
        ==================================================== */}

        {resource.type === "youtube" && (
          <div className="w-full h-full flex items-center justify-center p-2 md:p-6 overflow-auto">
            <div className="w-full max-w-7xl h-full max-h-[calc(100vh-5rem)] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <YouTubePlayer
                url={resource.url}
                title={resource.title}
                resourceId={resource.id}
              />
            </div>
          </div>
        )}

        {/* ===================================================
            EXTERNAL LINK
        ==================================================== */}

        {resource.type === "link" && (
          <div className="w-full h-full">
            <iframe
              src={resource.url}
              title={resource.title}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            />
          </div>
        )}
      </main>
    </div>
  );
}