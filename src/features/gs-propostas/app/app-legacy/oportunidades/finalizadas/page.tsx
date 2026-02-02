import { Suspense } from "react";
import { OpportunityKanbanBoard } from "@/features/gs-propostas/ui/components/opportunity-kanban-board";
import { Plus, Flag } from "lucide-react";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { listOpportunities } from "@/features/gs-propostas/api/opportunities";
import type { Opportunity } from "@/features/gs-propostas/domain/types";

export const dynamic = 'force-dynamic';

export default async function OportunidadesFinalizadasPage() {
  let opportunities: Opportunity[] = [];

  try {
    const all = await listOpportunities();
    opportunities = all.filter((opp) => opp.status === "WON" || opp.status === "LOST");
  } catch (error) {
    console.error("Erro ao carregar oportunidades finalizadas:", error);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Flag className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Oportunidades Finalizadas</h1>
            <p className="text-muted-foreground">
              {opportunities.length} oportunidade{opportunities.length !== 1 ? 's' : ''} finalizada{opportunities.length !== 1 ? 's' : ''} (ganhas + perdidas)
            </p>
          </div>
        </div>
        <Link href="/gs-propostas/oportunidades/nova">
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Nova Oportunidade
          </Button>
        </Link>
      </header>

      <Suspense fallback={<div>Carregando...</div>}>
        <OpportunityKanbanBoard initialData={opportunities} />
      </Suspense>
    </div>
  );
}




