"use client";

import { Document as PdfDocument, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState, useEffect, useRef, useCallback } from "react";

if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PdfPreviewProps {
  file: string;
  scale: number;
  onLoadSuccess?: (numPages: number) => void;
  onLoadError?: (error: Error) => void;
  onActiveUrlChange?: (url: string) => void;
  onBufferUrlsChange?: (urls: string[]) => void;
}

interface PdfBufferState {
  token: number;
  url: string;
  numPages: number;
  isLoaded: boolean;
}

/**
 * Double-Buffer PDF Preview Component
 *
 * Usa tecnica de double-buffer para evitar piscada (flicker) ao atualizar o PDF:
 * - Buffer "active" mostra o PDF atual (visivel)
 * - Buffer "pending" carrega o PDF novo (invisivel)
 * - Quando o novo carrega -> crossfade suave
 */
export function PdfPreview({
  file,
  scale,
  onLoadSuccess,
  onLoadError,
  onActiveUrlChange,
  onBufferUrlsChange,
}: PdfPreviewProps) {
  const [buffers, setBuffers] = useState<PdfBufferState[]>([]);
  const [activeToken, setActiveToken] = useState<number | null>(null);
  const [pendingToken, setPendingToken] = useState<number | null>(null);

  const lastProcessedUrlRef = useRef<string | null>(null);
  const tokenCounterRef = useRef(0);
  const activeTokenRef = useRef<number | null>(null);
  const pendingTokenRef = useRef<number | null>(null);

  useEffect(() => {
    activeTokenRef.current = activeToken;
  }, [activeToken]);

  useEffect(() => {
    pendingTokenRef.current = pendingToken;
  }, [pendingToken]);

  useEffect(() => {
    if (!onBufferUrlsChange) return;
    onBufferUrlsChange(buffers.map((buffer) => buffer.url));
  }, [buffers, onBufferUrlsChange]);

  const activeBuffer =
    activeToken === null ? null : buffers.find((buffer) => buffer.token === activeToken) ?? null;
  const pendingBuffer =
    pendingToken === null ? null : buffers.find((buffer) => buffer.token === pendingToken) ?? null;

  // Quando recebe uma nova URL
  useEffect(() => {
    // Evita processar a mesma URL duas vezes
    if (!file) return;
    if (file === lastProcessedUrlRef.current) return;
    if (file === activeBuffer?.url) return;
    if (file === pendingBuffer?.url) return;

    lastProcessedUrlRef.current = file;
    const token = ++tokenCounterRef.current;
    const newBuffer: PdfBufferState = {
      token,
      url: file,
      numPages: 1,
      isLoaded: false,
    };

    setBuffers((prev) => {
      const currentActiveToken = activeTokenRef.current;
      const currentActive =
        currentActiveToken === null
          ? null
          : prev.find((buffer) => buffer.token === currentActiveToken) ?? null;

      if (!currentActive) {
        return [newBuffer];
      }

      return [currentActive, newBuffer];
    });

    if (activeTokenRef.current === null) {
      activeTokenRef.current = token;
      setActiveToken(token);
    }

    pendingTokenRef.current = token;
    setPendingToken(token);
  }, [file, activeBuffer?.url, pendingBuffer?.url]);

  const handleBufferLoadSuccess = useCallback(
    (token: number, url: string, numPages: number) => {
      const isCurrentActive = activeTokenRef.current === token;
      const isCurrentPending = pendingTokenRef.current === token;
      if (!isCurrentActive && !isCurrentPending) return;

      setBuffers((prev) =>
        prev.map((buffer) =>
          buffer.token === token ? { ...buffer, numPages, isLoaded: true } : buffer
        )
      );

      // Promove pendente já carregado sem recarregar o documento visível.
      if (isCurrentPending) {
        activeTokenRef.current = token;
        pendingTokenRef.current = null;
        setActiveToken(token);
        setPendingToken(null);
        setBuffers((prev) => prev.filter((buffer) => buffer.token === token));
        onActiveUrlChange?.(url);
      } else if (isCurrentActive && pendingTokenRef.current === null) {
        onActiveUrlChange?.(url);
      }

      onLoadSuccess?.(numPages);
    },
    [onActiveUrlChange, onLoadSuccess]
  );

  const handleBufferLoadError = useCallback(
    (token: number, error: Error) => {
      const isCurrentActive = activeTokenRef.current === token;
      const isCurrentPending = pendingTokenRef.current === token;

      if (isCurrentPending) {
        setBuffers((prev) => prev.filter((buffer) => buffer.token !== token));
        pendingTokenRef.current = null;
        setPendingToken(null);
        lastProcessedUrlRef.current = null; // Permite tentar novamente
        return;
      }

      if (!isCurrentActive) return;
      onLoadError?.(error);
    },
    [onLoadError]
  );

  return (
    <div className="relative w-full h-full flex flex-col items-center">
      {buffers.map((buffer) => {
        const isActive = buffer.token === activeToken;
        return (
        <div
          key={buffer.token}
          className={isActive ? "w-full flex justify-center" : "absolute top-0 left-0 w-full flex justify-center"}
          style={{
            opacity: isActive ? 1 : 0,
            pointerEvents: isActive ? "auto" : "none",
          }}
        >
          <PdfDocument
            className="flex flex-col items-center"
            file={buffer.url}
            onLoadSuccess={({ numPages }) => handleBufferLoadSuccess(buffer.token, buffer.url, numPages)}
            onLoadError={(error) => handleBufferLoadError(buffer.token, error)}
            loading={null}
            error={null}
          >
            {Array.from({ length: buffer.numPages }, (_, index) => (
              <Page
                key={`buffer_${buffer.token}_page_${index + 1}`}
                pageNumber={index + 1}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-md bg-white mb-4 [&_canvas]:max-w-none"
              />
            ))}
          </PdfDocument>
        </div>
        );
      })}
    </div>
  );
}
