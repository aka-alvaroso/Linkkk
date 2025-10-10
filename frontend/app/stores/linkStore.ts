import { create } from "zustand";

// Simplified Link interface for beta
interface Link {
  shortUrl: string;
  longUrl: string;
  status: boolean;
  createdAt: string;
}

export interface LinkFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
}

interface LinkStore {
  links: Link[];
  filteredLinks: Link[];
  filters: LinkFilters;

  getLinks: () => Promise<void>;
  createLink: (link: Link) => Promise<void>;
  updateLink: (link: Link) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  setFilters: (filters: LinkFilters) => void;
  applyFilters: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const defaultFilters: LinkFilters = {
  search: '',
  status: 'all',
};

export const useLinkStore = create<LinkStore>((set, get) => ({
  links: [],
  filteredLinks: [],
  filters: defaultFilters,

  getLinks: async () => {
    const response = await fetch(`${API_BASE_URL}/link`, {
      credentials: "include",
    });
    const data = await response.json();
    set({ links: data.data || [] });
    get().applyFilters();
  },
  createLink: async (link: Link) => {
    const response = await fetch(`${API_BASE_URL}/link`, {
      method: "POST",
      body: JSON.stringify(link),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();
    return data;
  },
  updateLink: async (link: Link) => {
    const response = await fetch(`${API_BASE_URL}/link/${link.shortUrl}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(link),
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    console.log(await response.json());
    throw new Error("Failed to update link");
  },
  deleteLink: async (shortUrl: string) => {
    const response = await fetch(`${API_BASE_URL}/link/${shortUrl}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();
    return data;
  },

  setFilters: (filters: LinkFilters) => {
    set({ filters });
    get().applyFilters();
  },

  applyFilters: () => {
    const { links, filters } = get();

    let filtered = [...links];

    // Search filter (short URL or long URL)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(link =>
        link.shortUrl.toLowerCase().includes(searchLower) ||
        link.longUrl.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(link =>
        filters.status === 'active' ? link.status : !link.status
      );
    }

    set({ filteredLinks: filtered });
  },
}));

export type { Link };
