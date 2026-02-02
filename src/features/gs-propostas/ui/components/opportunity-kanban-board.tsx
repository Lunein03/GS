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
import { listOpportunities, updateOpportunityStatus, listOpportunityStatuses } from "@/features/gs-propostas/api/opportunities";
import type { Opportunity, OpportunityStatus } from "@/features/gs-propostas/domain/types";
import { OpportunityCard } from "./opportunity-card";
import { KanbanColumn } from "./kanban-column";
import { Plus, Clock, Trophy, XCircle, LucideIcon } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { opportunityQueryKeys } from "@/features/gs-propostas/domain/query-keys";

import { SKELETON_DEFAULT_COUNT } from "@/features/gs-propostas/config/constants";
import { NewOpportunityModal } from "@/features/gs-propostas/ui/components/new-opportunity-modal";
import { OpportunityCardView } from "./opportunity-card-view";

const DEFAULT_STATUSES: { id: OpportunityStatus; title: string; color: string; icon: LucideIcon }[] = [
  { id: "OPEN", title: "Abertas", color: "text-blue-500", icon: Clock },
  { id: "WON", title: "Ganhas", color: "text-green-500", icon: Trophy },
  { id: "LOST", title: "Perdidas", color: "text-red-500", icon: XCircle },
];

export function OpportunityKanbanBoard({ initialData }: OpportunityKanbanBoardProps) {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: opportunities = initialData, isLoading: isLoadingOpportunities } = useQuery({
    queryKey: opportunityQueryKeys.lists(),
    queryFn: listOpportunities,
    initialData,
  });

  const { data: statuses = [], isLoading: isLoadingStatuses } = useQuery<{ id: OpportunityStatus; title: string; color: string; icon: LucideIcon }[]>({
    queryKey: ["opportunity-statuses"],
    queryFn: async () => {
      try {
        // We force the frontend specific statuses to ensure alignment with sidebar
        return DEFAULT_STATUSES;
      } catch {
        return DEFAULT_STATUSES;
      }
    },
    initialData: DEFAULT_STATUSES,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const opportunitiesByStatus = useMemo(() => {
    const grouped: Record<string, Opportunity[]> = {};
    
    // Initialize all statuses with empty arrays
    statuses.forEach(status => {
      grouped[status.id] = [];
    });

    // Group opportunities
    opportunities.forEach((opp: Opportunity) => {
      // Treat IN_PROGRESS as OPEN to align with the 3-column layout
      const statusKey = opp.status === 'IN_PROGRESS' ? 'OPEN' : opp.status;
      
      if (grouped[statusKey]) {
        grouped[statusKey].push(opp);
      }
    });

    return grouped;
  }, [opportunities, statuses]);

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

  const isLoading = isLoadingOpportunities || isLoadingStatuses;

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
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
        <NewOpportunityModal>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Criar primeira oportunidade
          </Button>
        </NewOpportunityModal>
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statuses.map((column) => (
          <SortableContext
            key={column.id}
            id={column.id}
            items={opportunitiesByStatus[column.id]?.map((opp: Opportunity) => opp.id) || []}
            strategy={verticalListSortingStrategy}
          >
            <KanbanColumn
              id={column.id}
              title={column.title}
              color={column.color}
              icon={column.icon}
              opportunities={opportunitiesByStatus[column.id] || []}
            />
          </SortableContext>
        ))}
      </div>

      <DragOverlay dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
        {activeOpportunity ? (
          <OpportunityCardView 
            opportunity={activeOpportunity} 
            className="cursor-grabbing shadow-2xl scale-105 rotate-2 z-50 ring-2 ring-primary ring-offset-2 opacity-100"
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface OpportunityKanbanBoardProps {
  initialData: Opportunity[];
}




