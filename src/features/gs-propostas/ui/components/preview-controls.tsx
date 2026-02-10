"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { 
  Zap, 
  RefreshCw, 
  Expand,
  ZapOff
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";

export type ViewMode = "normal" | "fullscreen" | "compact";

interface PreviewControlsProps {
  className?: string;
  autoRefresh: boolean;
  viewMode: ViewMode;
  onAutoRefreshChange: (value: boolean) => void;
  onRefreshClick: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenModal?: () => void;
}

export function PreviewControls({
  className,
  autoRefresh,
  onAutoRefreshChange,
  onRefreshClick,
  onOpenModal,
}: PreviewControlsProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-1 bg-zinc-800/90 backdrop-blur-sm rounded-full px-1.5 py-1 shadow-lg",
        className
      )}
    >
      {/* Auto Refresh Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full transition-all",
              autoRefresh 
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-700"
            )}
            onClick={() => onAutoRefreshChange(!autoRefresh)}
          >
            {autoRefresh ? (
              <Zap className="h-4 w-4" />
            ) : (
              <ZapOff className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <p>{autoRefresh ? "Atualização automática ativada" : "Atualização automática desativada"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Manual Refresh */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all",
              autoRefresh && "opacity-40 pointer-events-none"
            )}
            onClick={onRefreshClick}
            disabled={autoRefresh}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <p>Atualizar visualização</p>
        </TooltipContent>
      </Tooltip>

      {/* Open in Modal */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
            onClick={onOpenModal}
          >
            <Expand className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" sideOffset={8}>
          <p>Abrir documento em tela cheia</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
