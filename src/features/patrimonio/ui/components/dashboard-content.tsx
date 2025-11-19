'use client';

import Link from 'next/link';
import { Calendar, CheckCircle, Package, Wrench } from 'lucide-react';

import { useEquipmentList } from '@/features/patrimonio/hooks/use-equipment';
import { useEventsList, useUpdateEventStatus } from '@/features/patrimonio/hooks/use-events';
import { EQUIPMENT_STATUS_LABEL } from '@/features/patrimonio/domain/equipment-status';
import { SectionShell } from '@/shared/components/section-shell';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { useToast } from '@/shared/ui/use-toast';

const STATUS_BADGE_CLASS =
  'rounded-full border border-accent/20 bg-accent/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-accent';

const KPI_CARD_CLASS = 'rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl transition-all hover:bg-card/90';

const LIST_CARD_CLASS = 'rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl';

const LIST_ITEM_CLASS = 'rounded-xl border border-border bg-card/60 p-4 transition-colors hover:bg-card/80';

export function DashboardContent() {
  const { data: equipment = [], isLoading: isLoadingEquipment } = useEquipmentList();
  const { data: events = [], isLoading: isLoadingEvents } = useEventsList();
  const updateStatusMutation = useUpdateEventStatus();
  const { toast } = useToast();

  const handleCompleteEvent = (eventId: string, eventName: string) => {
    updateStatusMutation.mutate(
      { eventId, status: 'completed' },
      {
        onSuccess: () => {
          toast({
            title: 'Evento concluído',
            description: `${eventName} foi marcado como concluído e os equipamentos foram liberados.`,
          });
        },
        onError: (error) => {
          toast({
            title: 'Erro ao concluir evento',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  if (isLoadingEquipment || isLoadingEvents) {
    return (
      <SectionShell title="Dashboard" subtitle="Visão geral do patrimônio da empresa">
        <div className="space-y-12 lg:space-y-16">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`dashboard-skeleton-${index}`} className={cn(KPI_CARD_CLASS, 'animate-pulse')}>
                <div className="h-4 w-28 rounded bg-card/50" />
                <div className="mt-4 h-8 w-16 rounded bg-card/60" />
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`dashboard-list-skeleton-${index}`} className={cn(LIST_CARD_CLASS, 'animate-pulse space-y-4')}>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-40 rounded bg-card/50" />
                  <div className="h-8 w-20 rounded bg-card/40" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((__, itemIndex) => (
                    <div key={`skeleton-item-${itemIndex}`} className="h-14 rounded bg-card/50" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    );
  }

  const stats = {
    total: equipment.length,
    available: equipment.filter((item) => item.status === 'available').length,
    inUse: equipment.filter((item) => item.status === 'in-use').length,
    maintenance: equipment.filter((item) => item.status === 'maintenance').length,
  };

  const recentEquipment = [...equipment].slice(-5).reverse();
  
  // Filter events: show ongoing events (between startDate and endDate, status pending)
  const today = new Date();
  const todayDateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  const ongoingEvents = events
    .filter((event) => {
      if (event.status === 'completed') return false;
      const startDateString = event.startDate.split('T')[0];
      const endDateString = event.endDate.split('T')[0];
      return startDateString <= todayDateString && endDateString >= todayDateString;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const kpiCards = [
    {
      id: 'total',
      title: 'Total de Equipamentos',
      value: stats.total,
      icon: <Package className="h-5 w-5" aria-hidden="true" />,
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      id: 'available',
      title: 'Disponíveis',
      value: stats.available,
      icon: <CheckCircle className="h-5 w-5" aria-hidden="true" />,
      iconClass: 'bg-accent/10 text-accent',
    },
    {
      id: 'in-use',
      title: 'Em uso',
      value: stats.inUse,
      icon: <Package className="h-5 w-5" aria-hidden="true" />,
      iconClass: 'bg-primary/10 text-primary',
    },
    {
      id: 'maintenance',
      title: 'Manutenção',
      value: stats.maintenance,
      icon: <Wrench className="h-5 w-5" aria-hidden="true" />,
      iconClass: 'bg-destructive/10 text-destructive',
    },
  ];

  return (
    <SectionShell title="Dashboard" subtitle="Visão geral do patrimônio da empresa">
      <div className="space-y-12 lg:space-y-16">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <div key={card.id} className={KPI_CARD_CLASS}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.title}
                </span>
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/60',
                    card.iconClass,
                  )}
                >
                  {card.icon}
                </span>
              </div>
              <p className="mt-4 text-4xl font-semibold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className={LIST_CARD_CLASS}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Equipamentos recentes</h2>
                <p className="text-xs text-muted-foreground">Últimos cadastros sincronizados</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-9 rounded-lg px-4">
                <Link href="/patrimonio/equipamentos">Ver todos</Link>
              </Button>
            </div>

            {recentEquipment.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-border/60 bg-card/40 py-10 text-center text-sm text-muted-foreground">
                Nenhum equipamento cadastrado ainda
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {recentEquipment.map((item) => (
                  <article key={item.id} className={LIST_ITEM_CLASS}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.code}</p>
                      </div>
                      <span className={STATUS_BADGE_CLASS}>{EQUIPMENT_STATUS_LABEL[item.status]}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className={LIST_CARD_CLASS}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Eventos em andamento</h2>
                <p className="text-xs text-muted-foreground">Agenda e movimentação de equipamentos</p>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-9 rounded-lg px-4">
                <Link href="/patrimonio/eventos">Ver todos</Link>
              </Button>
            </div>

            {ongoingEvents.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-border/60 bg-card/40 py-10 text-center text-sm text-muted-foreground">
                Nenhum evento em andamento
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {ongoingEvents.map((event) => {
                  const totalUnits = event.equipmentAllocations.reduce(
                    (sum, allocation) => sum + allocation.quantity,
                    0,
                  );
                  return (
                  <article key={event.id} className={LIST_ITEM_CLASS}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card/60 text-primary">
                          <Calendar className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 space-y-1">
                          <p className="truncate text-sm font-medium text-foreground">{event.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.startDate).toLocaleDateString('pt-BR')} até{' '}
                            {new Date(event.endDate).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-xs text-muted-foreground">{event.location}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.equipmentAllocations.length} equipamento(s)
                            {totalUnits !== event.equipmentAllocations.length ? ` · ${totalUnits} unidades` : ''}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteEvent(event.id, event.name)}
                        disabled={updateStatusMutation.isPending}
                        className="h-9 rounded-lg px-4"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                        Concluir
                      </Button>
                    </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}



