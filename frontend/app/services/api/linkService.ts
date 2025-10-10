import { API_CONFIG, defaultFetchOptions } from "@/app/config/api";
import type {
  Link,
  CreateLinkDTO,
  UpdateLinkDTO,
  ApiResponse,
  GetAllLinksResponse,
} from "@/app/types";

class LinkService {
  private baseUrl = `${API_CONFIG.BASE_URL}/link`;

  async getAll(): Promise<GetAllLinksResponse> {
    const response = await fetch(this.baseUrl, {
      ...defaultFetchOptions,
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch links: ${response.statusText}`);
    }

    const data: ApiResponse<GetAllLinksResponse> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch links");
    }

    return data.data;
  }

  async getOne(shortUrl: string): Promise<Link> {
    const response = await fetch(`${this.baseUrl}/${shortUrl}`, {
      ...defaultFetchOptions,
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch link: ${response.statusText}`);
    }

    const data: ApiResponse<Link> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch link");
    }

    return data.data;
  }

  async create(linkData: CreateLinkDTO): Promise<Link> {
    const response = await fetch(this.baseUrl, {
      ...defaultFetchOptions,
      method: "POST",
      body: JSON.stringify(linkData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create link: ${response.statusText}`);
    }

    const data: ApiResponse<Link> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to create link");
    }

    return data.data;
  }

  async update(shortUrl: string, linkData: UpdateLinkDTO): Promise<Link> {
    const response = await fetch(`${this.baseUrl}/${shortUrl}`, {
      ...defaultFetchOptions,
      method: "PUT",
      body: JSON.stringify(linkData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update link: ${response.statusText}`);
    }

    const data: ApiResponse<Link> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to update link");
    }

    return data.data;
  }

  async delete(shortUrl: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${shortUrl}`, {
      ...defaultFetchOptions,
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete link: ${response.statusText}`);
    }

    const data: ApiResponse<Link> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to delete link");
    }
  }
}

export const linkService = new LinkService();
