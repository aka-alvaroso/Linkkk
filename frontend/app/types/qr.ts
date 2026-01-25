export type DotsStyle = 'square' | 'rounded' | 'dots';
export type CornersStyle = 'square' | 'rounded';

export interface QRConfig {
  foregroundColor: string;
  backgroundColor: string;
  logoUrl: string | null;
  logoSize: number;
  dotsStyle: DotsStyle;
  cornersStyle: CornersStyle;
}

export interface QRConfigResponse {
  shortUrl: string;
  qrConfig: QRConfig;
}

export interface UpdateQRConfigDTO {
  foregroundColor?: string;
  backgroundColor?: string;
  logoUrl?: string | null;
  logoSize?: number;
  dotsStyle?: DotsStyle;
  cornersStyle?: CornersStyle;
}

// Default QR config values
export const DEFAULT_QR_CONFIG: QRConfig = {
  foregroundColor: '#000000',
  backgroundColor: '#FFFFFF',
  logoUrl: null,
  logoSize: 0.4,
  dotsStyle: 'square',
  cornersStyle: 'square',
};
