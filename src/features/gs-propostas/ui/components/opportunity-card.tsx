"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Opportunity } from "@/features/gs-propostas/domain/types";
import { cn } from "@/shared/lib/utils";
import { GripVertical, Mail, User, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OpportunityCardView } from "./opportunity-card-view";

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

  return (
    <OpportunityCardView
      ref={setNodeRef}
      style={style}
      opportunity={opportunity}
      isDragging={isDragging || isSortableDragging}
      withDragHandle={true}
      dragHandleProps={{ ...attributes, ...listeners }}
    />
  );
}


