import { OpportunityList } from "@/features/gs-propostas/ui/components/opportunity-list";
import { Plus, Flag } from "lucide-react";
import { NewOpportunityModal } from "@/features/gs-propostas/ui/components/new-opportunity-modal";
import { Button } from "@/shared/ui/button";
import { listOpportunities } from "@/features/gs-propostas/api/opportunities";
import { Opportunity } from "@/features/gs-propostas/domain/types";

export const dynamic = 'force-dynamic';

export default async function ClosedOpportunitiesPage() {
  let opportunities: Opportunity[] = [];

  try {
    const all = await listOpportunities();
    opportunities = all.filter((opp) => opp.status === "WON" || opp.status === "LOST");
  } catch (error) {
    console.error("Erro ao carregar oportunidades finalizadas:", error);
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="w-full max-w-[1400px] mx-auto px-6 py-4">
        <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <Flag className="h-6 w-6 text-amber-500" />
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Oportunidades Finalizadas</h1>
            <p className="text-sm text-muted-foreground">
              {opportunities.length} oportunidade{opportunities.length !== 1 ? 's' : ''} finalizada{opportunities.length !== 1 ? 's' : ''} (ganhas + perdidas)
            </p>
          </div>
        </div>
        <NewOpportunityModal>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Oportunidade
          </Button>
        </NewOpportunityModal>
      </header>

      <OpportunityList 
        opportunities={opportunities} 
        emptyMessage="Nenhuma oportunidade finalizada encontrada."
      />
    </div>
      </div>
    </div>
  );
}
