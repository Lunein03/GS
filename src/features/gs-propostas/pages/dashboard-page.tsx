import { Suspense } from "react";
import { OpportunityKanbanBoard } from "@/features/gs-propostas/ui/components/opportunity-kanban-board";
import { Plus } from "lucide-react";
import { NewOpportunityModal } from "@/features/gs-propostas/ui/components/new-opportunity-modal";
import { Button } from "@/shared/ui/button";
import { GsPropostasHeroBackground } from "@/features/gs-propostas/ui/layout/gs-propostas-hero-background";
import { listOpportunities } from "@/features/gs-propostas/api/opportunities";
import { Opportunity } from "@/features/gs-propostas/domain/types";
import { SKELETON_DEFAULT_COUNT } from "@/features/gs-propostas/config/constants";

// Marcar como dinâmico para evitar SSG durante build
export const dynamic = 'force-dynamic';

export default async function GsPropostasDashboardPage() {
  let initialOpportunities: Opportunity[] = [];

  try {
    initialOpportunities = await listOpportunities();
  } catch (error) {
    console.error("Erro ao carregar oportunidades:", error);
  }

  return (
    <>
      <GsPropostasHeroBackground>
        <div className="flex flex-col gap-6 relative z-10">
          <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-8">
            <div>
              <h1 className="text-3xl font-medium tracking-tight">GS Propostas · Oportunidades</h1>
              <p className="text-muted-foreground">
                Centralize o pipeline comercial da organização e acompanhe o avanço das negociações em tempo real.
              </p>
            </div>
            <NewOpportunityModal>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Nova Oportunidade
              </Button>
            </NewOpportunityModal>
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
      {Array.from({ length: SKELETON_DEFAULT_COUNT }).map((_, i) => (
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
