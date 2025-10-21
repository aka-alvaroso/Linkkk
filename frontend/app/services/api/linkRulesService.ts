import { API_CONFIG, defaultFetchOptions } from "@/app/config/api";
import { HttpError, NetworkError, TimeoutError } from "@/app/utils/errors";
import type {
  LinkRule,
  CreateRuleDTO,
  UpdateRuleDTO,
  BatchCreateRulesDTO,
  ApiResponse,
} from "@/app/types";

class LinkRulesService {
  /**
   * Build the base URL for a specific link's rules
   */
  private getRulesBaseUrl(shortUrl: string): string {
    return `${API_CONFIG.BASE_URL}/link/${shortUrl}/rules`;
  }

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
        (data as any).validation // Include validation errors if present
      );
    }

    // Handle successful but malformed responses
    if (!data.success || data.data === undefined) {
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

  /**
   * Get all rules for a specific link
   * GET /link/:shortUrl/rules
   */
  async getAll(shortUrl: string): Promise<LinkRule[]> {
    return this.request<LinkRule[]>(this.getRulesBaseUrl(shortUrl), {
      method: "GET",
    });
  }

  /**
   * Get a specific rule by ID
   * GET /link/:shortUrl/rules/:ruleId
   */
  async getOne(shortUrl: string, ruleId: number): Promise<LinkRule> {
    return this.request<LinkRule>(`${this.getRulesBaseUrl(shortUrl)}/${ruleId}`, {
      method: "GET",
    });
  }

  /**
   * Create a new rule for a link
   * POST /link/:shortUrl/rules
   */
  async create(shortUrl: string, ruleData: CreateRuleDTO): Promise<LinkRule> {
    return this.request<LinkRule>(this.getRulesBaseUrl(shortUrl), {
      method: "POST",
      body: JSON.stringify(ruleData),
    });
  }

  /**
   * Update an existing rule
   * PUT /link/:shortUrl/rules/:ruleId
   */
  async update(
    shortUrl: string,
    ruleId: number,
    ruleData: UpdateRuleDTO
  ): Promise<LinkRule> {
    return this.request<LinkRule>(`${this.getRulesBaseUrl(shortUrl)}/${ruleId}`, {
      method: "PUT",
      body: JSON.stringify(ruleData),
    });
  }

  /**
   * Delete a rule
   * DELETE /link/:shortUrl/rules/:ruleId
   */
  async delete(shortUrl: string, ruleId: number): Promise<void> {
    await this.request<{ message: string }>(
      `${this.getRulesBaseUrl(shortUrl)}/${ruleId}`,
      {
        method: "DELETE",
      }
    );
  }

  /**
   * Batch create multiple rules
   * POST /link/:shortUrl/rules/batch
   */
  async batchCreate(
    shortUrl: string,
    batchData: BatchCreateRulesDTO
  ): Promise<LinkRule[]> {
    return this.request<LinkRule[]>(`${this.getRulesBaseUrl(shortUrl)}/batch`, {
      method: "POST",
      body: JSON.stringify(batchData),
    });
  }
}

export const linkRulesService = new LinkRulesService();
