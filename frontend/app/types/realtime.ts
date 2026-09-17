export interface AccessEvent {
  shortUrl: string;
  source: 'direct' | 'qr';
  country: string;
  device: string;
  accessCount: number;
  scanCount: number;
  createdAt: string;
}
