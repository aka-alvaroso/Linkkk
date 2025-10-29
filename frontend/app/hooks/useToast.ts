"use client";
import { useContext } from "react";
import { ToastContext } from "@/app/contexts/ToastContext";
import { ToastType } from "@/app/components/ui/Toast/types";

interface ToastOptions {
  description?: string;
  duration?: number;
  showIcon?: boolean;
}

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { addToast } = context;

  const createToast = (
    type: ToastType,
    title: string,
    options?: ToastOptions
  ) => {
    addToast({
      type,
      title,
      description: options?.description,
      duration: options?.duration,
      showIcon: options?.showIcon,
    });
  };

  return {
    success: (title: string, options?: ToastOptions) =>
      createToast("success", title, options),
    error: (title: string, options?: ToastOptions) =>
      createToast("error", title, options),
    warning: (title: string, options?: ToastOptions) =>
      createToast("warning", title, options),
    info: (title: string, options?: ToastOptions) =>
      createToast("info", title, options),
  };
};
