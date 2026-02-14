/**
 * Shared Types
 */

// Link types
export interface Link {
  shortUrl: string;
  longUrl: string;
  status: boolean;
  createdAt: string;
  accessCount?: number;
  scanCount?: number;
}

export interface CreateLinkDTO {
  longUrl: string;
  status?: boolean;
}

export interface UpdateLinkDTO {
  longUrl?: string;
  status?: boolean;
}

// Filter types
export interface LinkFilters {
  search: string;
  status: "all" | "active" | "inactive";
}

// Stats types
export interface LinkStats {
  totalLinks: number;
  activeLinks: number;
  inactiveLinks: number;
  totalClicks: number;
  totalScans: number;
}

// Widget types
export type WidgetSize = '1x1' | '2x2';

export interface WidgetLayoutItem {
  widgetId: string;
  visible: boolean;
  col: number;
  row: number;
}

export interface DashboardLayout {
  version: number;
  items: WidgetLayoutItem[];
}

// Analytics types
export interface DailyClicksEntry {
  date: string;
  clicks: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  details?: unknown;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

// GetAllLinks response type
export interface GetAllLinksResponse {
  links: Link[];
  stats: {
    totalClicks: number;
    totalScans: number;
  };
}
