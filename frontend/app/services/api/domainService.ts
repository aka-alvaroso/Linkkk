import { API_CONFIG, defaultFetchOptions } from "@/app/config/api";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { ApiResponse } from "@/app/types";
import { csrfService } from "./csrfService";

export interface CustomDomain {
  id: number;
  domain: string;
  status: "PENDING" | "VERIFYING" | "ACTIVE" | "ERROR";
  errorMsg: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

class DomainService {
  private baseUrl = `${API_CONFIG.BASE_URL}/domain`;

  private async handleResponse<T>(response: Response): Promise<T> {
    let data: ApiResponse<T>;
    try {
      data = await response.json();
    } catch {
      throw new HttpError(response.status, "INVALID_RESPONSE", "Invalid response from server", false);
    }
    if (!response.ok) {
      throw new HttpError(response.status, data.code || "UNKNOWN_ERROR", data.message || response.statusText, response.status >= 500);
    }
    if (!data.success || data.data === undefined) {
      throw new HttpError(response.status, data.code || "UNKNOWN_ERROR", data.message || "Unknown error occurred", false);
    }
    return data.data;
  }

  private async request<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      const method = options.method?.toUpperCase() || "GET";
      const headers: Record<string, string> = {
        ...(defaultFetchOptions.headers as Record<string, string>),
        ...(options.headers as Record<string, string> || {}),
      };
      if (method !== "GET") {
        try {
          headers["X-CSRF-Token"] = await csrfService.getToken();
        } catch { /* continue without token */ }
      }
      const response = await fetch(url, { ...defaultFetchOptions, ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof HttpError) throw error;
      if (error instanceof Error && error.name === "AbortError") throw new TimeoutError();
      if (error instanceof TypeError) throw new NetworkError();
      throw new NetworkError("An unexpected error occurred");
    }
  }

  async getAll(): Promise<CustomDomain[]> {
    return this.request<CustomDomain[]>(this.baseUrl, { method: "GET" });
  }

  async add(domain: string): Promise<CustomDomain> {
    return this.request<CustomDomain>(this.baseUrl, {
      method: "POST",
      body: JSON.stringify({ domain }),
    });
  }

  async verify(domainId: number): Promise<CustomDomain> {
    return this.request<CustomDomain>(`${this.baseUrl}/${domainId}/verify`, { method: "POST", body: JSON.stringify({}) });
  }

  async remove(domainId: number): Promise<void> {
    await this.request<{ deleted: boolean }>(`${this.baseUrl}/${domainId}`, { method: "DELETE" });
  }
}

export const domainService = new DomainService();
