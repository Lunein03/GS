'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Calendar, CheckCircle, Plus, Printer, Trash2 } from 'lucide-react';

import { useEquipmentList } from '@/features/patrimonio/hooks/use-equipment';
import { useEventsList, useCreateEvent, useDeleteEvent } from '@/features/patrimonio/hooks/use-events';
import { EQUIPMENT_STATUS_LABEL } from '@/features/patrimonio/domain/equipment-status';
import type { Event as InventoryEvent } from '@/features/patrimonio/domain/types/equipment';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

interface EventFormState {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  notes: string;
}

export function EventsContent() {
  const { data: equipment = [], isLoading: isLoadingEquipment } = useEquipmentList();
  const { data: events = [], isLoading: isLoadingEvents } = useEventsList();
  const createEventMutation = useCreateEvent();
  const deleteEventMutation = useDeleteEvent();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EventFormState>(() => ({
    name: '',
    startDate: new Date().toISOString().split('T')[0] ?? '',
    endDate: new Date().toISOString().split('T')[0] ?? '',
    location: '',
    notes: '',
  }));
  const [selectedEquipment, setSelectedEquipment] = useState<Set<string>>(new Set());
  const { activeEvents, completedEvents } = useMemo(() => {
    const active: InventoryEvent[] = [];
    const completed: InventoryEvent[] = [];

    const sortByStartDateDesc = (list: InventoryEvent[]) =>
      list.sort((first, second) => new Date(second.startDate).getTime() - new Date(first.startDate).getTime());

    events.forEach((currentEvent) => {
      if (currentEvent.status === 'completed') {
        completed.push(currentEvent);
        return;
      }
      active.push(currentEvent);
    });

    return {
      activeEvents: sortByStartDateDesc(active),
      completedEvents: sortByStartDateDesc(completed),
    };
  }, [events]);

  if (isLoadingEquipment || isLoadingEvents) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-9 w-48 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-5 w-64 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-muted" />
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleToggleEquipment = (id: string) => {
    setSelectedEquipment((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedEquipment.size === 0) {
      toast({
        title: 'Selecione equipamentos',
        description: 'Adicione ao menos um equipamento ao evento.',
        variant: 'destructive',
      });
      return;
    }

    createEventMutation.mutate({
      name: formData.name,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location,
      notes: formData.notes || undefined,
      equipmentIds: Array.from(selectedEquipment),
    }, {
      onSuccess: () => {
        toast({
          title: 'Evento criado',
          description: `${selectedEquipment.size} equipamento(s) adicionados.`,
        });

        setFormData({
          name: '',
          startDate: new Date().toISOString().split('T')[0] ?? '',
          endDate: new Date().toISOString().split('T')[0] ?? '',
          location: '',
          notes: '',
        });
        setSelectedEquipment(new Set());
        setIsDialogOpen(false);
      },
      onError: (error) => {
        toast({
          title: 'Erro ao criar evento',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteEventMutation.mutate(id, {
      onSuccess: () => {
        toast({
          title: 'Evento excluído',
          description: 'O evento foi removido do sistema.',
        });
      },
      onError: (error) => {
        toast({
          title: 'Erro ao excluir',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  const handlePrint = (eventId: string) => {
    const current = events.find((item) => item.id === eventId);
    if (!current) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    const rows = current.equipmentIds
      .map((id) => {
        const item = equipment.find((eq) => eq.id === id);
        if (!item) {
          return '';
        }

        return `
          <tr>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.brand ?? '-'}</td>
            <td>${EQUIPMENT_STATUS_LABEL[item.status]}</td>
          </tr>
        `;
      })
      .join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charSet="utf-8" />
          <title>Lista de equipamentos - ${current.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
            .info { margin: 20px 0; }
            .info-item { margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #1e40af; color: #fff; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Lista de equipamentos - ${current.name}</h1>
          <div class="info">
            <p class="info-item"><strong>Período:</strong> ${new Date(current.startDate).toLocaleDateString('pt-BR')} até ${new Date(current.endDate).toLocaleDateString('pt-BR')}</p>
            <p class="info-item"><strong>Local:</strong> ${current.location}</p>
            ${current.notes ? `<p class="info-item"><strong>Observações:</strong> ${current.notes}</p>` : ''}
            <p class="info-item"><strong>Total de equipamentos:</strong> ${current.equipmentIds.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Marca</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="footer">
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            <p>PatrimônioTech - Sistema de Gestão de Ativos</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const renderEventList = (
    eventList: InventoryEvent[],
    emptyMessage: string,
    emptyIcon: ReactNode,
  ): ReactNode => {
    if (eventList.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center text-muted-foreground">
            {emptyIcon}
            <span>{emptyMessage}</span>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {eventList.map((eventItem) => (
          <Card key={eventItem.id}>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-lg font-medium">
                    {eventItem.name}
                    <Badge variant="outline">{eventItem.equipmentIds.length} equipamentos</Badge>
                  </CardTitle>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                      {new Date(eventItem.startDate).toLocaleDateString('pt-BR')} até{' '}
                      {new Date(eventItem.endDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p>{eventItem.location}</p>
                    {eventItem.status === 'completed' ? (
                      <p className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" aria-hidden="true" />
                        Concluído
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePrint(eventItem.id)}
                    title="Imprimir lista"
                  >
                    <Printer className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(eventItem.id)}
                    title="Excluir evento"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {eventItem.notes ? (
                <p className="mb-4 text-sm text-muted-foreground">{eventItem.notes}</p>
              ) : null}
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Equipamentos</p>
                <div className="flex flex-wrap gap-2">
                  {eventItem.equipmentIds.map((equipmentId) => {
                    const item = equipment.find((equipmentItem) => equipmentItem.id === equipmentId);
                    if (!item) {
                      return null;
                    }

                    return (
                      <Badge key={equipmentId} variant="secondary">
                        {item.code} — {item.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const defaultTab = activeEvents.length > 0 ? 'ativos' : 'concluidos';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-medium text-foreground">Eventos</h1>
          <p className="text-muted-foreground">Gerencie eventos e equipamentos externos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Novo evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar novo evento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field>
                <Label htmlFor="event-name">Nome do evento *</Label>
                <Input
                  id="event-name"
                  required
                  value={formData.name}
                  onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Ex: Feira de Tecnologia 2025"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <Label htmlFor="event-start-date">Data de início *</Label>
                  <Input
                    id="event-start-date"
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(event) => setFormData((prev) => ({ ...prev, startDate: event.target.value }))}
                  />
                </Field>
                <Field>
                  <Label htmlFor="event-end-date">Data de término *</Label>
                  <Input
                    id="event-end-date"
                    type="date"
                    required
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={(event) => setFormData((prev) => ({ ...prev, endDate: event.target.value }))}
                  />
                </Field>
              </div>

              <Field>
                <Label htmlFor="event-location">Local *</Label>
                <Input
                  id="event-location"
                  required
                  value={formData.location}
                  onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder="Ex: Centro de Convenções"
                />
              </Field>

              <Field>
                <Label htmlFor="event-notes">Observações</Label>
                <Textarea
                  id="event-notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Informações adicionais sobre o evento"
                />
              </Field>

              <Field>
                <Label>Selecionar equipamentos *</Label>
                <div className="max-h-64 overflow-y-auto rounded-lg border p-4">
                  {equipment.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Nenhum equipamento cadastrado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {equipment.map((item) => (
                        <label
                          key={item.id}
                          htmlFor={`equipment-${item.id}`}
                          className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                        >
                          <Checkbox
                            id={`equipment-${item.id}`}
                            checked={selectedEquipment.has(item.id)}
                            onCheckedChange={() => handleToggleEquipment(item.id)}
                          />
                          <div className="flex-1 text-sm">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.code}</p>
                          </div>
                          <Badge variant="outline">{item.category}</Badge>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedEquipment.size} equipamento(s) selecionado(s)
                </p>
              </Field>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" className="flex-1">
                  Criar evento
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="ativos">Eventos ativos</TabsTrigger>
          <TabsTrigger value="concluidos">Eventos concluídos</TabsTrigger>
        </TabsList>
        <TabsContent value="ativos">
          {renderEventList(
            activeEvents,
            'Nenhum evento em andamento',
            <Calendar className="h-12 w-12 text-muted-foreground" aria-hidden="true" />,
          )}
        </TabsContent>
        <TabsContent value="concluidos">
          {renderEventList(
            completedEvents,
            'Nenhum evento concluído',
            <CheckCircle className="h-12 w-12 text-muted-foreground" aria-hidden="true" />,
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}



