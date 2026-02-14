"use client"

import Modal from "@/app/components/ui/Modal/Modal";
import Switch from "@/app/components/ui/Switch/Switch";
import Button from "@/app/components/ui/Button/Button";
import { WIDGET_REGISTRY } from "./widgets/widgetRegistry";
import { useDashboardStore } from "@/app/stores/dashboardStore";
import { useTranslations } from "next-intl";

interface WidgetConfigModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WidgetConfigModal({ open, onClose }: WidgetConfigModalProps) {
  const t = useTranslations("Dashboard");
  const { visibleWidgets, addWidget, removeWidget, resetLayout } = useDashboardStore();

  return (
    <Modal open={open} onClose={onClose} size="lg" rounded="2xl">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-black italic">{t("widgetConfigTitle")}</h2>
          <p className="text-sm text-dark/50 mt-1">
            {t("widgetConfigDesc")}
          </p>
        </div>

        {/* Widget List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.values(WIDGET_REGISTRY).map((def) => {
            const isVisible = visibleWidgets.includes(def.id);

            return (
              <div
                key={def.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                  isVisible
                    ? "bg-dark/5 border-dark/10"
                    : "bg-transparent border-dark/5"
                }`}
              >
                <div className="flex flex-col">
                  <p className="font-medium text-sm">{t(def.i18nKey)}</p>
                  <span className="text-xs text-dark/40">
                    {def.size === "2x2" ? "2×2" : "1×1"}
                  </span>
                </div>
                <Switch
                  checked={isVisible}
                  onChange={() => {
                    if (isVisible) {
                      removeWidget(def.id);
                    } else {
                      addWidget(def.id);
                    }
                  }}
                  size="sm"
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            rounded="xl"
            onClick={resetLayout}
          >
            {t("resetLayout")}
          </Button>
          <Button
            variant="solid"
            size="sm"
            rounded="xl"
            onClick={onClose}
          >
            {t("done")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
