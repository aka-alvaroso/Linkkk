/**
 * useLinks Hook - Business Logic for Links
 * Combines link store state with link service API calls
 */

import { useCallback } from "react";
import { useLinkStore } from "@/app/stores/linkStore";
import { linkService } from "@/app/services";
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
      const message = err instanceof Error ? err.message : "Failed to fetch links";
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
        return { success: true, data: newLink };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create link";
        setError(message);
        console.error("Error creating link:", err);
        return { success: false, error: message };
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
        return { success: true, data: updatedLink };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update link";
        setError(message);
        console.error("Error updating link:", err);
        return { success: false, error: message };
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
        return { success: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to delete link";
        setError(message);
        console.error("Error deleting link:", err);
        return { success: false, error: message };
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
