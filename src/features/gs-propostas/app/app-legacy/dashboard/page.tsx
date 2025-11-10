import { Suspense } from "react";
import { OpportunityKanbanBoard } from "@/components/gs-propostas/opportunity-kanban-board";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GsPropostasHeroBackground } from "../components/gs-propostas-hero-background";

async function getInitialOpportunities() {
  try {
    // Importação dinâmica para garantir que só rode no servidor
    const { getOpportunities } = await import('@/lib/services/opportunity-service');
    return await getOpportunities();
  } catch (error) {
    console.error('Erro ao carregar oportunidades:', error);
    return [];
  }
}

// Marcar como dinâmico para evitar SSG durante build
export const dynamic = 'force-dynamic';

export default async function GsPropostasDashboardPage() {
  const initialOpportunities = await getInitialOpportunities();

  return (
    <>
      <GsPropostasHeroBackground>
        <div className="flex flex-col gap-6 relative z-10">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">GS Propostas · Oportunidades</h1>
              <p className="text-muted-foreground">
                Centralize o pipeline comercial da organização e acompanhe o avanço das negociações em tempo real.
              </p>
            </div>
            <Link href="/gs-propostas/oportunidades/nova">
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Nova Oportunidade
              </Button>
            </Link>
          </header>

          <Suspense fallback={<KanbanSkeleton />}>
            <OpportunityKanbanBoard initialData={initialOpportunities} />
          </Suspense>
        </div>
      </GsPropostasHeroBackground>
    </>
  );
}

function KanbanSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-4 animate-pulse">
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
