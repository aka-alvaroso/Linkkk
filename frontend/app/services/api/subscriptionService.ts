import { API_CONFIG, defaultFetchOptions } from "@/app/config/api";
import { HttpError } from "@/app/utils/errors";
import type { ApiResponse } from "@/app/types";
import { csrfService } from "./csrfService";

interface CheckoutSessionResponse {
  url: string;
}

interface PortalSessionResponse {
  url: string;
}

interface SubscriptionStatusResponse {
  plan: "STANDARD" | "PRO";
  subscription: {
    status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "INACTIVE" | "TRIALING";
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  limits: {
    links: {
      used: number;
      max: number | null;
      unlimited: boolean;
    };
    rulesPerLink: number | null;
    conditionsPerRule: number | null;
    linkAnalytics: {
      linkAccessesDuration: number | null;
      linkAccessesMaxCount: number | null;
      linkAnalyticsEnabled: boolean;
      linkChartEnabled: boolean;
    };
  };
}

class SubscriptionService {
  private baseUrl = `${API_CONFIG.BASE_URL}/subscription`;

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
        "INVALID_RESPONSE",
        "Invalid response from server",
        false
      );
    }

    if (!response.ok) {
      throw new HttpError(
        response.status,
        data.code || "UNKNOWN_ERROR",
        data.message || response.statusText,
        response.status >= 500,
        data.details as Array<{ field: string; message: string }> | undefined
      );
    }

    return data.data as T;
  }

  /**
   * Get current subscription status and usage
   */
  async getStatus(): Promise<SubscriptionStatusResponse> {
    const response = await fetch(`${this.baseUrl}/status`, {
      ...defaultFetchOptions,
      method: "GET",
      credentials: "include",
    });

    return this.handleResponse<SubscriptionStatusResponse>(response);
  }

  /**
   * Create a Stripe Checkout Session and redirect to payment page
   */
  async createCheckoutSession(): Promise<void> {
    const csrfToken = await csrfService.getToken();

    const response = await fetch(`${this.baseUrl}/create-checkout-session`, {
      ...defaultFetchOptions,
      method: "POST",
      credentials: "include",
      headers: {
        ...defaultFetchOptions.headers,
        "X-CSRF-Token": csrfToken,
      },
    });

    const data = await this.handleResponse<CheckoutSessionResponse>(response);

    // Redirect to Stripe Checkout
    window.location.href = data.url;
  }

  /**
   * Create a Stripe Customer Portal Session and redirect to management page
   */
  async createPortalSession(): Promise<void> {
    const csrfToken = await csrfService.getToken();

    const response = await fetch(`${this.baseUrl}/create-portal-session`, {
      ...defaultFetchOptions,
      method: "POST",
      credentials: "include",
      headers: {
        ...defaultFetchOptions.headers,
        "X-CSRF-Token": csrfToken,
      },
    });

    const data = await this.handleResponse<PortalSessionResponse>(response);

    // Redirect to Stripe Customer Portal
    window.location.href = data.url;
  }

  /**
   * Cancel subscription (marks it to cancel at period end)
   */
  async cancelSubscription(): Promise<void> {
    const csrfToken = await csrfService.getToken();

    const response = await fetch(`${this.baseUrl}/cancel`, {
      ...defaultFetchOptions,
      method: "POST",
      credentials: "include",
      headers: {
        ...defaultFetchOptions.headers,
        "X-CSRF-Token": csrfToken,
      },
    });

    await this.handleResponse(response);
  }
}

export const subscriptionService = new SubscriptionService();
