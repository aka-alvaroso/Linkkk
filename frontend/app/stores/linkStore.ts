/**
 * Link Store - Pure State Management
 * Only handles state mutations, no API calls
 */

import { create } from "zustand";
import type { Link, LinkFilters } from "@/app/types";

const defaultFilters: LinkFilters = {
  search: "",
  status: "all",
};

interface LinkStore {
  // State
  links: Link[];
  filteredLinks: Link[];
  filters: LinkFilters;
  totalClicks: number;
  isLoading: boolean;
  error: string | null;

  // State mutations only (no API calls)
  setLinks: (links: Link[]) => void;
  setTotalClicks: (totalClicks: number) => void;
  addLink: (link: Link) => void;
  updateLinkInStore: (shortUrl: string, data: Partial<Link>) => void;
  removeLinkFromStore: (shortUrl: string) => void;
  setFilters: (filters: LinkFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  applyFilters: () => void;
  reset: () => void;
}

export const useLinkStore = create<LinkStore>((set, get) => ({
  // Initial state
  links: [],
  filteredLinks: [],
  filters: defaultFilters,
  totalClicks: 0,
  isLoading: false,
  error: null,

  // State mutations
  setLinks: (links) => {
    set({ links });
    get().applyFilters();
  },

  setTotalClicks: (totalClicks) => set({ totalClicks }),

  addLink: (link) => {
    set((state) => ({
      links: [link, ...state.links],
    }));
    get().applyFilters();
  },

  updateLinkInStore: (shortUrl, data) => {
    set((state) => ({
      links: state.links.map((link) =>
        link.shortUrl === shortUrl ? { ...link, ...data } : link
      ),
    }));
    get().applyFilters();
  },

  removeLinkFromStore: (shortUrl) => {
    set((state) => ({
      links: state.links.filter((link) => link.shortUrl !== shortUrl),
    }));
    get().applyFilters();
  },

  setFilters: (filters) => {
    set({ filters });
    get().applyFilters();
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  applyFilters: () => {
    const { links, filters } = get();
    let filtered = [...links];

    // Search filter (short URL or long URL)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (link) =>
          link.shortUrl.toLowerCase().includes(searchLower) ||
          link.longUrl.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((link) =>
        filters.status === "active" ? link.status : !link.status
      );
    }

    set({ filteredLinks: filtered });
  },

  reset: () => {
    set({
      links: [],
      filteredLinks: [],
      filters: defaultFilters,
      isLoading: false,
      error: null,
    });
  },
}));
