"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { createNoise3D } from "simplex-noise";

export interface WavyBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: any;
}

export const WavyBackground: React.FC<WavyBackgroundProps> = ({
  children,
  className,
  containerClassName,
  colors = [
    "#38bdf8",
    "#818cf8",
    "#c084fc",
    "#e879f9",
    "#22d3ee",
  ],
  waveWidth = 30,
  backgroundFill = "transparent",
  blur = 8,
  speed = "slow",
  waveOpacity = 0.3,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSafari, setIsSafari] = useState(false);

  const getSpeed = (): number => {
    switch (speed) {
      case "slow":
        return 0.001;
      case "fast":
        return 0.002;
      default:
        return 0.001;
    }
  };

  useEffect(() => {
    // Detectar Safari
    const userAgent = navigator.userAgent.toLowerCase();
    setIsSafari(userAgent.includes("safari") && !userAgent.includes("chrome"));
  }, []);

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center",
        containerClassName
      )}
      {...props}
    >
      <canvas
        ref={canvasRef}
        id="canvas"
        className="absolute inset-0 z-0"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
