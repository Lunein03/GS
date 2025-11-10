import { Suspense } from "react";
import { OpportunityKanbanBoard } from "@/features/gs-propostas/ui/components/opportunity-kanban-board";
import { Plus, XCircle } from "lucide-react";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { listOpportunities } from "@/features/gs-propostas/api/opportunities";

export const dynamic = 'force-dynamic';

export default async function OportunidadesPerdidasPage() {
  let opportunities = [];

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




