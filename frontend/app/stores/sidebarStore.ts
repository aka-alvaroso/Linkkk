// app/stores/sidebarStore.ts
import { create } from "zustand";

interface SidebarState {
  mobileOpen: boolean;
  desktopOpen: boolean;
  toggleMobile: () => void;
  toggleDesktop: () => void;
  setMobileOpen: (open: boolean) => void;
  setDesktopOpen: (open: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  mobileOpen: false,
  desktopOpen: true,

  toggleMobile: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
  toggleDesktop: () => set((state) => ({ desktopOpen: !state.desktopOpen })),
  setMobileOpen: (open) => set({ mobileOpen: open }),
  setDesktopOpen: (open) => set({ desktopOpen: open }),
}));
