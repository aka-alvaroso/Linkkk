export interface LinkMetadata {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  enabled: boolean;
}

export interface LinkMetadataResponse {
  shortUrl: string;
  metadata: LinkMetadata;
}

export interface UpdateLinkMetadataDTO {
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  enabled?: boolean;
}

// Default link metadata values
export const DEFAULT_LINK_METADATA: LinkMetadata = {
  ogTitle: null,
  ogDescription: null,
  ogImageUrl: null,
  enabled: true,
};
