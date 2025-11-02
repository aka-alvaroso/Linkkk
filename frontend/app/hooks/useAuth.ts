/**
 * useAuth Hook - Business Logic for Authentication
 * Combines auth store state with auth service API calls
 */

import { useCallback } from "react";
import { useAuthStore } from "@/app/stores/authStore";
import { authService } from "@/app/services";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { LoginDTO, RegisterDTO, User, SessionResponse } from "@/app/services/api/authService";

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: string | null;
  requiresVerification?: boolean;
}

interface RegisterResult {
  success: boolean;
  user?: User;
  error?: string;
  errorCode?: string | null;
  requiresVerification?: boolean;
}

export function useAuth() {
  const {
    user,
    guestSession,
    isAuthenticated,
    isGuest,
    isLoading,
    sessionChecked,
    error,
    setUser,
    setGuestSession,
    setLoading,
    setSessionChecked,
    setError,
    clearAuth,
    reset,
  } = useAuthStore();

  /**
   * Get user-friendly error message from error object
   */
  const getErrorMessage = (err: unknown): string => {
    if (err instanceof HttpError) {
      return err.message;
    }
    if (err instanceof NetworkError || err instanceof TimeoutError) {
      return err.message;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return "An unexpected error occurred";
  };

  /**
   * Check and validate current session
   */
  const checkSession = useCallback(async () => {
    // If session already checked, skip
    if (sessionChecked) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await authService.validateSession();

      if (data.user) {
        setUser(data.user);
      } else if (data.guest) {
        setGuestSession({
          id: data.guest.guestSessionId,
          createdAt: new Date().toISOString()
        });
      } else {
        clearAuth();
      }
    } catch (err) {
      // A 401 (Unauthorized) is expected when there's no active session
      // This is not an error, just means the user is not logged in
      if (err instanceof HttpError && err.statusCode === 401) {
        clearAuth();
      } else {
        // For other errors (network issues, server errors, etc.), log them
        const message = getErrorMessage(err);
        setError(message);
        clearAuth();
        console.error("Error validating session:", err);
      }
    } finally {
      setSessionChecked(true);
      setLoading(false);
    }
  }, [sessionChecked, setUser, setGuestSession, setLoading, setSessionChecked, setError, clearAuth]);

  /**
   * Create a guest session
   */
  const createGuestSession = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await authService.createGuestSession();
      setGuestSession({
        id: data.guestSession.id,
        createdAt: data.guestSession.createdAt,
      });
      return { success: true as const };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      console.error("Error creating guest session:", err);
      return { success: false as const, error: message };
    } finally {
      setLoading(false);
    }
  }, [setGuestSession, setLoading, setError]);

  /**
   * Login user
   */
  const login = useCallback(
    async (credentials: LoginDTO): Promise<LoginResult> => {
      setLoading(true);
      setError(null);

      try {
        const data = await authService.login(credentials);
        setUser(data.user);
        return {
          success: true,
          user: data.user,
          error: undefined,
          errorCode: null
        };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        setError(message);
        console.error("Error logging in:", err);
        return {
          success: false,
          error: message,
          errorCode,
          requiresVerification: false
        };
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, setError]
  );

  /**
   * Register new user
   */
  const register = useCallback(
    async (userData: RegisterDTO): Promise<RegisterResult> => {
      setLoading(true);
      setError(null);

      try {
        const data = await authService.register(userData);
        setUser(data.user);
        return {
          success: true,
          user: data.user,
          error: undefined,
          errorCode: null,
          requiresVerification: false
        };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        setError(message);
        console.error("Error registering:", err);
        return {
          success: false,
          error: message,
          errorCode,
          requiresVerification: false
        };
      } finally {
        setLoading(false);
      }
    },
    [setUser, setLoading, setError]
  );

  /**
   * Logout current user
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await authService.logout();
      clearAuth();
      // Redirect to home page
      if (typeof window !== 'undefined') {
        window.location.href = "/";
      }
    } catch (err) {
      const message = getErrorMessage(err);
      console.warn("Error logging out on server:", err);
      // Clear auth locally even if server request fails
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  }, [clearAuth, setLoading, setError]);

  /**
   * Ensure there's an active session (user or guest)
   * Creates a guest session if needed
   * Returns true if session exists or was created successfully
   */
  const ensureSession = useCallback(async (): Promise<boolean> => {
    // If already authenticated or has guest session, we're good
    if (isAuthenticated || isGuest) {
      return true;
    }

    // Try to create a guest session
    const result = await createGuestSession();
    return result.success;
  }, [isAuthenticated, isGuest, createGuestSession]);

  return {
    // State
    user,
    guestSession,
    isAuthenticated,
    isGuest,
    isLoading,
    sessionChecked,
    error,

    // Actions
    checkSession,
    createGuestSession,
    ensureSession,
    login,
    register,
    logout,
    clearAuth,
    reset,
  };
}
