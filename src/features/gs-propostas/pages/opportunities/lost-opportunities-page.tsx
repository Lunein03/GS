import { OpportunityList } from "@/features/gs-propostas/ui/components/opportunity-list";
import { Plus, XCircle } from "lucide-react";
import { NewOpportunityModal } from "@/features/gs-propostas/ui/components/new-opportunity-modal";
import { Button } from "@/shared/ui/button";
import { listOpportunities } from "@/features/gs-propostas/api/opportunities";
import { Opportunity } from "@/features/gs-propostas/domain/types";

export const dynamic = 'force-dynamic';

export default async function LostOpportunitiesPage() {
  let opportunities: Opportunity[] = [];

  try {
    const all = await listOpportunities();
    opportunities = all.filter((opp) => opp.status === "LOST");
  } catch (error) {
    console.error("Erro ao carregar oportunidades perdidas:", error);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <XCircle className="h-8 w-8 text-red-500" />
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Oportunidades Perdidas</h1>
            <p className="text-muted-foreground">
              {opportunities.length} oportunidade{opportunities.length !== 1 ? 's' : ''} não conquistada{opportunities.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <NewOpportunityModal>
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Nova Proposta
          </Button>
        </NewOpportunityModal>
      </header>

      <OpportunityList 
        opportunities={opportunities} 
        emptyMessage="Nenhuma oportunidade perdida encontrada."
      />
    </div>
  );
}
