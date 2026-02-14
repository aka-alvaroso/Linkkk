/**
 * Dashboard Store - Widget Layout State Management
 * Uses react-grid-layout format. Persists to localStorage via Zustand.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { LayoutItem } from "react-grid-layout";
import { WIDGET_REGISTRY, getWidgetSize } from "@/app/components/Dashboard/widgets/widgetRegistry";

export const GRID_COLS = 4;
const ROW_HEIGHT = 100;
const MARGIN: [number, number] = [8, 8];

export { ROW_HEIGHT, MARGIN };

/**
 * Convert widget size to react-grid-layout dimensions
 */
function getWidgetDimensions(widgetId: string): { w: number; h: number } {
  const size = getWidgetSize(widgetId);
  return size === "2x2" ? { w: 2, h: 2 } : { w: 1, h: 1 };
}

/**
 * Default layout for react-grid-layout
 */
const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "totalLinks", x: 0, y: 0, w: 1, h: 1 },
  { i: "totalClicks", x: 1, y: 0, w: 1, h: 1 },
  { i: "activeLinks", x: 0, y: 1, w: 1, h: 1 },
  { i: "totalScans", x: 1, y: 1, w: 1, h: 1 },
  { i: "clicksChart", x: 2, y: 0, w: 2, h: 2 },
];

const DEFAULT_VISIBLE: string[] = [
  "totalLinks",
  "totalClicks",
  "activeLinks",
  "totalScans",
  "clicksChart",
];

interface DashboardStore {
  gridLayout: LayoutItem[];
  visibleWidgets: string[];
  isEditing: boolean;
  setGridLayout: (layout: LayoutItem[]) => void;
  setEditing: (editing: boolean) => void;
  addWidget: (widgetId: string) => void;
  removeWidget: (widgetId: string) => void;
  resetLayout: () => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      gridLayout: DEFAULT_LAYOUT,
      visibleWidgets: DEFAULT_VISIBLE,
      isEditing: false,

      setGridLayout: (layout) => set({ gridLayout: layout }),

      setEditing: (editing) => set({ isEditing: editing }),

      addWidget: (widgetId) => {
        const { gridLayout, visibleWidgets } = get();
        if (visibleWidgets.includes(widgetId)) return;

        const dims = getWidgetDimensions(widgetId);

        // Place at the bottom, react-grid-layout will compact it
        const maxY = gridLayout.reduce((max, item) => Math.max(max, item.y + item.h), 0);

        const newItem: LayoutItem = {
          i: widgetId,
          x: 0,
          y: maxY,
          w: dims.w,
          h: dims.h,
        };

        set({
          gridLayout: [...gridLayout, newItem],
          visibleWidgets: [...visibleWidgets, widgetId],
        });
      },

      removeWidget: (widgetId) => {
        const { gridLayout, visibleWidgets } = get();
        set({
          gridLayout: gridLayout.filter((item) => item.i !== widgetId),
          visibleWidgets: visibleWidgets.filter((id) => id !== widgetId),
        });
      },

      resetLayout: () =>
        set({
          gridLayout: DEFAULT_LAYOUT,
          visibleWidgets: DEFAULT_VISIBLE,
        }),
    }),
    {
      name: "linkkk-dashboard-layout",
    }
  )
);
