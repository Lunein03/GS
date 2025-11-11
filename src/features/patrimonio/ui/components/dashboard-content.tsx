'use client';

import Link from 'next/link';
import { Calendar, CheckCircle, Package, Wrench } from 'lucide-react';

import { useEquipmentList } from '@/features/patrimonio/hooks/use-equipment';
import { useEventsList, useUpdateEventStatus } from '@/features/patrimonio/hooks/use-events';
import { EQUIPMENT_STATUS_LABEL, EQUIPMENT_STATUS_STYLES } from '@/features/patrimonio/domain/equipment-status';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { useToast } from '@/shared/ui/use-toast';

// Função auxiliar local para combinar classes
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

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
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded bg-muted/70" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={`skeleton-${index}`} className="border-dashed">
              <CardHeader className="space-y-3">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-medium text-foreground sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground sm:text-base">Visão geral do patrimônio da empresa</p>
      </header>

      <section className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          title="Total de Equipamentos"
          value={stats.total}
          icon={<Package className="h-5 w-5 text-primary" aria-hidden="true" />}
        />
        <DashboardStatCard
          title="Disponíveis"
          value={stats.available}
          icon={<CheckCircle className="h-5 w-5 text-accent" aria-hidden="true" />}
          accentClass="border-l-accent"
        />
        <DashboardStatCard
          title="Em uso"
          value={stats.inUse}
          icon={<Package className="h-5 w-5 text-[hsl(var(--primary-glow))]" aria-hidden="true" />}
          accentClass="border-l-[hsl(var(--primary-glow))]"
        />
        <DashboardStatCard
          title="Manutenção"
          value={stats.maintenance}
          icon={<Wrench className="h-5 w-5 text-destructive" aria-hidden="true" />}
          accentClass="border-l-destructive"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="order-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base font-medium sm:text-lg">
              Equipamentos recentes
              <Button asChild variant="ghost" size="sm">
                <Link href="/patrimonio/equipamentos">Ver todos</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {recentEquipment.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum equipamento cadastrado ainda
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentEquipment.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted sm:p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.code}</p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide',
                        EQUIPMENT_STATUS_STYLES[item.status]
                      )}
                    >
                      {EQUIPMENT_STATUS_LABEL[item.status]}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="order-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base font-medium sm:text-lg">
              Eventos em andamento
              <Button asChild variant="ghost" size="sm">
                <Link href="/patrimonio/eventos">Ver todos</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {ongoingEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum evento em andamento
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {ongoingEvents.map((event) => (
                  <article
                    key={event.id}
                    className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted sm:p-4"
                  >
                    <Calendar className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{event.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(event.endDate).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.equipmentIds.length} equipamento(s)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompleteEvent(event.id, event.name)}
                      disabled={updateStatusMutation.isPending}
                      className="shrink-0"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Concluir
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

interface DashboardStatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  accentClass?: string;
}

function DashboardStatCard({ title, value, icon, accentClass }: DashboardStatCardProps) {
  return (
    <Card className={cn('border-l-4 transition-all hover:shadow-md', accentClass ?? 'border-l-primary')}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">{title}</CardTitle>
        <div className="shrink-0">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-2xl font-medium text-foreground sm:text-3xl">{value}</p>
      </CardContent>
    </Card>
  );
}



