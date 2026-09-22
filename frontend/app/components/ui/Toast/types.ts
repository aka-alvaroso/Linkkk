export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  showIcon?: boolean;
  showCloseButton?: boolean;
  duration?: number; // milliseconds, default 4000
  onClick?: () => void; // runs (in addition to dismissing) when the toast body is clicked
}

export interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => void;
  removeToast: (id: string) => void;
}
