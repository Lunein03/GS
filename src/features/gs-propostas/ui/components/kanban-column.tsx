"use client";

import { useDroppable } from "@dnd-kit/core";
import type { Opportunity, OpportunityStatus } from "@/app/gs-propostas/types";
import { OpportunityCard } from "./opportunity-card";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: OpportunityStatus;
  title: string;
  color: string;
  opportunities: Opportunity[];
}

export function KanbanColumn({ id, title, color, opportunities }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const totalValue = opportunities.reduce(
    (sum, opp) => sum + parseFloat(opp.value || "0"),
    0
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors",
        isOver && "bg-accent/50 border-accent"
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("h-3 w-3 rounded-full", color)} />
          <h3 className="font-semibold">{title}</h3>
          <span className="text-sm text-muted-foreground">
            ({opportunities.length})
          </span>
        </div>
      </div>

      <div className="mb-4 rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">Valor Total</p>
        <p className="text-lg font-bold">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(totalValue)}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {opportunities.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 p-8 text-center text-sm text-muted-foreground">
            Arraste oportunidades aqui
          </div>
        ) : (
          opportunities.map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))
        )}
      </div>
    </div>
  );
}
