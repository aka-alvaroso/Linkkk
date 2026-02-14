/**
 * Widget Registry - Central definition of all available dashboard widgets
 */

import type { ComponentType } from "react";
import type { WidgetSize } from "@/app/types";

export interface WidgetDefinition {
  id: string;
  i18nKey: string;
  size: WidgetSize;
  component: ComponentType;
  defaultVisible: boolean;
  defaultOrder: number;
}

// Lazy imports to avoid circular dependencies
import TotalLinksWidget from "./TotalLinksWidget";
import TotalClicksWidget from "./TotalClicksWidget";
import ActiveLinksWidget from "./ActiveLinksWidget";
import TotalScansWidget from "./TotalScansWidget";
import ApiUsageWidget from "./ApiUsageWidget";
import ClicksChartWidget from "./ClicksChartWidget";

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  totalLinks: {
    id: "totalLinks",
    i18nKey: "totalLinks",
    size: "1x1",
    component: TotalLinksWidget,
    defaultVisible: true,
    defaultOrder: 0,
  },
  totalClicks: {
    id: "totalClicks",
    i18nKey: "totalClicks",
    size: "1x1",
    component: TotalClicksWidget,
    defaultVisible: true,
    defaultOrder: 1,
  },
  activeLinks: {
    id: "activeLinks",
    i18nKey: "activeLinks",
    size: "1x1",
    component: ActiveLinksWidget,
    defaultVisible: true,
    defaultOrder: 2,
  },
  totalScans: {
    id: "totalScans",
    i18nKey: "totalScans",
    size: "1x1",
    component: TotalScansWidget,
    defaultVisible: true,
    defaultOrder: 3,
  },
  apiUsage: {
    id: "apiUsage",
    i18nKey: "apiUsage",
    size: "1x1",
    component: ApiUsageWidget,
    defaultVisible: false,
    defaultOrder: 4,
  },
  clicksChart: {
    id: "clicksChart",
    i18nKey: "clicksChart",
    size: "2x2",
    component: ClicksChartWidget,
    defaultVisible: true,
    defaultOrder: 5,
  },
};

export function getWidgetSize(widgetId: string): WidgetSize {
  return WIDGET_REGISTRY[widgetId]?.size ?? "1x1";
}

export function getAllWidgetSizes(): Record<string, WidgetSize> {
  return Object.fromEntries(
    Object.entries(WIDGET_REGISTRY).map(([id, def]) => [id, def.size])
  );
}
