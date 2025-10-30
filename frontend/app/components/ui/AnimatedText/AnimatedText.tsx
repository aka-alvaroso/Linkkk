import { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import { cn } from "@/app/utils/cn";

type AnimationType = "fade" | "slide" | "scale" | "blur" | "flip";
type TriggerMode = "hover" | "click" | "none";

interface AnimatedTextProps {
  initialText: string;
  hoverText?: string;
  className?: string;
  animationType?: AnimationType;
  triggerMode?: TriggerMode;
  duration?: number;
  onTextChange?: (text: string) => void;
}

export interface AnimatedTextRef {
  setText: (text: string) => void;
  getText: () => string;
  reset: () => void;
}

const AnimatedText = forwardRef<AnimatedTextRef, AnimatedTextProps>(
  (
    {
      initialText,
      hoverText,
      className = "",
      animationType = "fade",
      triggerMode = "none",
      duration = 0.3,
      onTextChange,
    },
    ref
  ) => {
    const [currentText, setCurrentText] = useState(initialText);
    const [isHovered, setIsHovered] = useState(false);
    const [key, setKey] = useState(0);

    // Expose methods via ref to control from outside
    useImperativeHandle(ref, () => ({
      setText: (text: string) => {
        setCurrentText(text);
        setKey((prev) => prev + 1);
        onTextChange?.(text);
      },
      getText: () => currentText,
      reset: () => {
        setCurrentText(initialText);
        setKey((prev) => prev + 1);
        onTextChange?.(initialText);
      },
    }));

    // Handle hover behavior
    useEffect(() => {
      if (triggerMode === "hover" && hoverText) {
        if (isHovered) {
          setCurrentText(hoverText);
          setKey((prev) => prev + 1);
        } else {
          setCurrentText(initialText);
          setKey((prev) => prev + 1);
        }
      }
    }, [isHovered, triggerMode, hoverText, initialText]);

    // Handle click behavior
    const handleClick = () => {
      if (triggerMode === "click" && hoverText) {
        const newText = currentText === initialText ? hoverText : initialText;
        setCurrentText(newText);
        setKey((prev) => prev + 1);
        onTextChange?.(newText);
      }
    };

    // Animation variants based on type
    const getAnimationVariants = () => {
      switch (animationType) {
        case "fade":
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          };
        case "slide":
          return {
            initial: { opacity: 0, x: -20 },
            animate: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: 20 },
          };
        case "scale":
          return {
            initial: { opacity: 0, scale: 0.8 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.8 },
          };
        case "blur":
          return {
            initial: { opacity: 0, filter: "blur(10px)" },
            animate: { opacity: 1, filter: "blur(0px)" },
            exit: { opacity: 0, filter: "blur(10px)" },
          };
        case "flip":
          return {
            initial: { opacity: 0, rotateX: 90 },
            animate: { opacity: 1, rotateX: 0 },
            exit: { opacity: 0, rotateX: -90 },
          };
        default:
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          };
      }
    };

    const variants = getAnimationVariants();

    return (
      <span
        className={cn(className)}
        onMouseEnter={() => triggerMode === "hover" && setIsHovered(true)}
        onMouseLeave={() => triggerMode === "hover" && setIsHovered(false)}
        onClick={handleClick}
        style={{
          cursor: triggerMode === "click" ? "pointer" : "default",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={key}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration, ease: "backOut" }}
            className="block overflow-hidden text-ellipsis whitespace-nowrap"
          >
            {currentText}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }
);

AnimatedText.displayName = "AnimatedText";

export default AnimatedText;
