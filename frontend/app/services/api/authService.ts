import { API_CONFIG, defaultFetchOptions } from "@/app/config/api";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type { ApiResponse } from "@/app/types";
import type { User } from "@/app/stores/authStore";

interface LoginDTO {
  usernameOrEmail: string;
  password: string;
}

interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

interface SessionResponse {
  user?: User;
  guest?: {
    guestSessionId: string;
  };
}

class AuthService {
  private baseUrl = `${API_CONFIG.BASE_URL}/auth`;

  /**
   * Handle API response and extract data or throw appropriate error
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    let data: ApiResponse<T>;

    try {
      data = await response.json();
    } catch (error) {
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
        response.status >= 500,
        (data as any).validation
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

      const response = await fetch(url, {
        ...defaultFetchOptions,
        ...options,
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
   * Validate current session
   */
  async validateSession(): Promise<SessionResponse> {
    return this.request<SessionResponse>(`${this.baseUrl}/validate`, {
      method: "GET",
    });
  }

  /**
   * Create guest session
   */
  async createGuestSession(): Promise<{ guestSession: { id: string; createdAt: string } }> {
    return this.request<{ guestSession: { id: string; createdAt: string } }>(`${this.baseUrl}/guest`, {
      method: "POST",
    });
  }

  /**
   * Login user
   */
  async login(credentials: LoginDTO): Promise<{ user: User }> {
    return this.request<{ user: User }>(`${this.baseUrl}/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Register new user
   */
  async register(userData: RegisterDTO): Promise<{ user: User }> {
    return this.request<{ user: User }>(`${this.baseUrl}/register`, {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  /**
   * Logout current user
   */
  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>(`${this.baseUrl}/logout`, {
      method: "POST",
    });
  }
}

export const authService = new AuthService();
export type { LoginDTO, RegisterDTO, User, SessionResponse };
