"use client"

import * as motion from 'motion/react-client';
import { useTranslations } from 'next-intl';
import { useDailyClicks } from "@/app/hooks/useDailyClicks";

function formatShortDay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 3);
}

export default function ClicksChartWidget() {
  const t = useTranslations('Dashboard');
  const { dailyClicks, isLoading } = useDailyClicks(7);

  const maxClicks = Math.max(...dailyClicks.map(d => d.clicks), 1);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-md mb-2">{t('clicksChart')}</h2>
        <div className="flex-1 flex items-center justify-center">
          <span className="text-dark/40 text-sm">...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-md mb-2">{t('clicksChart')}</h2>
      <div className="flex-1 flex items-end gap-1.5 min-h-0">
        {dailyClicks.map((day, i) => (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1 min-h-0 h-full justify-end">
            <span className="text-xs text-dark/60 font-medium">{day.clicks}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(day.clicks / maxClicks) * 100}%` }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: "backInOut" }}
              className="w-full bg-dark/80 rounded-t-md"
              style={{ minHeight: '2px' }}
            />
            <span className="text-[10px] text-dark/40">
              {formatShortDay(day.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
