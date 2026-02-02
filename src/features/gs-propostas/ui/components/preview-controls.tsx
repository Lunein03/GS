"use client";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { 
  Zap, 
  RefreshCw, 
  Maximize2, 
  Minimize2,
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
}

export function PreviewControls({
  className,
  autoRefresh,
  viewMode,
  onAutoRefreshChange,
  onRefreshClick,
  onViewModeChange,
}: PreviewControlsProps) {
  const handleViewModeToggle = () => {
    if (viewMode === "normal") {
      onViewModeChange("fullscreen");
    } else {
      onViewModeChange("normal");
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1.5 shadow-lg border border-border",
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
              "h-10 w-10 rounded-full transition-all",
              autoRefresh 
                ? "bg-blue-500 text-white hover:bg-blue-600 hover:text-white shadow-md" 
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            onClick={() => onAutoRefreshChange(!autoRefresh)}
          >
            {autoRefresh ? (
              <Zap className="h-5 w-5" />
            ) : (
              <ZapOff className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{autoRefresh ? "Atualização automática ativada" : "Atualização automática desativada"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Manual Refresh */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
            onClick={onRefreshClick}
            disabled={autoRefresh}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Atualizar visualização</p>
        </TooltipContent>
      </Tooltip>

      {/* View Mode Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
            onClick={handleViewModeToggle}
          >
            {viewMode === "fullscreen" ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>{viewMode === "fullscreen" ? "Sair do modo expandido" : "Expandir visualização"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
