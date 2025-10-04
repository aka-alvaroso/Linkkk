import React from "react";
import { create } from "zustand";

interface User {
  id: string;
  email: string;
  username?: string;
  role: "user" | "guest";
  isEmailVerified: boolean;
  createdAt: string;
}

interface GuestSession {
  id: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  guestSession: GuestSession | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  sessionChecked: boolean;

  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  createGuestSession: () => Promise<boolean>;
  checkSession: () => Promise<void>;

  setUser: (user: User | null) => void;
  setGuestSession: (session: GuestSession | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresVerification?: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  username?: string;
}

interface RegisterResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresVerification?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  guestSession: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: true, // Inicia en true hasta que se compruebe la sesión
  sessionChecked: false, // Inicia en false

  createGuestSession: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/guest`, {
        method: "POST",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        set({
          guestSession: data.data.guestSession,
          isGuest: true,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  checkSession: async () => {
    // Si ya se ha comprobado la sesión, no hacer nada más.
    if (get().sessionChecked) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.data.user) {
          set({
            user: data.data.user,
            isAuthenticated: true,
            isGuest: false,
            guestSession: null,
          });
        } else if (data.data.guest) {
          set({
            guestSession: data.data.guest,
            isGuest: true,
            isAuthenticated: false,
            user: null,
          });
        }
      } else {
        set({
          user: null,
          guestSession: null,
          isAuthenticated: false,
          isGuest: false,
        });
      }
    } catch (e) {
      set({
        user: null,
        guestSession: null,
        isAuthenticated: false,
        isGuest: false,
      });
    } finally {
      set({ sessionChecked: true, isLoading: false });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        set({
          user: data.data.user,
          isAuthenticated: true,
          isGuest: false,
          guestSession: null,
          isLoading: false,
        });

        return { success: true, user: data.data.user };
      } else {
        set({ isLoading: false });
        return {
          success: false,
          error: data.code || "Error de autenticación",
          requiresVerification: data.requiresVerification,
        };
      }
    } catch {
      set({ isLoading: false });
      return {
        success: false,
        error: "Error de conexión. Inténtalo de nuevo.",
      };
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn("Error al cerrar sesión en el servidor:", error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isGuest: false,
        guestSession: null,
        isLoading: false,
      });
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.requiresVerification) {
          set({ isLoading: false });
          return {
            success: true,
            requiresVerification: true,
            user: result.user,
          };
        } else {
          set({
            user: result.user,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, user: result.user };
        }
      } else {
        set({ isLoading: false });
        return {
          success: false,
          error: result.code || "Error en el registro",
        };
      }
    } catch {
      set({ isLoading: false });
      return {
        success: false,
        error: "Error de conexión. Inténtalo de nuevo.",
      };
    }
  },

  setUser: (user: User | null) => set({ user }),
  setGuestSession: (guestSession: GuestSession | null) => set({ guestSession }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  clearAuth: () =>
    set({
      user: null,
      guestSession: null,
      isAuthenticated: false,
      isGuest: false,
      isLoading: false,
    }),
}));

export const useAuth = useAuthStore;

export type {
  User,
  LoginCredentials,
  RegisterData,
  LoginResult,
  RegisterResult,
};
