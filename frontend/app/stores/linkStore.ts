import { create } from "zustand";

interface Link {
  id: string;
  userId?: string;
  guestSessionId?: string;
  shortUrl: string;
  longUrl: string;
  status: boolean;
  dateExpire?: string;
  sufix?: string;
  password?: string | boolean;
  hasPassword?: boolean;
  accessLimit?: number;
  mobileUrl?: string;
  desktopUrl?: string;
  metadataTitle?: string;
  metadataDescription?: string;
  metadataImage?: string;
  qrBinaryBytes?: string;
  createdAt: string;
  blockedCountries?: string[];
}

export interface LinkFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  hasPassword: 'all' | 'yes' | 'no';
  expiration: 'all' | 'expires-soon' | 'no-expiration' | 'has-expiration';
  hasAccessLimit: 'all' | 'yes' | 'no';
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
  hasPassword: 'all',
  expiration: 'all',
  hasAccessLimit: 'all',
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
        (link.sufix?.toLowerCase().includes(searchLower)) ||
        link.longUrl.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(link =>
        filters.status === 'active' ? link.status : !link.status
      );
    }

    // Password filter
    if (filters.hasPassword !== 'all') {
      filtered = filtered.filter(link => {
        const hasPassword = !!link.password || link.hasPassword;
        return filters.hasPassword === 'yes' ? hasPassword : !hasPassword;
      });
    }

    // Expiration filter
    if (filters.expiration !== 'all') {
      filtered = filtered.filter(link => {
        if (filters.expiration === 'no-expiration') {
          return !link.dateExpire;
        }

        if (filters.expiration === 'has-expiration') {
          return !!link.dateExpire;
        }

        if (filters.expiration === 'expires-soon') {
          if (!link.dateExpire) return false;
          const expirationDate = new Date(link.dateExpire);
          const now = new Date();
          const diff = expirationDate.getTime() - now.getTime();
          const hoursUntilExpiration = diff / (1000 * 60 * 60);
          return hoursUntilExpiration <= 24 && hoursUntilExpiration > 0;
        }

        return true;
      });
    }

    // Access Limit filter
    if (filters.hasAccessLimit !== 'all') {
      filtered = filtered.filter(link => {
        const hasLimit = link.accessLimit !== undefined && link.accessLimit !== null;
        return filters.hasAccessLimit === 'yes' ? hasLimit : !hasLimit;
      });
    }

    set({ filteredLinks: filtered });
  },
}));

export type { Link };
