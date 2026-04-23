import { create } from "zustand";
import type { Tag } from "@/app/types";

interface TagStore {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;

  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTagInStore: (tagId: number, data: Partial<Tag>) => void;
  removeTagFromStore: (tagId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useTagStore = create<TagStore>((set) => ({
  tags: [],
  isLoading: false,
  error: null,

  setTags: (tags) => set({ tags }),

  addTag: (tag) => set((state) => ({ tags: [...state.tags, tag].sort((a, b) => a.name.localeCompare(b.name)) })),

  updateTagInStore: (tagId, data) =>
    set((state) => ({ tags: state.tags.map((t) => (t.id === tagId ? { ...t, ...data } : t)) })),

  removeTagFromStore: (tagId) =>
    set((state) => ({ tags: state.tags.filter((t) => t.id !== tagId) })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set({ tags: [], isLoading: false, error: null }),
}));
