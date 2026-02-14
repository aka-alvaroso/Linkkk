"use client"

import type { WidgetSize } from "@/app/types";
import * as motion from 'motion/react-client';

interface WidgetShellProps {
  size: WidgetSize;
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

export default function WidgetShell({ size, delay = 0.05, children, className = "" }: WidgetShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "backInOut" }}
      className={`bg-black/5 rounded-2xl ${size === '2x2' ? 'p-3' : 'p-2'} ${className}`}
    >
      {children}
    </motion.div>
  );
}
