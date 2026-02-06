"use client";

/**
 * PropostaHeader - Header do Centro de Propostas
 * 
 * @see docs/specs/SPEC-002-proposta-unificada.md
 */

import { X, ChevronRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { PropostaHeaderProps, ProposalStatus } from "./types";
import { PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_COLORS } from "./types";

export function PropostaHeader({
  code,
  name,
  totalValue,
  status,
  isPreviewFullscreen,
  onTogglePreview,
  onClose,
}: PropostaHeaderProps) {
  const statusLabel = PROPOSAL_STATUS_LABELS[status];
  const statusColor = PROPOSAL_STATUS_COLORS[status];

  return (
    <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
      {/* Left: Proposal Info */}
      <div className="flex items-center gap-3 text-sm overflow-hidden">
        {/* Code */}
        <span className="font-bold text-primary shrink-0">#{code}</span>
        
        {/* Name */}
        <span className="font-medium truncate hidden sm:inline">
          {name.toUpperCase()}
          <span className="text-xs text-muted-foreground ml-2 font-normal">(VERSÃO INICIAL)</span>
        </span>
        
        {/* Status Badge */}
        <Badge 
          variant="secondary" 
          className={cn(
            "shrink-0 text-white text-xs h-5",
            statusColor
          )}
        >
          {statusLabel}
        </Badge>
        
        {/* Total Value */}
        <span className="bg-muted px-2.5 py-1 rounded text-xs font-medium shrink-0 hidden md:inline">
          {new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(totalValue)}
        </span>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle Preview Button (when in fullscreen mode) */}
        {isPreviewFullscreen && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-2 text-muted-foreground hover:text-foreground"
            onClick={onTogglePreview}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="hidden sm:inline">Mostrar Formulário</span>
          </Button>
        )}
        
        {/* Toggle Preview Button (when not in fullscreen) */}
        {!isPreviewFullscreen && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-2 text-muted-foreground hover:text-foreground hidden lg:flex"
            onClick={onTogglePreview}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </Button>
        )}
        
        {/* Close Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-destructive/10" 
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
