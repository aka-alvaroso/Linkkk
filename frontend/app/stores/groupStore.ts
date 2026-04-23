import { create } from "zustand";
import type { Group } from "@/app/types";

interface GroupStore {
  groups: Group[];
  isLoading: boolean;
  error: string | null;

  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroupInStore: (groupId: number, data: Partial<Group>) => void;
  removeGroupFromStore: (groupId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  groups: [],
  isLoading: false,
  error: null,

  setGroups: (groups) => set({ groups }),

  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),

  updateGroupInStore: (groupId, data) =>
    set((state) => ({ groups: state.groups.map((g) => (g.id === groupId ? { ...g, ...data } : g)) })),

  removeGroupFromStore: (groupId) =>
    set((state) => ({ groups: state.groups.filter((g) => g.id !== groupId) })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set({ groups: [], isLoading: false, error: null }),
}));
