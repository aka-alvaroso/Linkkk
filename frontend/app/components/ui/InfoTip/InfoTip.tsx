'use client';
import React, { useEffect, useId, useRef, useState } from 'react';
import { TbInfoCircle } from 'react-icons/tb';
import { cn } from '@/app/utils/cn';

interface InfoTipProps {
  /** Help text shown in the bubble */
  children: React.ReactNode;
  /** Accessible name of the trigger button */
  label?: string;
  className?: string;
}

/**
 * Small "i" button that reveals a help bubble. Opens on hover or focus for
 * mouse and keyboard, and toggles on tap so it also works on touch screens.
 * Closes with Escape or a click outside.
 */
export default function InfoTip({ children, label = 'Info', className }: InfoTipProps) {
  const id = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = pinned || hovered;

  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setPinned(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinned(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [pinned]);

  return (
    <span
      ref={rootRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => setPinned((v) => !v)}
        className="p-0.5 rounded-full text-dark/40 hover:text-dark/80 focus-visible:text-dark/80 cursor-pointer"
      >
        <TbInfoCircle size={16} />
      </button>
      {open && (
        <span
          id={id}
          role="tooltip"
          className="absolute left-1/2 top-full z-30 mt-1.5 w-64 max-w-[80vw] -translate-x-1/2 rounded-xl border border-dark/10 bg-white p-3 text-xs font-normal leading-relaxed text-dark/70 shadow-lg"
        >
          {children}
        </span>
      )}
    </span>
  );
}
