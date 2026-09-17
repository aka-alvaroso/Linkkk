'use client';

import { useEffect } from 'react';
import type { AccessEvent } from '@/app/types/realtime';

// Dispatched on `window` by RealtimeProvider whenever the backend's SSE
// stream reports a new access, so any mounted component can react without
// its own EventSource connection.
export const LINK_ACCESS_EVENT = 'linkkk:access';

export function dispatchLinkAccessEvent(detail: AccessEvent) {
  window.dispatchEvent(new CustomEvent<AccessEvent>(LINK_ACCESS_EVENT, { detail }));
}

// Runs `onAccess` whenever a realtime access event arrives for `shortUrl`.
// Pass `undefined` to skip subscribing (e.g. while a drawer is closed).
export function useLinkAccessEvent(shortUrl: string | undefined, onAccess: (event: AccessEvent) => void) {
  useEffect(() => {
    if (!shortUrl) return;

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AccessEvent>).detail;
      if (detail?.shortUrl === shortUrl) {
        onAccess(detail);
      }
    };

    window.addEventListener(LINK_ACCESS_EVENT, handler);
    return () => window.removeEventListener(LINK_ACCESS_EVENT, handler);
  }, [shortUrl, onAccess]);
}
