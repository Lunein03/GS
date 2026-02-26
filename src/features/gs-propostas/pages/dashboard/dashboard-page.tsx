import { Suspense } from "react";
import { OpportunityKanbanBoard } from "@/features/gs-propostas/ui/components/opportunity-kanban-board";
import { DashboardStats } from "@/features/gs-propostas/ui/components/dashboard-stats";
import { NewOpportunityModal } from "@/features/gs-propostas/ui/components/new-opportunity-modal";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import Link from "next/link";
import { GsPropostasHeroBackground } from "@/features/gs-propostas/ui/layout/gs-propostas-hero-background";
import { listOpportunities } from "@/features/gs-propostas/api/opportunities";
import { getClientes } from "@/features/gs-propostas/api/clients";

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch data in parallel
  const [opportunities, clientsResponse] = await Promise.all([
    listOpportunities().catch(() => []),
    getClientes({ page: 1, pageSize: 1 }).catch(() => ({ success: false, data: { pagination: { total: 0 } } } as any)),
  ]);

  // Calculate stats
  const totalOpportunities = opportunities.filter(o => o.status !== "WON" && o.status !== "LOST").length;
  
  const totalPipelineValue = opportunities
    .filter(o => o.status !== "WON" && o.status !== "LOST")
    .reduce((acc, curr) => acc + Number(curr.value || 0), 0);

  const wonOpportunities = opportunities.filter(o => o.status === "WON");
  const wonOpportunitiesCount = wonOpportunities.length;
  const wonOpportunitiesValue = wonOpportunities.reduce((acc, curr) => acc + Number(curr.value || 0), 0);

  const activeClientsCount = clientsResponse.success 
    ? clientsResponse.data.pagination.total 
    : 0;

  return (
    <GsPropostasHeroBackground>
      <div className="flex flex-col gap-6 relative z-10 w-full">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-1 pb-2">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">GS Propostas · Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Visão geral do pipeline comercial e performance.
            </p>
          </div>
          <NewOpportunityModal>
            <Button className="shadow-md">
              <Plus className="w-4 h-4 mr-2" />
              Nova Proposta
            </Button>
          </NewOpportunityModal>
        </header>

        <DashboardStats 
          totalOpportunities={totalOpportunities}
          totalPipelineValue={totalPipelineValue}
          wonOpportunitiesCount={wonOpportunitiesCount}
          wonOpportunitiesValue={wonOpportunitiesValue}
          activeClientsCount={activeClientsCount}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Pipeline de Oportunidades</h2>
          </div>
          <Suspense fallback={<KanbanSkeleton />}>
            <OpportunityKanbanBoard initialData={opportunities} />
          </Suspense>
        </div>
      </div>
    </GsPropostasHeroBackground>
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
