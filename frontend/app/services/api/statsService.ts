import { API_CONFIG } from '@/app/config/api';

export type StatsPeriod = '7d' | '30d' | 'all';

export interface DayCount { date: string; count: number; }
export interface CountryCount { country: string; count: number; }
export interface BrowserCount { browser: string; count: number; }

export interface LinkStats {
  totalClicks: number;
  totalScans: number;
  clicksByDay: DayCount[];
  topCountries: CountryCount[];
  sourceBreakdown: { direct: number; qr: number };
  browserBreakdown: BrowserCount[];
  vpnCount: number;
  botCount: number;
}

export const statsService = {
  getLinkStats: async (shortUrl: string, period: StatsPeriod): Promise<LinkStats> => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch(
      `${API_CONFIG.BASE_URL}/accesses/link/${shortUrl}/stats?period=${period}&tz=${encodeURIComponent(tz)}`,
      { credentials: 'include' }
    );
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch stats');
    return data.data;
  },
};
