"use client"
import React from 'react';
import { AnimatePresence } from 'motion/react';
import Toast from './Toast';
import { ToastData } from './types';

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-28 md:bottom-auto md:top-4 z-9999999999 flex flex-col-reverse md:flex-col gap-3 pointer-events-none max-w-md w-full px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
