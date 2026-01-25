import { API_CONFIG, defaultFetchOptions } from "@/app/config/api";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { ApiResponse } from "@/app/types";
import type { QRConfigResponse, UpdateQRConfigDTO } from "@/app/types/qr";
import { csrfService } from "./csrfService";

class QRService {
  private baseUrl = `${API_CONFIG.BASE_URL}/link`;

  /**
   * Handle API response and extract data or throw appropriate error
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    let data: ApiResponse<T>;

    try {
      data = await response.json();
    } catch {
      throw new HttpError(
        response.status,
        'INVALID_RESPONSE',
        'Invalid response from server',
        false
      );
    }

    if (!response.ok) {
      throw new HttpError(
        response.status,
        data.code || 'UNKNOWN_ERROR',
        data.message || response.statusText,
        response.status >= 500
      );
    }

    if (!data.success || !data.data) {
      throw new HttpError(
        response.status,
        data.code || 'UNKNOWN_ERROR',
        data.message || 'Unknown error occurred',
        false
      );
    }

    return data.data;
  }

  /**
   * Make an HTTP request with timeout and error handling
   */
  private async request<T>(
    url: string,
    options: RequestInit
  ): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const method = options.method?.toUpperCase() || 'GET';
      const headers: HeadersInit = {
        ...defaultFetchOptions.headers,
        ...(options.headers || {}),
      };

      if (method !== 'GET') {
        try {
          const csrfToken = await csrfService.getToken();
          (headers as Record<string, string>)['X-CSRF-Token'] = csrfToken;
        } catch (error) {
          console.error('Failed to get CSRF token:', error);
        }
      }

      const response = await fetch(url, {
        ...defaultFetchOptions,
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError();
      }

      if (error instanceof TypeError) {
        throw new NetworkError();
      }

      throw new NetworkError('An unexpected error occurred');
    }
  }

  /**
   * Get QR config for a link
   */
  async getConfig(shortUrl: string): Promise<QRConfigResponse> {
    return this.request<QRConfigResponse>(`${this.baseUrl}/${shortUrl}/qr`, {
      method: "GET",
    });
  }

  /**
   * Update QR config for a link
   */
  async updateConfig(shortUrl: string, config: UpdateQRConfigDTO): Promise<QRConfigResponse> {
    return this.request<QRConfigResponse>(`${this.baseUrl}/${shortUrl}/qr`, {
      method: "PUT",
      body: JSON.stringify(config),
    });
  }

  /**
   * Upload a logo for QR code
   */
  async uploadLogo(
    shortUrl: string,
    file: File
  ): Promise<{ logoUrl: string; publicId: string }> {
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for uploads

      let csrfToken = '';
      try {
        csrfToken = await csrfService.getToken();
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
      }

      const response = await fetch(`${this.baseUrl}/${shortUrl}/qr/logo`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRF-Token': csrfToken,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return this.handleResponse<{ logoUrl: string; publicId: string }>(
        response
      );
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError();
      }

      throw new NetworkError('Upload failed');
    }
  }

  /**
   * Delete a logo from Cloudinary
   */
  async deleteLogo(publicId: string): Promise<void> {
    return this.request<void>(`${API_CONFIG.BASE_URL}/link/qr/logo`, {
      method: 'DELETE',
      body: JSON.stringify({ publicId }),
    });
  }
}

export const qrService = new QRService();
