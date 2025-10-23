import { Suspense } from "react";
import { OpportunityKanbanBoard } from "@/components/gs-propostas/opportunity-kanban-board";
import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getOpenOpportunities() {
  try {
    const { getOpportunities } = await import('@/lib/services/opportunity-service');
    const all = await getOpportunities();
    return all.filter(opp => opp.status === 'OPEN');
  } catch (error) {
    console.error('Erro ao carregar oportunidades abertas:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default async function OportunidadesAbertasPage() {
  const opportunities = await getOpenOpportunities();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Oportunidades Abertas</h1>
            <p className="text-muted-foreground">
              {opportunities.length} oportunidade{opportunities.length !== 1 ? 's' : ''} em aberto
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
