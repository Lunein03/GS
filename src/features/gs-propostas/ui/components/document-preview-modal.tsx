"use client";

import dynamic from "next/dynamic";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
} from "@/shared/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { useRef } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const PdfPreview = dynamic(
  () => import("./pdf-preview").then((mod) => mod.PdfPreview),
  { ssr: false }
);

const PAGE_WIDTH = 595;
const A4_SCALE = 1; // 1:1 scale = A4 size (595x842pt)

interface DocumentPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewUrl: string | null;
}

export function DocumentPreviewModal({
  open,
  onOpenChange,
  previewUrl,
}: DocumentPreviewModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/60" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col overflow-hidden rounded-xl bg-zinc-100 shadow-2xl dark:bg-zinc-900 w-[min(660px,94vw)] h-[90vh] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <VisuallyHidden>
            <DialogPrimitive.Title>Visualização do Documento</DialogPrimitive.Title>
          </VisuallyHidden>

        {/* Header - minimal */}
        <div className="flex items-center justify-between h-11 px-4 bg-background border-b border-border shrink-0">
          <span className="text-sm font-medium text-foreground">Visualização do Documento</span>
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </DialogPrimitive.Close>
        </div>

        {/* Document Preview Area */}
        <div
          className="flex-1 min-h-0 overflow-auto relative bg-zinc-200 dark:bg-zinc-800"
          ref={containerRef}
        >
          {previewUrl ? (
            <div className="w-full flex flex-col items-center py-6">
              <PdfPreview
                file={previewUrl}
                scale={A4_SCALE}
                onLoadSuccess={() => {}}
                onLoadError={(error) => {
                  console.error("Error loading PDF in modal:", error);
                }}
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Carregando documento...</span>
              </div>
            </div>
          )}
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
