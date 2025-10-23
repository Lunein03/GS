'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

type SignatureDrawPadProps = {
  width?: number;
  height?: number;
  disabled?: boolean;
  initialImage?: string | null;
  onChange: (dataUrl: string | null, dimensions: { width: number; height: number }) => void;
};

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 200;

export function SignatureDrawPad({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  disabled = false,
  initialImage,
  onChange,
}: SignatureDrawPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.scale(ratio, ratio);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 2.8;
    context.strokeStyle = '#111827';
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);

    contextRef.current = context;
    setHasContent(false);
  }, [width, height]);

  useEffect(() => {
    if (!initialImage) {
      return;
    }

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) {
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      setHasContent(true);
    };
    image.src = initialImage;
  }, [initialImage, width, height]);

  const getCanvasCoordinates = (event: PointerEvent | React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) {
      return;
    }

    const context = contextRef.current;
    if (!context) {
      return;
    }

    canvasRef.current?.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;
    const point = getCanvasCoordinates(event);
    lastPointRef.current = point;

    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || !isDrawingRef.current) {
      return;
    }

    const context = contextRef.current;
    const lastPoint = lastPointRef.current;
    if (!context || !lastPoint) {
      return;
    }

    const point = getCanvasCoordinates(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    lastPointRef.current = point;
    setHasContent(true);
  };

  const endDrawing = () => {
    if (!isDrawingRef.current) {
      return;
    }

    isDrawingRef.current = false;
    lastPointRef.current = null;
    contextRef.current?.closePath();

    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl, { width, height });
    }
  };

  const handlePointerUp = () => {
    endDrawing();
  };

  const handlePointerLeave = () => {
    endDrawing();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) {
      return;
    }

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.beginPath();
    contextRef.current = context;
    setHasContent(false);
    onChange(null, { width, height });
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Area para desenhar a assinatura"
          className="h-[200px] w-full cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button type="button" variant="outline" size="sm" onClick={handleClear} disabled={disabled || !hasContent}>
          Limpar desenho
        </Button>
        <span className="text-xs">Use o mouse ou o toque para desenhar sua assinatura.</span>
      </div>
    </div>
  );
}
