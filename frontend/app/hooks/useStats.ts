/**
 * useStats Hook - Business Logic for Statistics
 * Calculates aggregated statistics from links data
 */

import { useMemo } from "react";
import { useLinkStore } from "@/app/stores/linkStore";
import { useStatsStore } from "@/app/stores/statsStore";
import type { LinkStats } from "@/app/types";

export function useStats() {
  const { links } = useLinkStore();
  const { stats: storedStats, setStats } = useStatsStore();

  /**
   * Calculate stats from current links
   * Memoized to avoid recalculation on every render
   */
  const calculatedStats: LinkStats = useMemo(() => {
    const totalLinks = links.length;
    const activeLinks = links.filter((link) => link.status).length;
    const inactiveLinks = totalLinks - activeLinks;

    // For beta, we don't have click data yet
    // This will be populated from API in future
    const totalClicks = 0;

    const stats: LinkStats = {
      totalLinks,
      activeLinks,
      inactiveLinks,
      totalClicks,
    };

    // Update store with calculated stats
    setStats(stats);

    return stats;
  }, [links, setStats]);

  return {
    stats: calculatedStats,
    // Individual stats for convenience
    totalLinks: calculatedStats.totalLinks,
    activeLinks: calculatedStats.activeLinks,
    inactiveLinks: calculatedStats.inactiveLinks,
    totalClicks: calculatedStats.totalClicks,
  };
}
