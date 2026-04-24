/**
 * Shared Types
 */

// Tag & Group types
export interface Tag {
  id: number;
  userId: number;
  name: string;
  color: string | null;
  createdAt: string;
  _count?: { links: number };
}

export interface Group {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  color: string | null;
  order: number;
  createdAt: string;
  _count?: { links: number };
}

export interface CreateTagDTO {
  name: string;
  color?: string;
}

export interface UpdateTagDTO {
  name?: string;
  color?: string | null;
}

export interface CreateGroupDTO {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateGroupDTO {
  name?: string;
  description?: string | null;
  color?: string | null;
  order?: number;
}

// Link types
export interface Link {
  id?: number;
  shortUrl: string;
  longUrl: string;
  status: boolean;
  createdAt: string;
  accessCount?: number;
  scanCount?: number;
  group?: Group | null;
  tags?: Tag[];
}

export interface CreateLinkDTO {
  longUrl: string;
  status?: boolean;
  customSuffix?: string;
  groupId?: number | null;
}

export interface UpdateLinkDTO {
  longUrl?: string;
  status?: boolean;
  newShortUrl?: string;
  groupId?: number | null;
}

// Filter types
export interface LinkFilters {
  search: string;
  status: "all" | "active" | "inactive";
  tagIds?: number[];
  groupIds?: number[];
}

// Stats types
export interface LinkStats {
  totalLinks: number;
  activeLinks: number;
  inactiveLinks: number;
  totalClicks: number;
  totalScans: number;
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
