'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getCountryName } from '@/app/utils/countryName';
import { useAuthStore } from '@/app/stores/authStore';
import { useLinkStore } from '@/app/stores/linkStore';
import { useLinkDrawerStore } from '@/app/stores/linkDrawerStore';
import { useToast } from '@/app/hooks/useToast';
import { dispatchLinkAccessEvent } from '@/app/hooks/useLinkAccessEvent';
import { API_CONFIG } from '@/app/config/api';
import type { AccessEvent } from '@/app/types/realtime';

// Opens the SSE stream of the current user's own link activity for as long
// as they're logged in (guests don't get one — see backend/v2/controllers/realtime.js),
// and fans each event out to the link store (so counters everywhere update)
// and a toast, then re-dispatches it as a DOM event for components that need
// to react to a specific link (e.g. the edit drawer's chart and access list).
export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const sessionChecked = useAuthStore((state) => state.sessionChecked);
  const toast = useToast();
  const t = useTranslations('Realtime');
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (!sessionChecked || !isAuthenticated) return;

    const eventSource = new EventSource(`${API_CONFIG.BASE_URL}/realtime/stream`, {
      withCredentials: true,
    });

    eventSource.addEventListener('access', (event: MessageEvent) => {
      let data: AccessEvent;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      const { updateLinkInStore, totalClicks, totalScans, setTotalClicks, setTotalScans } =
        useLinkStore.getState();

      updateLinkInStore(data.shortUrl, {
        accessCount: data.accessCount,
        scanCount: data.scanCount,
      });

      if (data.source === 'qr') {
        setTotalScans(totalScans + 1);
      } else {
        setTotalClicks(totalClicks + 1);
      }

      const countryName = getCountryName(data.country, locale) ?? t('unknownCountry');

      toast.info(data.source === 'qr' ? t('newScan') : t('newClick'), {
        description: t('accessDetails', { shortUrl: data.shortUrl, country: countryName }),
        onClick: () => {
          useLinkDrawerStore.getState().requestOpen(data.shortUrl);
          if (window.location.pathname !== '/dashboard') {
            router.push('/dashboard');
          }
        },
      });

      dispatchLinkAccessEvent(data);
    });

    // EventSource retries automatically on drop/network error; nothing to do here.
    eventSource.onerror = () => {};

    return () => eventSource.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, sessionChecked]);

  return <>{children}</>;
}
