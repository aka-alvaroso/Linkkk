import React, { useState, useEffect } from 'react';
import { cn } from '@/app/utils/cn';
import { TbX, TbInfoCircle, TbAlertTriangle, TbCircleCheck, TbAlertCircle } from 'react-icons/tb';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import Button from '../Button/Button';

interface AlertProps {
  id: string; // Unique ID for localStorage persistence
  type?: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  message: string;
  dismissible?: boolean;
  persistent?: boolean; // If true, uses localStorage to remember dismissal
  icon?: React.ReactNode;
  className?: string;
  onDismiss?: () => void;
}

const Alert: React.FC<AlertProps> = ({
  id,
  type = 'info',
  title,
  message,
  dismissible = true,
  persistent = true,
  icon,
  className = '',
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const storageKey = `alert-dismissed-${id}`;

  // Check if alert was previously dismissed
  useEffect(() => {
    if (persistent && typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(storageKey);
      if (dismissed === 'true') {
        setIsVisible(false);
      }
    }
  }, [persistent, storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);

    // Save dismissal to localStorage if persistent
    if (persistent && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, 'true');
    }

    // Call optional onDismiss callback
    onDismiss?.();
  };

  // Type-based styling (toast style)
  const typeConfig = {
    info: {
      bg: 'bg-info',
      text: 'text-light',
      icon: <TbInfoCircle size={20} />,
    },
    warning: {
      bg: 'bg-warning',
      text: 'text-dark',
      icon: <TbAlertTriangle size={20} />,
    },
    success: {
      bg: 'bg-success',
      text: 'text-dark',
      icon: <TbCircleCheck size={20} />,
    },
    error: {
      bg: 'bg-danger',
      text: 'text-light',
      icon: <TbAlertCircle size={20} />,
    },
  };

  const config = typeConfig[type];
  const displayIcon = icon || config.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ duration: 0.3, ease: 'backInOut' }}
          className={cn(
            'overflow-hidden flex items-center gap-3 p-3 rounded-xl border border-dark shadow-[4px_4px_0_var(--color-dark)]',
            config.bg,
            className
          )}
        >
            {/* Icon */}
            <div className={cn('flex-shrink-0', config.text)}>
              {displayIcon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className={cn('font-bold text-sm mb-0.5', config.text)}>
                  {title}
                </h3>
              )}
              <p className={cn('text-xs leading-tight', config.text, title ? 'opacity-90' : 'opacity-95')}>
                {message}
              </p>
            </div>

            {/* Dismiss button */}
            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                rounded="xl"
                onClick={handleDismiss}
                className={cn('flex-shrink-0', config.text === 'text-light' ? 'hover:bg-light/10' : 'hover:bg-dark/10')}
                aria-label="Dismiss alert"
              >
                <TbX size={16} className={config.text} />
              </Button>
            )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Alert;
