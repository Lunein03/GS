"use client";

/**
 * PropostaFooter - Footer do Centro de Propostas
 * 
 * @see docs/specs/SPEC-002-proposta-unificada.md
 */

import { FileText, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { PropostaFooterProps } from "./types";

export function PropostaFooter({
  onExportPdf,
  onClose,
  onSave,
  isSubmitting,
  isDirty,
}: PropostaFooterProps) {
  return (
    <footer className="p-3 md:p-4 border-t border-border bg-card flex flex-wrap items-center justify-between gap-2 shrink-0">
      {/* Left: Status indicator */}
      <div className="flex items-center gap-2">
        {isDirty && (
          <span className="flex items-center gap-1.5 text-xs text-amber-600">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Alterações não salvas
          </span>
        )}
        {!isDirty && (
          <span className="text-xs text-muted-foreground">
            Nenhuma alteração pendente
          </span>
        )}
      </div>
      
      {/* Right: Action buttons */}
      <div className="flex items-center gap-2">
        {/* PDF Export */}
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white border-zinc-700 hidden sm:flex"
          onClick={onExportPdf}
        >
          <FileText className="w-4 h-4" />
          <span className="hidden md:inline">PDF</span>
        </Button>
        

        
        {/* Close */}
        <Button 
          variant="outline" 
          size="sm"
          onClick={onClose}
        >
          Fechar
        </Button>
        
        {/* Save */}
        <Button 
          size="sm"
          className="bg-primary hover:bg-primary/90 gap-2 min-w-[80px]" 
          onClick={onSave} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Salvando...</span>
            </>
          ) : (
            "Salvar"
          )}
        </Button>
      </div>
    </footer>
  );
}
