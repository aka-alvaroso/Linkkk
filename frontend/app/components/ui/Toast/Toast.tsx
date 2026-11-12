"use client"
import React, { useEffect, useRef } from 'react';
import * as motion from 'motion/react-client';
import { ToastData, ToastType } from './types';
import { TbX, TbCircleCheck, TbCircleX, TbAlertTriangle, TbInfoCircle } from 'react-icons/tb';
import { useTranslations } from 'next-intl';

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

// Errors and warnings have to be read, so they stay longer than confirmations.
const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 4000,
  info: 5000,
  warning: 7000,
  error: 8000,
};

// Dark text on every colour: light text on the red and the blue fails AA contrast.
const BACKGROUNDS: Record<ToastType, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  warning: 'bg-warning',
  info: 'bg-info',
};

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const t = useTranslations('Common');
  const duration = toast.duration ?? DEFAULT_DURATION[toast.type];
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hovering or focusing the toast pauses its countdown.
  const stopTimer = () => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
    remainingRef.current -= Date.now() - startedAtRef.current;
  };

  const startTimer = () => {
    if (timerRef.current !== null) return;
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => onRemove(toast.id), Math.max(remainingRef.current, 1000));
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, onRemove]);

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

  const isUrgent = toast.type === 'error' || toast.type === 'warning';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      role={isUrgent ? 'alert' : 'status'}
      className={`
        relative w-full max-w-md
        ${BACKGROUNDS[toast.type]}
        text-dark
        border border-dark
        shadow-[4px_4px_0_var(--color-dark)]
        rounded-xl
        overflow-hidden
        ${toast.onClick ? 'cursor-pointer' : ''}
      `}
      onMouseEnter={stopTimer}
      onMouseLeave={startTimer}
      onFocus={stopTimer}
      onBlur={startTimer}
      onClick={() => {
        if (!toast.onClick) return;
        toast.onClick();
        onRemove(toast.id);
      }}
    >
      <div className="p-4 pr-2 flex items-start gap-3">
        {toast.showIcon !== false && (
          <div className="flex-shrink-0" aria-hidden="true">
            {getIcon(toast.type)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-black italic text-base leading-tight">
            {toast.title}
          </p>
          {toast.description && (
            <p className="text-sm mt-1 leading-tight whitespace-pre-line">
              {toast.description}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(toast.id);
          }}
          className="flex-shrink-0 -my-2 size-11 flex items-center justify-center rounded-lg cursor-pointer hover:bg-dark/10 transition-colors"
          aria-label={t('closeToast')}
        >
          <TbX size={20} />
        </button>
      </div>
    </motion.div>
  );
};

export default Toast;
