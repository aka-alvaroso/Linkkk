"use client"

import { useRef, useState, useEffect } from "react";
import { useMotionValue, animate } from 'motion/react';
import AnimatedText, { AnimatedTextRef } from "@/app/components/ui/AnimatedText";

export default function AnimatedCounter({ value, delay = 0 }: { value: number; delay?: number }) {
  const count = useMotionValue(0);
  const textRef = useRef<AnimatedTextRef>(null);
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 0.1,
      delay,
      ease: "easeOut",
      onUpdate: (latest) => {
        const newValue = Math.round(latest);
        if (newValue !== currentValue) {
          setCurrentValue(newValue);
          textRef.current?.setText(newValue.toString());
        }
      }
    });
    return controls.stop;
  }, [count, value, delay, currentValue]);

  return (
    <AnimatedText
      ref={textRef}
      initialText={currentValue.toString()}
      animationType="slide"
      slideDirection="up"
      triggerMode="none"
    />
  );
}
