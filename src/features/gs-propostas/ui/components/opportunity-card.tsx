"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Opportunity } from "@/features/gs-propostas/domain/types";
import { cn } from "@/shared/lib/utils";
import { GripVertical, Mail, User, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OpportunityCardProps {
  opportunity: Opportunity;
  isDragging?: boolean;
}

export function OpportunityCard({ opportunity, isDragging }: OpportunityCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: opportunity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const value = parseFloat(opportunity.value || "0");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-border bg-background p-4 shadow-sm transition-all hover:shadow-md",
        (isDragging || isSortableDragging) && "opacity-50 cursor-grabbing",
        !isDragging && !isSortableDragging && "cursor-grab"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm line-clamp-2">{opportunity.title}</h4>
          {opportunity.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {opportunity.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-primary">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(value)}
          </span>
          {opportunity.probability !== null && opportunity.probability !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              {opportunity.probability}%
            </div>
          )}
        </div>

        {(opportunity.clientName || opportunity.clientEmail) && (
          <div className="space-y-1 text-xs text-muted-foreground">
            {opportunity.clientName && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="truncate">{opportunity.clientName}</span>
              </div>
            )}
            {opportunity.clientEmail && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate">{opportunity.clientEmail}</span>
              </div>
            )}
          </div>
        )}

        {opportunity.nextStep && (
          <div className="rounded-md bg-muted/50 p-2 text-xs">
            <span className="font-medium">Próximo passo:</span>{" "}
            <span className="text-muted-foreground">{opportunity.nextStep}</span>
          </div>
        )}

        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {opportunity.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {format(new Date(opportunity.createdAt), "dd MMM yyyy", {
              locale: ptBR,
            })}
          </span>
          {opportunity.responsibleUser && (
            <span className="truncate">{opportunity.responsibleUser}</span>
          )}
        </div>
      </div>
    </div>
  );
}


