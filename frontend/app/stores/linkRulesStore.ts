/**
 * Link Rules Store - Pure State Management
 * Only handles state mutations, no API calls
 */

import { create } from "zustand";
import type { LinkRule } from "@/app/types";

interface LinkRulesStore {
  // State
  rules: LinkRule[];
  currentShortUrl: string | null; // Track which link's rules we're viewing
  isLoading: boolean;
  error: string | null;

  // State mutations only (no API calls)
  setRules: (rules: LinkRule[], shortUrl: string) => void;
  addRule: (rule: LinkRule) => void;
  updateRuleInStore: (ruleId: number, data: Partial<LinkRule>) => void;
  removeRuleFromStore: (ruleId: number) => void;
  reorderRules: (rules: LinkRule[]) => void; // For drag & drop priority changes
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLinkRulesStore = create<LinkRulesStore>((set, get) => ({
  // Initial state
  rules: [],
  currentShortUrl: null,
  isLoading: false,
  error: null,

  // State mutations
  setRules: (rules, shortUrl) => {
    // Sort by priority (lower = higher priority)
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
    set({ rules: sortedRules, currentShortUrl: shortUrl });
  },

  addRule: (rule) => {
    set((state) => {
      const newRules = [...state.rules, rule];
      // Sort by priority
      return {
        rules: newRules.sort((a, b) => a.priority - b.priority),
      };
    });
  },

  updateRuleInStore: (ruleId, data) => {
    set((state) => {
      const updatedRules = state.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...data } : rule
      );
      // Re-sort if priority changed
      return {
        rules: updatedRules.sort((a, b) => a.priority - b.priority),
      };
    });
  },

  removeRuleFromStore: (ruleId) => {
    set((state) => ({
      rules: state.rules.filter((rule) => rule.id !== ruleId),
    }));
  },

  reorderRules: (rules) => {
    // Used for drag & drop or manual priority changes
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
    set({ rules: sortedRules });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => {
    set({
      rules: [],
      currentShortUrl: null,
      isLoading: false,
      error: null,
    });
  },
}));
