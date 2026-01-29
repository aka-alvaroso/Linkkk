/**
 * useStats Hook - Business Logic for Statistics
 * Calculates aggregated statistics from links data
 */

import { useMemo } from "react";
import { useLinkStore } from "@/app/stores/linkStore";
import type { LinkStats } from "@/app/types";

export function useStats() {
  const { links, totalClicks, totalScans } = useLinkStore();

  /**
   * Calculate stats from current links
   * Memoized to avoid recalculation on every render
   */
  const calculatedStats: LinkStats = useMemo(() => {
    const totalLinks = links.length;
    const activeLinks = links.filter((link) => link.status).length;
    const inactiveLinks = totalLinks - activeLinks;

    return {
      totalLinks,
      activeLinks,
      inactiveLinks,
      totalClicks,
      totalScans,
    };
  }, [links, totalClicks, totalScans]);

  return {
    stats: calculatedStats,
    totalLinks: calculatedStats.totalLinks,
    activeLinks: calculatedStats.activeLinks,
    inactiveLinks: calculatedStats.inactiveLinks,
    totalClicks: calculatedStats.totalClicks,
    totalScans: calculatedStats.totalScans,
  };
}
