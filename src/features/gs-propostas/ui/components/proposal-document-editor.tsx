"use client";

import dynamic from "next/dynamic";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { PreviewControls, ViewMode } from "./preview-controls";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { ProposalPdfDocument, ProposalPdfData } from "./proposal-pdf-document";
import { pdf } from "@react-pdf/renderer";

// Dynamic import of PDFViewer to avoid SSR issues
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-zinc-200">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Carregando visualizador...</span>
        </div>
      </div>
    ),
  }
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
    const [refreshKey, setRefreshKey] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Normalize document data coming from the form
    const documentData = useMemo<ProposalPdfData>(() => ({
      code: data?.code || "------",
      name: data?.name || "Nova Proposta",
      status: data?.status || "Aberto",
      date: data?.date || new Date(),
      validity: data?.validity,
      clientName: data?.clientName,
      contactName: data?.contactName,
      companyName: data?.companyName || "GS PRODUÇÕES E ACESSIBILIDADE",
      companyCnpj: data?.companyCnpj || "35.282.691/0001-48",
      companyAddress: data?.companyAddress || "Rua Cinco de Julho, 388, APT 103",
      companyEmail: data?.companyEmail || "comercial@gsproducao.com",
      companyPhone: data?.companyPhone || "+55 21 96819-9637",
      responsibleName: data?.responsibleName || "Gabriel Sampaio Verissimo",
      items: data?.items || [],
      observations: data?.observations,
    }), [data]);

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
      setRefreshKey((prev) => prev + 1);
    }, []);

    const handleViewModeChange = useCallback(
      (mode: ViewMode) => {
        setViewMode(mode);
        onFullscreenChange?.(mode === "fullscreen");
      },
      [onFullscreenChange]
    );

    // Keep preview and consumers in sync whenever form data changes
    useEffect(() => {
      if (autoRefresh) {
        setRefreshKey((prev) => prev + 1);
      }
      onContentChange?.(JSON.stringify(documentData));
    }, [documentData, autoRefresh, onContentChange]);

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

    return (
      <div className={cn("flex flex-col h-full bg-muted/40 rounded-lg border border-border overflow-hidden", className)}>
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
        </div>

        {/* Document Preview Area - PDF Viewer */}
        <div className="flex-1 overflow-hidden relative bg-zinc-200" ref={containerRef}>
          <PDFViewer
            key={refreshKey}
            style={{ width: "100%", height: "100%", border: "none" }}
            showToolbar={false}
          >
            <ProposalPdfDocument data={documentData} />
          </PDFViewer>

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
