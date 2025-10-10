import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TbX } from 'react-icons/tb';
import { cn } from '@/app/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;

  // Layout & Position
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  position?: 'center' | 'top' | 'bottom';

  // Styling
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  className?: string;
  overlayClassName?: string;

  // Behavior
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;

  // Animation
  animationDuration?: number;
}

const Modal: React.FC<ModalProps> = ({
  open = false,
  onClose,
  children,
  size = 'md',
  position = 'center',
  rounded = '2xl',
  className,
  overlayClassName,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true,
  preventScroll = true,
  animationDuration = 300,
}) => {
  const [show, setShow] = useState(open);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      // Prevent body scroll
      if (preventScroll) {
        document.body.style.overflow = 'hidden';
      }

      // ESC key handler
      if (closeOnEsc) {
        const handleEsc = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            onClose();
          }
        };
        document.addEventListener('keydown', handleEsc);

        setShow(true);
        setTimeout(() => setIsAnimating(true), 10);

        return () => {
          document.removeEventListener('keydown', handleEsc);
          if (preventScroll) {
            document.body.style.overflow = '';
          }
        };
      } else {
        setShow(true);
        setTimeout(() => setIsAnimating(true), 10);

        return () => {
          if (preventScroll) {
            document.body.style.overflow = '';
          }
        };
      }
    } else {
      setIsAnimating(false);
      const timeout = setTimeout(() => setShow(false), animationDuration);
      return () => clearTimeout(timeout);
    }
  }, [open, closeOnEsc, onClose, preventScroll, animationDuration]);

  if (!show || !mounted) return null;

  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full w-full h-full',
  };

  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-20',
    bottom: 'items-end justify-center pb-20',
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  };

  const modalClasses = cn(
    'max-h-[calc(100vh-4rem)] overflow-auto relative bg-light w-full mx-4 shadow-2xl z-[9999] transition-all duration-300',
    sizeClasses[size],
    roundedClasses[rounded],
    isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
    className
  );

  const overlayClasses = cn(
    'fixed inset-0 bg-dark/50 z-[9998] transition-opacity duration-300',
    isAnimating ? 'opacity-100' : 'opacity-0',
    overlayClassName
  );

  const modalContent = (
    <div className={cn('fixed inset-0 flex z-[9997] transition-all', positionClasses[position])}>
      <div
        className={overlayClasses}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      <div className={modalClasses}>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-dark/5 transition-colors z-10"
            aria-label="Close modal"
          >
            <TbX size={24} className="text-dark/70" />
          </button>
        )}
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
