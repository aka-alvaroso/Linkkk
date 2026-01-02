/**
 * CSRF Token Service
 * Manages CSRF token fetching and storage for API requests
 */

import { API_CONFIG } from "@/app/config/api";

class CsrfService {
  private token: string | null = null;
  private tokenPromise: Promise<string> | null = null;

  /**
   * Get the current CSRF token, fetching it if necessary
   */
  async getToken(): Promise<string> {
    // If we already have a token, return it
    if (this.token) {
      return this.token;
    }

    // If a fetch is already in progress, wait for it
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    // Fetch a new token
    this.tokenPromise = this.fetchToken();

    try {
      this.token = await this.tokenPromise;
      return this.token;
    } finally {
      this.tokenPromise = null;
    }
  }

  /**
   * Fetch a fresh CSRF token from the server
   */
  private async fetchToken(): Promise<string> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();

      if (!data.csrfToken) {
        throw new Error('CSRF token not found in response');
      }

      return data.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }

  /**
   * Clear the stored token (e.g., on logout or when token becomes invalid)
   */
  clearToken(): void {
    this.token = null;
    this.tokenPromise = null;
  }

  /**
   * Refresh the CSRF token
   */
  async refreshToken(): Promise<string> {
    this.clearToken();
    return this.getToken();
  }

  /**
   * Ensure we have a valid CSRF token
   * If no token exists, fetch a new one
   */
  async ensureToken(): Promise<void> {
    if (!this.token) {
      await this.getToken();
    }
  }
}

// Export a singleton instance
export const csrfService = new CsrfService();
