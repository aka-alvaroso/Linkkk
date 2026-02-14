import { API_CONFIG, defaultFetchOptions } from "@/app/config/api";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { ApiResponse, DailyClicksEntry } from "@/app/types";

class AnalyticsService {
  private baseUrl = `${API_CONFIG.BASE_URL}/analytics`;

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

  private async request<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

      const response = await fetch(url, {
        ...defaultFetchOptions,
        ...options,
        headers: {
          ...defaultFetchOptions.headers,
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof HttpError) throw error;
      if (error instanceof Error && error.name === 'AbortError') throw new TimeoutError();
      if (error instanceof TypeError) throw new NetworkError();
      throw new NetworkError('An unexpected error occurred');
    }
  }

  async getDailyClicks(days: number = 7): Promise<DailyClicksEntry[]> {
    return this.request<DailyClicksEntry[]>(
      `${this.baseUrl}/clicks/daily?days=${days}`,
      { method: "GET" }
    );
  }
}

export const analyticsService = new AnalyticsService();
