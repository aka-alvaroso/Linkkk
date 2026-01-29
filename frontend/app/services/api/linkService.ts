import { API_CONFIG, defaultFetchOptions } from "@/app/config/api";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type {
  Link,
  CreateLinkDTO,
  UpdateLinkDTO,
  ApiResponse,
  GetAllLinksResponse,
} from "@/app/types";
import { csrfService } from "./csrfService";

class LinkService {
  private baseUrl = `${API_CONFIG.BASE_URL}/link`;

  /**
   * Handle API response and extract data or throw appropriate error
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    let data: ApiResponse<T>;

    try {
      data = await response.json();
    } catch (error) {
      // Failed to parse JSON
      throw new HttpError(
        response.status,
        'INVALID_RESPONSE',
        'Invalid response from server',
        false
      );
    }

    // Handle error responses
    if (!response.ok) {
      throw new HttpError(
        response.status,
        data.code || 'UNKNOWN_ERROR',
        data.message || response.statusText,
        response.status >= 500, // Server errors are retryable
        undefined // TODO: Convert validation format if needed
      );
    }

    // Handle successful but malformed responses
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

      // Get CSRF token for non-GET requests
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
          // Continue without CSRF token - let the server handle it
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
      // Re-throw HttpError as-is
      if (error instanceof HttpError) {
        throw error;
      }

      // Handle abort/timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError();
      }

      // Handle network errors (fetch failed, no internet, etc.)
      if (error instanceof TypeError) {
        throw new NetworkError();
      }

      // Unknown error
      throw new NetworkError('An unexpected error occurred');
    }
  }

  async getAll(): Promise<GetAllLinksResponse> {
    return this.request<GetAllLinksResponse>(this.baseUrl, {
      method: "GET",
    });
  }

  async getOne(shortUrl: string): Promise<Link> {
    return this.request<Link>(`${this.baseUrl}/${shortUrl}`, {
      method: "GET",
    });
  }

  async create(linkData: CreateLinkDTO): Promise<Link> {
    return this.request<Link>(this.baseUrl, {
      method: "POST",
      body: JSON.stringify(linkData),
    });
  }

  async update(shortUrl: string, linkData: UpdateLinkDTO): Promise<Link> {
    return this.request<Link>(`${this.baseUrl}/${shortUrl}`, {
      method: "PUT",
      body: JSON.stringify(linkData),
    });
  }

  async delete(shortUrl: string): Promise<void> {
    await this.request<Link>(`${this.baseUrl}/${shortUrl}`, {
      method: "DELETE",
    });
  }

  async verifyPassword(shortUrl: string, password: string, src?: string | null): Promise<{ success: boolean; url: string }> {
    return this.request<{ success: boolean; url: string }>(`${this.baseUrl}/${shortUrl}/verify-password`, {
      method: "POST",
      body: JSON.stringify({ password, ...(src && { src }) }),
    });
  }
}

export const linkService = new LinkService();
