"use client";

import { Opportunity } from "@/features/gs-propostas/domain/types";
import { OpportunityCardView } from "./opportunity-card-view";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { NewOpportunityModal } from "@/features/gs-propostas/ui/components/new-opportunity-modal";

interface OpportunityListProps {
  opportunities: Opportunity[];
  emptyMessage?: string;
}

export function OpportunityList({ opportunities, emptyMessage = "Nenhuma oportunidade encontrada." }: OpportunityListProps) {
  if (!opportunities.length) {
    return (
      <section className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-muted-foreground/30 bg-card/30 p-10 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
        <NewOpportunityModal>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Criar nova oportunidade
          </Button>
        </NewOpportunityModal>
      </section>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {opportunities.map((opportunity) => (
        <OpportunityCardView
          key={opportunity.id}
          opportunity={opportunity}
        />
      ))}
    </div>
  );
}
