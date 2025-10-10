/**
 * Stats Store - Aggregated Statistics
 * Handles user/guest link statistics and analytics
 */

import { create } from "zustand";
import type { LinkStats } from "@/app/types";

interface StatsStore {
  // State
  stats: LinkStats | null;
  isLoading: boolean;
  error: string | null;

  // State mutations
  setStats: (stats: LinkStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useStatsStore = create<StatsStore>((set) => ({
  // Initial state
  stats: null,
  isLoading: false,
  error: null,

  // State mutations
  setStats: (stats) => set({ stats, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () =>
    set({
      stats: null,
      isLoading: false,
      error: null,
    }),
}));
