"use client"

import * as motion from "motion/react-client";

type LoaderSize = "sm" | "md" | "lg" | "xl";

interface LoaderProps {
  size?: LoaderSize;
  className?: string;
}

const sizeConfig = {
  sm: {
    fontSize: "text-2xl",
    dotSize: 5,
    radius: 15,
  },
  md: {
    fontSize: "text-4xl",
    dotSize: 9,
    radius: 25,
  },
  lg: {
    fontSize: "text-6xl",
    dotSize: 14,
    radius: 40,
  },
  xl: {
    fontSize: "text-8xl",
    dotSize: 24,
    radius: 60,
  },
};

export default function Loader({ size = "md", className = "" }: LoaderProps) {
  const config = sizeConfig[size];
  const radius = config.radius;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* La "k" estática */}
      <span className={`${config.fontSize} font-black italic leading-none`}>k</span>

      {/* Contenedor del punto giratorio - necesita espacio para el círculo completo */}
      <div
        className="relative"
        style={{
          width: radius * 2,
          height: radius * 2,
          marginLeft: -radius * 1.5,
          marginTop: radius * 0.2,
        }}
      >
        {/* Contenedor rotatorio */}
        <motion.div
          className="absolute"
          style={{
            width: radius * 2,
            height: radius * 2,
            left: 0,
            top: 0,
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 0.75,
            ease: [0.45, 0.05, 0.55, 0.95], // easeInOutSine - suave sin overshoot
            repeat: Infinity,
            repeatDelay: 0.05,
          }}
        >
          {/* Punto fijo en la posición derecha del contenedor */}
          <div
            className="bg-dark rounded-full absolute"
            style={{
              width: config.dotSize,
              height: config.dotSize,
              left: radius * 1.9 - config.dotSize / 2,
              top: radius * 1.3 - config.dotSize / 2,
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
