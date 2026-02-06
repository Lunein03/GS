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
}

interface PdfBufferState {
  url: string;
  numPages: number;
  isLoaded: boolean;
  isActive: boolean;
  token: number;
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
}: PdfPreviewProps) {
  // Armazena o buffer atual (visivel)
  const [currentBuffer, setCurrentBuffer] = useState<PdfBufferState | null>(null);
  // Armazena o buffer sendo carregado (invisivel)
  const [pendingBuffer, setPendingBuffer] = useState<PdfBufferState | null>(null);
  // Controla a transicao
  const [isFadingOut, setIsFadingOut] = useState(false);

  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastProcessedUrlRef = useRef<string | null>(null);
  const currentUrlRef = useRef<string | null>(null);
  const pendingTokenRef = useRef<number | null>(null);
  const tokenCounterRef = useRef(0);

  useEffect(() => {
    currentUrlRef.current = currentBuffer?.url ?? null;
  }, [currentBuffer?.url]);

  // Quando recebe uma nova URL
  useEffect(() => {
    // Evita processar a mesma URL duas vezes
    if (!file) return;
    if (file === lastProcessedUrlRef.current) return;
    if (file === currentBuffer?.url) return;
    if (file === pendingBuffer?.url) return;

    lastProcessedUrlRef.current = file;

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
    setIsFadingOut(false);

    // Se nao tem buffer atual, inicializa diretamente como ativo
    if (!currentBuffer) {
      setCurrentBuffer({
        url: file,
        numPages: 1,
        isLoaded: false,
        isActive: true,
        token: 0,
      });
      return;
    }

    // Se ja tem buffer atual, cria pendente para carregar em background
    const token = ++tokenCounterRef.current;
    pendingTokenRef.current = token;
    setPendingBuffer({
      url: file,
      numPages: 1,
      isLoaded: false,
      isActive: false,
      token,
    });
  }, [file, currentBuffer, pendingBuffer?.url]);

  // Quando o buffer pendente termina de carregar
  const handlePendingLoadSuccess = useCallback(
    (token: number, url: string, numPages: number) => {
      if (pendingTokenRef.current !== token) return;

      // Atualiza o pendente como carregado
      setPendingBuffer((prev) => {
        if (!prev || prev.token !== token) return prev;
        return { ...prev, numPages, isLoaded: true };
      });

      // Inicia a transicao de fade
      setIsFadingOut(true);

      // Clear timeout anterior
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      // Apos a animacao de fade, faz o swap
      transitionTimeoutRef.current = setTimeout(() => {
        if (pendingTokenRef.current !== token) return;
        setPendingBuffer((pending) => {
          if (!pending || pending.token !== token) return pending;
          // Move pendente para atual
          setCurrentBuffer({
            ...pending,
            isActive: true,
          });
          return null; // Limpa o pendente
        });
        pendingTokenRef.current = null;
        setIsFadingOut(false);
        onLoadSuccess?.(numPages);
        onActiveUrlChange?.(url);
      }, 300); // Duracao do fade
    },
    [onActiveUrlChange, onLoadSuccess]
  );

  // Quando o buffer atual carrega pela primeira vez
  const handleCurrentLoadSuccess = useCallback(
    (url: string, numPages: number) => {
      if (currentUrlRef.current !== url) return;
      setCurrentBuffer((prev) => (prev && prev.url === url ? { ...prev, numPages, isLoaded: true } : prev));
      onLoadSuccess?.(numPages);
      onActiveUrlChange?.(url);
    },
    [onActiveUrlChange, onLoadSuccess]
  );

  // Erros do buffer pendente sao ignorados (provavelmente URL antiga)
  const handlePendingLoadError = useCallback((token: number, error: Error) => {
    if (pendingTokenRef.current !== token) return;
    console.debug("[PdfPreview] Pending buffer error (ignored):", error.message);
    setPendingBuffer((prev) => (prev && prev.token === token ? null : prev));
    pendingTokenRef.current = null;
    lastProcessedUrlRef.current = null; // Permite tentar novamente
    setIsFadingOut(false);
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }
  }, []);

  // Erros do buffer atual sao propagados
  const handleCurrentLoadError = useCallback(
    (url: string, error: Error) => {
      if (currentUrlRef.current !== url) return;
      onLoadError?.(error);
    },
    [onLoadError]
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* Buffer Atual (Visivel) */}
      {currentBuffer && (
        <div
          className="transition-opacity duration-300 ease-in-out"
          style={{
            opacity: isFadingOut ? 0 : 1,
          }}
        >
          <PdfDocument
            file={currentBuffer.url}
            onLoadSuccess={({ numPages }) => handleCurrentLoadSuccess(currentBuffer.url, numPages)}
            onLoadError={(error) => handleCurrentLoadError(currentBuffer.url, error)}
            loading={null}
            error={null}
          >
            {Array.from({ length: currentBuffer.numPages }, (_, index) => (
              <Page
                key={`current_page_${index + 1}`}
                pageNumber={index + 1}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-md bg-white mb-4"
              />
            ))}
          </PdfDocument>
        </div>
      )}

      {/* Buffer Pendente (Invisivel, carregando em background) */}
      {pendingBuffer && (
        <div
          className="absolute top-0 left-0 w-full transition-opacity duration-300 ease-in-out"
          style={{
            opacity: isFadingOut && pendingBuffer.isLoaded ? 1 : 0,
            pointerEvents: "none",
          }}
        >
          <PdfDocument
            file={pendingBuffer.url}
            onLoadSuccess={({ numPages }) =>
              handlePendingLoadSuccess(pendingBuffer.token, pendingBuffer.url, numPages)
            }
            onLoadError={(error) => handlePendingLoadError(pendingBuffer.token, error)}
            loading={null}
            error={null}
          >
            {Array.from({ length: pendingBuffer.numPages }, (_, index) => (
              <Page
                key={`pending_page_${index + 1}`}
                pageNumber={index + 1}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-md bg-white mb-4"
              />
            ))}
          </PdfDocument>
        </div>
      )}
    </div>
  );
}
