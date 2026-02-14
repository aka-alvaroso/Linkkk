"use client"

import { useCallback, useMemo } from "react";
import type { LayoutItem, Layout } from "react-grid-layout";
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from "react-grid-layout";
import { TbX } from "react-icons/tb";
import { useDashboardStore, GRID_COLS, ROW_HEIGHT, MARGIN } from "@/app/stores/dashboardStore";
import { WIDGET_REGISTRY } from "./widgets/widgetRegistry";
import WidgetShell from "./widgets/WidgetShell";

import "react-grid-layout/css/styles.css";

export default function DashboardGrid() {
  const {
    gridLayout,
    visibleWidgets,
    isEditing,
    setGridLayout,
    removeWidget,
  } = useDashboardStore();

  const { width, containerRef } = useContainerWidth();

  const handleLayoutChange = useCallback(
    (newLayout: Layout) => {
      const preserved = newLayout.map((item) => {
        const def = WIDGET_REGISTRY[item.i];
        if (!def) return item;
        const dims = def.size === "2x2" ? { w: 2, h: 2 } : { w: 1, h: 1 };
        return { ...item, w: dims.w, h: dims.h };
      });
      setGridLayout(preserved as LayoutItem[]);
    },
    [setGridLayout]
  );

  const layouts = useMemo(() => {
    const visibleLayout = gridLayout.filter((item) =>
      visibleWidgets.includes(item.i)
    );

    const smLayout: LayoutItem[] = visibleLayout.map((item, index) => ({
      ...item,
      x: 0,
      y: index,
      w: 2,
      h: 1,
      static: true,
    }));

    return {
      lg: visibleLayout,
      md: visibleLayout,
      sm: smLayout,
    };
  }, [gridLayout, visibleWidgets]);

  return (
    <div ref={containerRef} className={isEditing ? "dashboard-editing" : ""}>
      {width > 0 && (
        <ResponsiveGridLayout
          width={width}
          layouts={layouts}
          breakpoints={{ lg: 1024, md: 768, sm: 0 }}
          cols={{ lg: GRID_COLS, md: GRID_COLS, sm: 2 }}
          rowHeight={ROW_HEIGHT}
          margin={MARGIN}
          compactor={verticalCompactor}
          dragConfig={{
            enabled: isEditing,
            handle: ".widget-drag-handle",
          }}
          resizeConfig={{
            enabled: false,
          }}
          onLayoutChange={(layout) => handleLayoutChange(layout)}
        >
          {visibleWidgets.map((widgetId) => {
            const def = WIDGET_REGISTRY[widgetId];
            if (!def) return null;
            const Component = def.component;

            return (
              <div key={widgetId} className="relative group">
                <WidgetShell
                  size={def.size}
                  className={`h-full ${isEditing ? "widget-drag-handle cursor-grab active:cursor-grabbing ring-1 ring-transparent hover:ring-dark/10" : ""}`}
                >
                  <Component />
                </WidgetShell>

                {isEditing && (
                  <button
                    onClick={() => removeWidget(widgetId)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-light rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:scale-110"
                  >
                    <TbX size={12} strokeWidth={3} />
                  </button>
                )}
              </div>
            );
          })}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
