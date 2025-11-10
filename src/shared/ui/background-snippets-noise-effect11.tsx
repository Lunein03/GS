'use client';

import { motion, type Transition } from "framer-motion";
import { useEffect, useRef } from "react";

export default function BackgroundSnippetsNoiseEffect() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[#09090a]" />
      {/* Gradiente base - 2a2451 predominante no centro */}
      <motion.div
        className="absolute inset-0"
        style={{ background: BASE_GRADIENT }}
        initial={{ scale: 1.0 }}
        animate={{ scale: 1.04 }}
        transition={BASE_GRADIENT_TRANSITION}
      />
      {/* Gradiente lateral esquerdo - 6422f2 */}
      <motion.div
        className="absolute inset-0"
        style={{ background: LEFT_ACCENT_GRADIENT }}
        initial={{ scale: 0.98 }}
        animate={{ scale: 1.05 }}
        transition={ACCENT_GRADIENT_TRANSITION}
      />
      {/* Gradiente lateral direito - 6422f2 */}
      <motion.div
        className="absolute inset-0"
        style={{ background: RIGHT_ACCENT_GRADIENT }}
        initial={{ scale: 0.96 }}
        animate={{ scale: 1.06 }}
        transition={ACCENT_GRADIENT_TRANSITION}
      />
      <NoiseOverlay patternRefreshInterval={DEFAULT_PATTERN_REFRESH_INTERVAL} patternAlpha={COMPONENT_PATTERN_ALPHA} />
    </div>
  );
}

function NoiseOverlay({
  patternSize = DEFAULT_PATTERN_SIZE,
  patternScaleX: _patternScaleX = DEFAULT_PATTERN_SCALE,
  patternScaleY: _patternScaleY = DEFAULT_PATTERN_SCALE,
  patternRefreshInterval: _patternRefreshInterval = DEFAULT_PATTERN_REFRESH_INTERVAL,
  patternAlpha = DEFAULT_PATTERN_ALPHA,
  className,
}: NoiseProps) {
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasElement = noiseCanvasRef.current;
    if (!canvasElement) return;

    const context = canvasElement.getContext("2d", { alpha: true });
    if (!context) return;

    const updateCanvasDimensions = () => {
      const canvasDimension = Math.max(BASE_CANVAS_SIZE, Math.floor(patternSize));
      canvasElement.width = canvasDimension;
      canvasElement.height = canvasDimension;
      canvasElement.style.width = VIEWPORT_FULL_WIDTH;
      canvasElement.style.height = VIEWPORT_FULL_HEIGHT;
    };

    const renderGrain = () => {
      const canvasDimension = Math.max(BASE_CANVAS_SIZE, Math.floor(patternSize));
      const imageData = context.createImageData(canvasDimension, canvasDimension);
      const pixelData = imageData.data;

      for (let index = 0; index < pixelData.length; index += PIXEL_CHANNEL_COUNT) {
        const pixelValue = Math.random() * RGB_MAX_VALUE;
        pixelData[index] = pixelValue;
        pixelData[index + 1] = pixelValue;
        pixelData[index + 2] = pixelValue;
        pixelData[index + 3] = patternAlpha;
      }

      context.putImageData(imageData, 0, 0);
    };

    const handleResize = () => {
      updateCanvasDimensions();
      renderGrain();
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [patternSize, patternAlpha]);

  const canvasClassName = className
    ? `pointer-events-none absolute inset-0 ${className}`.trim()
    : "pointer-events-none absolute inset-0";

  return <canvas ref={noiseCanvasRef} className={canvasClassName} style={{ imageRendering: "pixelated" }} />;
}

type NoiseProps = {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number;
  className?: string;
};

type BackgroundNoiseOverlayProps = {
  className?: string;
  patternSize?: number;
  patternAlpha?: number;
};

export function BackgroundNoiseOverlay({
  className,
  patternSize = DEFAULT_PATTERN_SIZE,
  patternAlpha = COMPONENT_PATTERN_ALPHA,
}: BackgroundNoiseOverlayProps) {
  return (
    <NoiseOverlay
      className={className}
      patternSize={patternSize}
      patternRefreshInterval={DEFAULT_PATTERN_REFRESH_INTERVAL}
      patternAlpha={patternAlpha}
    />
  );
}

const VIEWPORT_FULL_WIDTH = "100vw";
const VIEWPORT_FULL_HEIGHT = "100vh";
const RGB_MAX_VALUE = 255;
const PIXEL_CHANNEL_COUNT = 4;
const BASE_CANVAS_SIZE = 1024;
const DEFAULT_PATTERN_SIZE = 250;
const DEFAULT_PATTERN_SCALE = 1;
const DEFAULT_PATTERN_REFRESH_INTERVAL = 2;
const DEFAULT_PATTERN_ALPHA = 15;
const COMPONENT_PATTERN_ALPHA = 18;

const BASE_GRADIENT = "radial-gradient(ellipse 1400px 900px at 50% 50%,#2a2451 0%,rgba(42,36,81,0.75) 50%,rgba(9,9,10,0.9) 85%)";
const LEFT_ACCENT_GRADIENT = "radial-gradient(circle 580px at 15% 50%,rgba(100,34,242,0.45) 0%,transparent 65%)";
const RIGHT_ACCENT_GRADIENT = "radial-gradient(circle 620px at 85% 50%,rgba(100,34,242,0.5) 0%,transparent 68%)";
const BASE_GRADIENT_TRANSITION: Transition = { duration: 55, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" };
const ACCENT_GRADIENT_TRANSITION: Transition = { duration: 44, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" };

// TODO: [Background Noise] Mapear comportamento de escala utilizando patternScaleX e patternScaleY quando a direção de design estiver definida.
