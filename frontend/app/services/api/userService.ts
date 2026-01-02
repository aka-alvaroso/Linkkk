import { API_CONFIG, defaultFetchOptions } from "@/app/config/api";
import { HttpError } from "@/app/utils/errors";
import type { ApiResponse } from "@/app/types";
import type { User } from "@/app/stores/authStore";
import { csrfService } from "./csrfService";

interface UpdateUserDTO {
  email?: string;
  username?: string;
  password?: string;
  locale?: 'en' | 'es';
}

class UserService {
  private baseUrl = `${API_CONFIG.BASE_URL}/user`;

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
        Array.isArray(data.details) 
          ? data.details as Array<{ field: string; message: string }>
          : undefined
      );
    }

    if (!data.success || !data.data) {
      throw new HttpError(
        response.status,
        'INVALID_RESPONSE',
        'Invalid response structure',
        false
      );
    }

    return data.data;
  }

  /**
   * Update user profile
   */
  async updateUser(updates: UpdateUserDTO): Promise<User> {
    await csrfService.ensureToken();

    const response = await fetch(`${this.baseUrl}`, {
      ...defaultFetchOptions,
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    return this.handleResponse<User>(response);
  }

  /**
   * Update user locale preference
   */
  async updateLocale(locale: 'en' | 'es'): Promise<User> {
    return this.updateUser({ locale });
  }
}

export const userService = new UserService();
