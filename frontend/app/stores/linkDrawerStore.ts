/**
 * Link Drawer Store - Pure State Management
 * Lets code outside a link's own row (e.g. a realtime toast) ask that
 * link's row to open its edit drawer, without a direct reference to it.
 */

import { create } from "zustand";

interface LinkDrawerStore {
  requestedShortUrl: string | null;
  requestOpen: (shortUrl: string) => void;
  clearRequest: () => void;
}

export const useLinkDrawerStore = create<LinkDrawerStore>((set) => ({
  requestedShortUrl: null,
  requestOpen: (shortUrl) => set({ requestedShortUrl: shortUrl }),
  clearRequest: () => set({ requestedShortUrl: null }),
}));
