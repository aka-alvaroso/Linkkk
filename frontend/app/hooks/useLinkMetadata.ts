import { useState, useCallback } from "react";
import { metadataService } from "@/app/services/api/metadataService";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { LinkMetadata, UpdateLinkMetadataDTO } from "@/app/types/metadata";
import { DEFAULT_LINK_METADATA } from "@/app/types/metadata";

export function useLinkMetadata(shortUrl: string) {
  const [config, setConfig] = useState<LinkMetadata>(DEFAULT_LINK_METADATA);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const fetchConfig = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await metadataService.getConfig(shortUrl);
      setConfig(response.metadata);
      return { success: true as const, data: response.metadata };
    } catch (err) {
      const message = getErrorMessage(err);
      // Don't set error for 404 - just use defaults
      if (err instanceof HttpError && err.statusCode === 404) {
        setConfig(DEFAULT_LINK_METADATA);
        return { success: true as const, data: DEFAULT_LINK_METADATA };
      }
      setError(message);
      return { success: false as const, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [shortUrl]);

  const updateConfig = useCallback(async (updates: UpdateLinkMetadataDTO) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await metadataService.updateConfig(shortUrl, updates);
      setConfig(response.metadata);
      return { success: true as const, data: response.metadata };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false as const, error: message };
    } finally {
      setIsSaving(false);
    }
  }, [shortUrl]);

  const updateLocalConfig = useCallback((updates: Partial<LinkMetadata>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_LINK_METADATA);
  }, []);

  return {
    config,
    isLoading,
    isSaving,
    error,
    fetchConfig,
    updateConfig,
    updateLocalConfig,
    resetConfig,
  };
}
