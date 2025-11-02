/**
 * Auth Store - State Management Only
 * This store only manages authentication state, not API calls
 */

import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string | null;
  role: "user" | "guest";
  isEmailVerified: boolean;
  createdAt: string;
}

export interface GuestSession {
  id: string;
  createdAt: string;
}

interface AuthState {
  // State
  user: User | null;
  guestSession: GuestSession | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  sessionChecked: boolean;
  error: string | null;

  // State setters
  setUser: (user: User | null) => void;
  setGuestSession: (session: GuestSession | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setGuest: (isGuest: boolean) => void;
  setLoading: (loading: boolean) => void;
  setSessionChecked: (checked: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state
  user: null,
  guestSession: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: true,
  sessionChecked: false,
  error: null,

  // State setters
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isGuest: false,
      guestSession: user ? null : undefined as any,
    }),

  setGuestSession: (guestSession) =>
    set({
      guestSession,
      isGuest: !!guestSession,
      isAuthenticated: false,
      user: guestSession ? null : undefined as any,
    }),

  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setGuest: (isGuest) => set({ isGuest }),
  setLoading: (isLoading) => set({ isLoading }),
  setSessionChecked: (sessionChecked) => set({ sessionChecked }),
  setError: (error) => set({ error }),

  clearAuth: () =>
    set({
      user: null,
      guestSession: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: false,
      error: null,
    }),

  reset: () =>
    set({
      user: null,
      guestSession: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: true,
      sessionChecked: false,
      error: null,
    }),
}));
