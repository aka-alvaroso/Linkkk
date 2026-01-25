import { useState, useCallback } from "react";
import { qrService } from "@/app/services/api/qrService";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { QRConfig, UpdateQRConfigDTO } from "@/app/types/qr";
import { DEFAULT_QR_CONFIG } from "@/app/types/qr";

export function useQRConfig(shortUrl: string) {
  const [config, setConfig] = useState<QRConfig>(DEFAULT_QR_CONFIG);
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
      const response = await qrService.getConfig(shortUrl);
      setConfig(response.qrConfig);
      return { success: true as const, data: response.qrConfig };
    } catch (err) {
      const message = getErrorMessage(err);
      // Don't set error for 404 - just use defaults
      if (err instanceof HttpError && err.statusCode === 404) {
        setConfig(DEFAULT_QR_CONFIG);
        return { success: true as const, data: DEFAULT_QR_CONFIG };
      }
      setError(message);
      return { success: false as const, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [shortUrl]);

  const updateConfig = useCallback(async (updates: UpdateQRConfigDTO) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await qrService.updateConfig(shortUrl, updates);
      setConfig(response.qrConfig);
      return { success: true as const, data: response.qrConfig };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false as const, error: message };
    } finally {
      setIsSaving(false);
    }
  }, [shortUrl]);

  const updateLocalConfig = useCallback((updates: Partial<QRConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_QR_CONFIG);
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
