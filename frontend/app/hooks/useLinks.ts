/**
 * useLinks Hook - Business Logic for Links
 * Combines link store state with link service API calls
 */

import { useCallback } from "react";
import { useLinkStore } from "@/app/stores/linkStore";
import { linkService } from "@/app/services";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { CreateLinkDTO, UpdateLinkDTO } from "@/app/types";
import { useAuth } from "./useAuth";

export function useLinks() {
  const {
    links,
    filteredLinks,
    filters,
    isLoading,
    error,
    setLinks,
    setTotalClicks,
    setTotalScans,
    addLink,
    updateLinkInStore,
    removeLinkFromStore,
    setFilters,
    setLoading,
    setError,
    reset,
  } = useLinkStore();

  const { ensureSession } = useAuth();

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
   * Fetch all links from API
   */
  const fetchLinks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await linkService.getAll();
      setLinks(data.links);
      setTotalClicks(data.stats.totalClicks);
      setTotalScans(data.stats.totalScans);
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      console.error("Error fetching links:", err);
    } finally {
      setLoading(false);
    }
  }, [setLinks, setTotalClicks, setTotalScans, setLoading, setError]);

  /**
   * Create a new link
   */
  const createLink = useCallback(
    async (linkData: CreateLinkDTO) => {
      // Ensure we have a session (user or guest) before creating
      const hasSession = await ensureSession();
      if (!hasSession) {
        return {
          success: false as const,
          data: null,
          error: "Unable to create session",
          errorCode: "SESSION_REQUIRED",
          validation: undefined
        };
      }

      setLoading(true);
      setError(null);

      try {
        const newLink = await linkService.create(linkData);
        addLink(newLink);
        return { success: true as const, data: newLink, error: null, errorCode: null };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        const validation = err instanceof HttpError ? err.validation : undefined;
        setError(message);
        console.error("Error creating link:", err);
        return { success: false as const, data: null, error: message, errorCode, validation };
      } finally {
        setLoading(false);
      }
    },
    [addLink, setLoading, setError, ensureSession]
  );

  /**
   * Update an existing link
   */
  const updateLink = useCallback(
    async (shortUrl: string, linkData: UpdateLinkDTO) => {
      // Ensure we have a session before updating
      const hasSession = await ensureSession();
      if (!hasSession) {
        return {
          success: false as const,
          data: null,
          error: "Unable to create session",
          errorCode: "SESSION_REQUIRED",
          validation: undefined
        };
      }

      setLoading(true);
      setError(null);

      try {
        const updatedLink = await linkService.update(shortUrl, linkData);
        updateLinkInStore(shortUrl, updatedLink);
        return { success: true as const, data: updatedLink, error: null, errorCode: null };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        const validation = err instanceof HttpError ? err.validation : undefined;
        setError(message);
        console.error("Error updating link:", err);
        return { success: false as const, data: null, error: message, errorCode, validation };
      } finally {
        setLoading(false);
      }
    },
    [updateLinkInStore, setLoading, setError, ensureSession]
  );

  /**
   * Delete a link
   */
  const deleteLink = useCallback(
    async (shortUrl: string) => {
      // Ensure we have a session before deleting
      const hasSession = await ensureSession();
      if (!hasSession) {
        return {
          success: false as const,
          error: "Unable to create session",
          errorCode: "SESSION_REQUIRED"
        };
      }

      setLoading(true);
      setError(null);

      try {
        await linkService.delete(shortUrl);
        removeLinkFromStore(shortUrl);
        return { success: true as const, error: null, errorCode: null };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        setError(message);
        console.error("Error deleting link:", err);
        return { success: false as const, error: message, errorCode };
      } finally {
        setLoading(false);
      }
    },
    [removeLinkFromStore, setLoading, setError, ensureSession]
  );

  /**
   * Update filters
   */
  const updateFilters = useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters({ ...filters, ...newFilters });
    },
    [filters, setFilters]
  );

  return {
    // State
    links,
    filteredLinks,
    filters,
    isLoading,
    error,

    // Actions
    fetchLinks,
    createLink,
    updateLink,
    deleteLink,
    updateFilters,
    reset,
  };
}
