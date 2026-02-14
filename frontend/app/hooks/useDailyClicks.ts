import { useState, useEffect } from "react";
import { analyticsService } from "@/app/services/api/analyticsService";
import type { DailyClicksEntry } from "@/app/types";

export function useDailyClicks(days: number = 7) {
  const [dailyClicks, setDailyClicks] = useState<DailyClicksEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    analyticsService
      .getDailyClicks(days)
      .then((data) => {
        if (!cancelled) setDailyClicks(data);
      })
      .catch((error) => {
        if (!cancelled) console.error("Error fetching daily clicks:", error);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [days]);

  return { dailyClicks, isLoading };
}
