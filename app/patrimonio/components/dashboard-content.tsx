'use client';

import Link from 'next/link';
import { Calendar, CheckCircle, Package, Wrench } from 'lucide-react';

import { useEquipment } from '@/app/patrimonio/context/equipment-provider';
import { EQUIPMENT_STATUS_LABEL, EQUIPMENT_STATUS_STYLES } from '@/app/patrimonio/lib/equipment-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function DashboardContent() {
  const { equipment, events, isHydrated } = useEquipment();

  if (!isHydrated) {
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
  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do patrimônio da empresa</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base font-semibold">
              Equipamentos recentes
              <Button asChild variant="ghost" size="sm">
                <Link href="/patrimonio/equipamentos">Ver todos</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEquipment.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum equipamento cadastrado ainda
              </p>
            ) : (
              <div className="space-y-3">
                {recentEquipment.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base font-semibold">
              Próximos eventos
              <Button asChild variant="ghost" size="sm">
                <Link href="/patrimonio/eventos">Ver todos</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum evento programado
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <article
                    key={event.id}
                    className="flex items-start gap-3 rounded-lg bg-muted/50 p-3 transition-colors hover:bg-muted"
                  >
                    <Calendar className="mt-1 h-5 w-5 text-primary" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{event.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.date).toLocaleDateString('pt-BR')} • {event.location}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.equipmentIds.length} equipamento(s)
                      </p>
                    </div>
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
    <Card className={cn('border-l-4', accentClass ?? 'border-l-primary')}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
