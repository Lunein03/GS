"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { listOpportunities, updateOpportunityStatus } from "@/features/gs-propostas/api/opportunities";
import type { Opportunity, OpportunityStatus } from "@/features/gs-propostas/domain/types";
import { OpportunityCard } from "./opportunity-card";
import { KanbanColumn } from "./kanban-column";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { opportunityQueryKeys } from "@/features/gs-propostas/domain/query-keys";

const COLUMNS: { id: OpportunityStatus; title: string; color: string }[] = [
  { id: "OPEN", title: "Aberto", color: "bg-blue-500" },
  { id: "IN_PROGRESS", title: "Em Andamento", color: "bg-yellow-500" },
  { id: "WON", title: "Ganha", color: "bg-green-500" },
  { id: "LOST", title: "Perdida", color: "bg-red-500" },
];

export function OpportunityKanbanBoard({ initialData }: OpportunityKanbanBoardProps) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: opportunities = initialData, isLoading } = useQuery({
    queryKey: opportunityQueryKeys.lists(),
    queryFn: listOpportunities,
    initialData,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const opportunitiesByStatus = useMemo(() => {
    const grouped: Record<OpportunityStatus, Opportunity[]> = {
      OPEN: [],
      IN_PROGRESS: [],
      WON: [],
      LOST: [],
    };

    opportunities.forEach((opp: Opportunity) => {
      if (opp.status in grouped) {
        grouped[opp.status].push(opp);
      }
    });

    return grouped;
  }, [opportunities]);

  const activeOpportunity = useMemo(
    () => opportunities.find((opp: Opportunity) => opp.id === activeId),
    [activeId, opportunities]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const opportunityId = active.id as string;
    const newStatus = over.id as OpportunityStatus;

    const opportunity = opportunities.find((opp: Opportunity) => opp.id === opportunityId);
    if (!opportunity || opportunity.status === newStatus) return;

    // Atualização otimista
    queryClient.setQueryData<Opportunity[]>(
      opportunityQueryKeys.lists(),
      (old = []) =>
        old.map((opp: Opportunity) =>
          opp.id === opportunityId ? { ...opp, status: newStatus } : opp
        )
    );

    try {
      const updated = await updateOpportunityStatus({
        id: opportunityId,
        status: newStatus,
      });

      queryClient.setQueryData<Opportunity[]>(
        opportunityQueryKeys.lists(),
        (old = []) =>
          old.map((opp: Opportunity) => (opp.id === updated.id ? updated : opp))
      );

      toast.success("Status atualizado com sucesso");
    } catch (error) {
      // Reverter em caso de erro
      queryClient.setQueryData<Opportunity[]>(
        opportunityQueryKeys.lists(),
        (old = []) =>
          old.map((opp: Opportunity) =>
            opp.id === opportunityId ? { ...opp, status: opportunity.status } : opp
          )
      );
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar status");
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="rounded-2xl border border-border bg-card p-4 animate-pulse"
          >
            <div className="h-8 bg-muted rounded mb-4" />
            <div className="space-y-3">
              <div className="h-24 bg-muted rounded" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!opportunities.length && !isCreating) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-muted-foreground/30 bg-card/30 p-10 text-center">
        <p className="text-muted-foreground">Nenhuma oportunidade cadastrada ainda.</p>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Criar primeira oportunidade
        </Button>
      </section>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((column) => (
          <SortableContext
            key={column.id}
            id={column.id}
            items={opportunitiesByStatus[column.id].map((opp: Opportunity) => opp.id)}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              id={column.id}
              title={column.title}
              color={column.color}
              opportunities={opportunitiesByStatus[column.id]}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay>
        {activeOpportunity ? (
          <OpportunityCard opportunity={activeOpportunity} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface OpportunityKanbanBoardProps {
  initialData: Opportunity[];
}




