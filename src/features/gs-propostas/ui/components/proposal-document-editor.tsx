"use client";

import dynamic from "next/dynamic";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { FileDown, Hand, Loader2, Minus, Plus } from "lucide-react";
import { format } from "date-fns";
import {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useMemo,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { PreviewControls, ViewMode } from "./preview-controls";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { ProposalPdfDocument, ProposalPdfData } from "./proposal-pdf-document";
import { pdf } from "@react-pdf/renderer";

const PdfPreview = dynamic(
  () => import("./pdf-preview").then((mod) => mod.PdfPreview),
  { ssr: false }
);
interface ProposalDocumentEditorProps {
  className?: string;
  data?: ProposalPdfData;
  onContentChange?: (json: string) => void;
  isFullscreen?: boolean;
  onFullscreenChange?: (value: boolean) => void;
}

export interface ProposalDocumentEditorRef {
  exportToPdf: () => Promise<void>;
  getContent: () => string;
  refresh: () => void;
}

const ProposalDocumentEditor = forwardRef<ProposalDocumentEditorRef, ProposalDocumentEditorProps>(
  ({ className, data, onContentChange, isFullscreen = false, onFullscreenChange }, ref) => {
    const [isExporting, setIsExporting] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>("normal");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [previewError, setPreviewError] = useState<string | null>(null);
    const [numPages, setNumPages] = useState(1);
    const [scale, setScale] = useState(1);
    const [fitScale, setFitScale] = useState(1);
    const [isFitToWidth, setIsFitToWidth] = useState(true);
    const [isHandMode, setIsHandMode] = useState(true);
    const [isPanning, setIsPanning] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
    const panStartRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
    const previewUrlRef = useRef<string | null>(null);
    const activePreviewUrlRef = useRef<string | null>(null);
    const liveUrlsRef = useRef<Set<string>>(new Set());
    const isFirstLoadRef = useRef(true);

    const PAGE_WIDTH = 595;
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 3;
    const isPannable = isHandMode && containerWidth > 0 && PAGE_WIDTH * scale > containerWidth - 8;
    const zoomStep = fitScale > 0 ? fitScale * 0.1 : 0.1;

    const clamp = useCallback((value: number, min: number, max: number) => {
      return Math.min(max, Math.max(min, value));
    }, []);

    // Normalize document data coming from the form
    const documentData = useMemo<ProposalPdfData>(() => ({
      code: data?.code || "------",
      name: data?.name || "Nova Proposta",
      status: data?.status || "Aberto",
      date: data?.date || new Date(),
      validity: data?.validity,
      clientName: data?.clientName,
      contactName: data?.contactName,
      companyName: data?.companyName ?? "GS PRODUÇÕES E ACESSIBILIDADE",
      companyCnpj: data?.companyCnpj ?? "35.282.691/0001-48",
      companyAddress: data?.companyAddress ?? "Rua Cinco de Julho, 388, APT 103",
      companyNeighborhood: data?.companyNeighborhood ?? "Copacabana",
      companyCity: data?.companyCity ?? "Rio de Janeiro",
      companyState: data?.companyState ?? "RJ",
      companyZip: data?.companyZip ?? "22051-030",
      companyEmail: data?.companyEmail ?? "comercial@gsproducao.com",
      companyPhone: data?.companyPhone ?? "+55 21 96819-9637",
      responsibleName: data?.responsibleName ?? "Gabriel Sampaio Verissimo",
      items: data?.items || [],
      observations: data?.observations,
    }), [data]);

    const [previewData, setPreviewData] = useState<ProposalPdfData>(documentData);

    const exportToPdf = useCallback(async () => {
      setIsExporting(true);
      try {
        const blob = await pdf(<ProposalPdfDocument data={documentData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `proposta-${documentData.code || "nova"}-${format(new Date(), "yyyyMMdd")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error exporting PDF:", error);
      } finally {
        setIsExporting(false);
      }
    }, [documentData]);

    const getContent = useCallback(() => {
      return JSON.stringify(documentData);
    }, [documentData]);

    const handleRefresh = useCallback(() => {
      setPreviewData(documentData);
    }, [documentData]);

    const handleViewModeChange = useCallback(
      (mode: ViewMode) => {
        setViewMode(mode);
        onFullscreenChange?.(mode === "fullscreen");
      },
      [onFullscreenChange]
    );

    // Keep preview and consumers in sync whenever form data changes
    const serializedData = JSON.stringify(documentData);

    useEffect(() => {
      if (autoRefresh) {
        // Atualização em tempo real (sem debounce)
        setPreviewData(documentData);
      }
      onContentChange?.(serializedData);
    }, [serializedData, autoRefresh, onContentChange, documentData]);

    // Sync fullscreen state from parent
    useEffect(() => {
      if (isFullscreen && viewMode !== "fullscreen") {
        setViewMode("fullscreen");
      } else if (!isFullscreen && viewMode === "fullscreen") {
        setViewMode("normal");
      }
    }, [isFullscreen, viewMode]);

    useImperativeHandle(ref, () => ({
      exportToPdf,
      getContent,
      refresh: handleRefresh,
    }));

    useEffect(() => {
      if (!containerRef.current) return;

      const observer = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        const hasChanged =
          Math.round(lastSizeRef.current.width) !== Math.round(width) ||
          Math.round(lastSizeRef.current.height) !== Math.round(height);

        if (hasChanged) {
          lastSizeRef.current = { width, height };
          setContainerWidth(width);
          const nextFitScale = clamp((width - 32) / PAGE_WIDTH, MIN_SCALE, MAX_SCALE);
          setFitScale(nextFitScale);
          if (isFitToWidth) {
            setScale(nextFitScale);
          }
        }
      });

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, [clamp, isFitToWidth]);

    useEffect(() => {
      let active = true;
      // Só mostra loading visual na primeira carga
      if (isFirstLoadRef.current) {
        setPreviewLoading(true);
      }
      setPreviewError(null);

      pdf(<ProposalPdfDocument data={previewData} />)
        .toBlob()
        .then((blob) => {
          if (!active) return;
          const url = URL.createObjectURL(blob);

          liveUrlsRef.current.add(url);
          previewUrlRef.current = url;
          setPreviewUrl(url);
          setPreviewLoading(false);
          if (isFirstLoadRef.current) {
            isFirstLoadRef.current = false;
            setIsFirstLoad(false);
          }
          // Remove URLs antigas nao usadas (mantem apenas ativa e pendente)
          const keep = new Set<string>();
          if (activePreviewUrlRef.current) keep.add(activePreviewUrlRef.current);
          if (previewUrlRef.current) keep.add(previewUrlRef.current);
          const urls = Array.from(liveUrlsRef.current);
          urls.forEach((u) => {
            if (!keep.has(u)) {
              URL.revokeObjectURL(u);
              liveUrlsRef.current.delete(u);
            }
          });
        })
        .catch((error) => {
          if (!active) return;
          console.error("Error rendering PDF preview:", error);
          setPreviewError("Não foi possível gerar a pré-visualização.");
          setPreviewLoading(false);
          if (isFirstLoadRef.current) {
            isFirstLoadRef.current = false;
            setIsFirstLoad(false);
          }
        });

      return () => {
        active = false;
      };
    }, [previewData]);

    const handleActiveUrlChange = useCallback((activeUrl: string) => {
      activePreviewUrlRef.current = activeUrl;
      const keep = new Set<string>();
      if (activeUrl) keep.add(activeUrl);
      if (previewUrlRef.current) keep.add(previewUrlRef.current);
      const urls = Array.from(liveUrlsRef.current);
      urls.forEach((url) => {
        if (!keep.has(url)) {
          URL.revokeObjectURL(url);
          liveUrlsRef.current.delete(url);
        }
      });
    }, []);

    useEffect(() => {
      return () => {
        // Cleanup de todas as URLs ao desmontar
        const urls = Array.from(liveUrlsRef.current);
        urls.forEach((u) => URL.revokeObjectURL(u));
        liveUrlsRef.current.clear();
      };
    }, []);

    const handleZoomIn = useCallback(() => {
      setIsFitToWidth(false);
      setScale((prev) => clamp(prev + zoomStep, MIN_SCALE, MAX_SCALE));
    }, [clamp, zoomStep]);

    const handleZoomOut = useCallback(() => {
      setIsFitToWidth(false);
      setScale((prev) => clamp(prev - zoomStep, MIN_SCALE, MAX_SCALE));
    }, [clamp, zoomStep]);

    const handleFitWidth = useCallback(() => {
      setIsFitToWidth(true);
      if (fitScale) {
        setScale(fitScale);
      } else {
        const width = lastSizeRef.current.width || containerRef.current?.clientWidth || 0;
        if (!width) return;
        setScale(clamp((width - 32) / PAGE_WIDTH, MIN_SCALE, MAX_SCALE));
      }
    }, [clamp, fitScale]);

    const handlePanStart = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!isPannable || !containerRef.current) return;
        if (event.pointerType === "mouse" && event.button !== 0) return;
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        panStartRef.current = {
          x: event.clientX,
          y: event.clientY,
          left: containerRef.current.scrollLeft,
          top: containerRef.current.scrollTop,
        };
        setIsPanning(true);
      },
      [isPannable]
    );

    const handlePanMove = useCallback(
      (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!isPanning || !panStartRef.current || !containerRef.current) return;
        const deltaX = event.clientX - panStartRef.current.x;
        const deltaY = event.clientY - panStartRef.current.y;
        containerRef.current.scrollLeft = panStartRef.current.left - deltaX;
        containerRef.current.scrollTop = panStartRef.current.top - deltaY;
      },
      [isPanning]
    );

    const handlePanEnd = useCallback((event?: ReactPointerEvent<HTMLDivElement>) => {
      if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setIsPanning(false);
      panStartRef.current = null;
    }, []);

    return (
      <div className={cn("flex flex-col h-full min-h-0 bg-muted/40 rounded-lg border border-border overflow-hidden", className)}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-border bg-card shrink-0 z-20 flex-wrap shadow-sm">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8 text-xs font-medium"
            onClick={exportToPdf}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileDown className="h-3 w-3" />} PDF
          </Button>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleZoomOut}
              title="Diminuir zoom"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-xs w-12 text-center text-muted-foreground">
              {Math.round((scale / (fitScale || 1)) * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleZoomIn}
              title="Aumentar zoom"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant={isHandMode ? "secondary" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsHandMode((prev) => !prev)}
              title="Mover com a mão"
            >
              <Hand className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={handleFitWidth}
              title="Ajustar à largura"
            >
              Ajustar
            </Button>
          </div>
        </div>

        {/* Document Preview Area - PDF Viewer */}
        <div
          className={cn(
            "flex-1 min-h-0 overflow-auto relative bg-zinc-200",
            isPannable ? (isPanning ? "cursor-grabbing select-none" : "cursor-grab select-none") : "cursor-default"
          )}
          ref={containerRef}
          onPointerDown={handlePanStart}
          onPointerMove={handlePanMove}
          onPointerUp={handlePanEnd}
          onPointerCancel={handlePanEnd}
        >
          {previewUrl && !previewError && (
            <div className="w-full flex flex-col items-center gap-4 py-4">
              <PdfPreview
                file={previewUrl}
                scale={scale}
                onLoadSuccess={setNumPages}
                onLoadError={(error) => {
                  console.error("Error loading PDF:", error);
                  setPreviewError("Falha ao carregar a pré-visualização.");
                }}
                onActiveUrlChange={handleActiveUrlChange}
              />
            </div>
          )}

          {/* Loading overlay aparece APENAS na primeira carga */}
          {previewLoading && isFirstLoad && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-200/70">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Carregando visualização...</span>
              </div>
            </div>
          )}

          {previewError && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-zinc-200/70">
              {previewError}
            </div>
          )}

          {/* Preview Controls - Floating */}
          <TooltipProvider>
            <PreviewControls
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
              autoRefresh={autoRefresh}
              viewMode={viewMode}
              onAutoRefreshChange={setAutoRefresh}
              onRefreshClick={handleRefresh}
              onViewModeChange={handleViewModeChange}
            />
          </TooltipProvider>
        </div>
      </div>
    );
  }
);

ProposalDocumentEditor.displayName = "ProposalDocumentEditor";

export { ProposalDocumentEditor };
