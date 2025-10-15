"use client"
import React, { useEffect, useState } from 'react';
import * as motion from 'motion/react-client';
import { ToastData, ToastType } from './types';
import { TbX, TbCircleCheck, TbCircleX, TbAlertTriangle, TbInfoCircle } from 'react-icons/tb';

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const duration = toast.duration || 4000;

  useEffect(() => {
    // Progress bar animation
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 16); // ~60fps

    // Auto remove
    const removeTimer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, duration, onRemove]);

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-success',
          border: 'border-dark',
          text: 'text-dark'
        };
      case 'error':
        return {
          bg: 'bg-danger',
          border: 'border-dark',
          text: 'text-light',
        };
      case 'warning':
        return {
          bg: 'bg-warning',
          border: 'border-dark',
          text: 'text-dark'
        };
      case 'info':
        return {
          bg: 'bg-info',
          border: 'border-dark',
          text: 'text-light'

        };
    }
  };

  const getIcon = (type: ToastType) => {
    const iconSize = 24;
    switch (type) {
      case 'success':
        return <TbCircleCheck size={iconSize} />;
      case 'error':
        return <TbCircleX size={iconSize} />;
      case 'warning':
        return <TbAlertTriangle size={iconSize} />;
      case 'info':
        return <TbInfoCircle size={iconSize} />;
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -100 }}
      transition={{ duration: 0.3, ease: "backInOut" }}
      className={`
        relative w-full max-w-md
        ${styles.bg} ${styles.border}
        border border-dark
        rounded-xl
        overflow-hidden
        cursor-pointer
      `}
      onClick={() => onRemove(toast.id)}
    >
      <div className="p-4 flex items-start gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${styles.text}`}>
          {getIcon(toast.type)}
        </div>

        {/* Content */}
        <div className={`flex-1 min-w-0 ${styles.text}`}>
          <p className="font-black italic  text-base leading-tight">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-sm mt-1 leading-tight">
              {toast.description}
            </p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(toast.id);
          }}
          className={`flex-shrink-0 transition-colors ${styles.text}`}
          aria-label="Close toast"
        >
          <TbX size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default Toast;
