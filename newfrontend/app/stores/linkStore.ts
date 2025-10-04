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
  password?: string;
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

interface LinkStore {
  links: Link[];

  getLinks: () => Promise<void>;
  createLink: (link: Link) => Promise<void>;
  updateLink: (link: Link) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useLinkStore = create<LinkStore>((set) => ({
  links: [],

  getLinks: async () => {
    const response = await fetch(`${API_BASE_URL}/link`, {
      credentials: "include",
    });
    const data = await response.json();
    set({ links: data.data || [] });
  },
  createLink: async (link: Link) => {
    const response = await fetch(`${API_BASE_URL}/link`, {
      method: "POST",
      body: JSON.stringify(link),
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
  deleteLink: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/link/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    return data;
  },
}));

export type { Link };
