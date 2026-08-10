import { create } from "zustand";

import { Analytics } from "@/types/Analytics";
import { analyticsService } from "@/services/firestore/analyticsService";

interface AnalyticsState {
  analytics: Analytics[];
  loading: boolean;
  error: string | null;

  fetchAnalytics: (userId: string) => Promise<void>;

  reset: () => void;
}

export const useAnalyticsStore =
  create<AnalyticsState>((set) => ({
    analytics: [],

    loading: false,

    error: null,

    fetchAnalytics: async (userId: string) => {
      if (!userId) {
        console.warn(
          "Analytics: fetch skipped - no user ID"
        );

        return;
      }

      set({
        loading: true,
        error: null,
      });

      try {
        console.log(
          "Analytics: fetching for user:",
          userId
        );

        const data =
          await analyticsService.listByUser(
            userId
          );

        console.log(
          "Analytics: fetched:",
          data
        );

        set({
          analytics: data,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error(
          "Analytics: fetch failed:",
          error
        );

        set({
          analytics: [],
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load analytics",
        });
      }
    },

    reset: () => {
      set({
        analytics: [],
        loading: false,
        error: null,
      });
    },
  }));