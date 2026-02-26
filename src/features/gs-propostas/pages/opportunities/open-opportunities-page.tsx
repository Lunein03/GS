import { OpportunityList } from "@/features/gs-propostas/ui/components/opportunity-list";
import { Plus, Clock } from "lucide-react";
import { NewOpportunityModal } from "@/features/gs-propostas/ui/components/new-opportunity-modal";
import { Button } from "@/shared/ui/button";
import { listOpportunities } from "@/features/gs-propostas/api/opportunities";
import { Opportunity } from "@/features/gs-propostas/domain/types";

export const dynamic = 'force-dynamic';

export default async function OpenOpportunitiesPage() {
  let opportunities: Opportunity[] = [];

  try {
    const all = await listOpportunities();
    opportunities = all.filter((opp) => opp.status === "OPEN");
  } catch (error) {
    console.error("Erro ao carregar oportunidades abertas:", error);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <Clock className="h-6 w-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Oportunidades Abertas</h1>
            <p className="text-sm text-muted-foreground">
              {opportunities.length} oportunidade{opportunities.length !== 1 ? 's' : ''} em aberto
            </p>
          </div>
        </div>
        <NewOpportunityModal>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </NewOpportunityModal>
      </header>

      <OpportunityList 
        opportunities={opportunities} 
        emptyMessage="Nenhuma oportunidade em aberto encontrada."
      />
    </div>
  );
}
