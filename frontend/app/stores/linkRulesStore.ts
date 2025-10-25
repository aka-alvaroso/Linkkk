/**
 * Link Rules Store
 * Zustand store for managing link rules state
 */

import { create } from 'zustand';
import { LinkRule } from '@/app/types/linkRules';

interface LinkRulesState {
  // State
  rules: LinkRule[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setRules: (rules: LinkRule[]) => void;
  addRule: (rule: LinkRule) => void;
  updateRule: (ruleId: number, updates: Partial<LinkRule>) => void;
  removeRule: (ruleId: number) => void;
  reorderRules: (newOrder: LinkRule[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  rules: [],
  isLoading: false,
  error: null,
};

export const useLinkRulesStore = create<LinkRulesState>((set) => ({
  ...initialState,

  setRules: (rules) => set({ rules, error: null }),

  addRule: (rule) =>
    set((state) => ({
      rules: [...state.rules, rule],
    })),

  updateRule: (ruleId, updates) =>
    set((state) => ({
      rules: state.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      ),
    })),

  removeRule: (ruleId) =>
    set((state) => ({
      rules: state.rules.filter((rule) => rule.id !== ruleId),
    })),

  reorderRules: (newOrder) => set({ rules: newOrder }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  reset: () => set(initialState),
}));
