/**
 * useLinks Hook - Business Logic for Links
 * Combines link store state with link service API calls
 */

import { useCallback } from "react";
import { useLinkStore } from "@/app/stores/linkStore";
import { linkService } from "@/app/services";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { CreateLinkDTO, UpdateLinkDTO } from "@/app/types";

export function useLinks() {
  const {
    links,
    filteredLinks,
    filters,
    isLoading,
    error,
    setLinks,
    setTotalClicks,
    addLink,
    updateLinkInStore,
    removeLinkFromStore,
    setFilters,
    setLoading,
    setError,
    reset,
  } = useLinkStore();

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
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      console.error("Error fetching links:", err);
    } finally {
      setLoading(false);
    }
  }, [setLinks, setTotalClicks, setLoading, setError]);

  /**
   * Create a new link
   */
  const createLink = useCallback(
    async (linkData: CreateLinkDTO) => {
      setLoading(true);
      setError(null);

      try {
        const newLink = await linkService.create(linkData);
        addLink(newLink);
        return { success: true as const, data: newLink, error: null, errorCode: null };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        setError(message);
        console.error("Error creating link:", err);
        return { success: false as const, data: null, error: message, errorCode };
      } finally {
        setLoading(false);
      }
    },
    [addLink, setLoading, setError]
  );

  /**
   * Update an existing link
   */
  const updateLink = useCallback(
    async (shortUrl: string, linkData: UpdateLinkDTO) => {
      setLoading(true);
      setError(null);

      try {
        const updatedLink = await linkService.update(shortUrl, linkData);
        updateLinkInStore(shortUrl, updatedLink);
        return { success: true as const, data: updatedLink, error: null, errorCode: null };
      } catch (err) {
        const message = getErrorMessage(err);
        const errorCode = err instanceof HttpError ? err.code : null;
        setError(message);
        console.error("Error updating link:", err);
        return { success: false as const, data: null, error: message, errorCode };
      } finally {
        setLoading(false);
      }
    },
    [updateLinkInStore, setLoading, setError]
  );

  /**
   * Delete a link
   */
  const deleteLink = useCallback(
    async (shortUrl: string) => {
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
    [removeLinkFromStore, setLoading, setError]
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
