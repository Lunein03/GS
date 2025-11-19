'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { Calendar, CheckCircle, Edit3, Minus, Plus, Printer, Search, Trash2 } from 'lucide-react';

import { useEquipmentList } from '@/features/patrimonio/hooks/use-equipment';
import {
  useEventsList,
  useCreateEvent,
  useDeleteEvent,
  useUpdateEvent,
} from '@/features/patrimonio/hooks/use-events';
import { EQUIPMENT_STATUS_LABEL } from '@/features/patrimonio/domain/equipment-status';
import type { Event as InventoryEvent } from '@/features/patrimonio/domain/types/equipment';
import { Button } from '@/shared/ui/button';
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
import { SectionShell } from '@/shared/components/section-shell';
import { cn } from '@/shared/lib/utils';
import { addEquipmentToEvent, removeEquipmentFromEvent } from '@/features/patrimonio/api/events';

const getTodayIsoDate = () => new Date().toISOString().split('T')[0];
const toDateInputValue = (value: string) => value.split('T')[0];

interface EventFormState {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  notes: string;
}

type EquipmentSelection = Record<string, number>;

const PAGE_STACK_CLASS = 'space-y-12 lg:space-y-16';
const HEADER_CONTAINER_CLASS = 'flex flex-col gap-4 md:flex-row md:items-center md:justify-between';
const PRIMARY_BUTTON_CLASS = 'h-12 rounded-xl border border-accent/30 bg-accent/20 px-5 text-foreground transition hover:bg-accent/30';
const ACTION_ICON_BUTTON_CLASS = 'h-10 w-10 rounded-xl border border-border bg-card/60 text-muted-foreground transition hover:bg-card/80 hover:text-foreground';
const EVENT_CARD_CLASS = 'rounded-2xl border border-border bg-card/80 p-6 backdrop-blur-xl';
const EMPTY_STATE_CLASS = 'flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card/60 p-12 text-center text-muted-foreground';
const STAT_BADGE_CLASS = 'rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground';
const EQUIPMENT_TAG_CLASS = 'rounded-lg border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground';
const INPUT_CLASS = 'h-12 rounded-xl border border-border bg-card/60 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent';
const TEXTAREA_CLASS = 'rounded-xl border border-border bg-card/60 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent';
const EQUIPMENT_OPTION_CLASS = 'flex cursor-pointer items-start gap-3 rounded-xl border border-transparent p-3 transition hover:border-border hover:bg-card/50';
const EQUIPMENT_OPTION_BADGE = 'rounded-lg border border-border bg-card/40 px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground';
const TABS_LIST_CLASS = 'inline-flex rounded-full border border-border bg-card/60 p-1';
const TAB_TRIGGER_CLASS = 'rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm';
const DIALOG_CONTENT_CLASS = 'max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background/90 p-6 backdrop-blur-xl';

export function EventsContent() {
  const { data: equipment = [], isLoading: isLoadingEquipment } = useEquipmentList();
  const { data: events = [], isLoading: isLoadingEvents } = useEventsList();
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<EventFormState>(() => ({
    name: '',
    startDate: getTodayIsoDate(),
    endDate: getTodayIsoDate(),
    location: '',
    notes: '',
  }));
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentSelection>({});
  const [editingEvent, setEditingEvent] = useState<InventoryEvent | null>(null);
  const [equipmentSearch, setEquipmentSearch] = useState('');

  const resetForm = () => {
    const today = getTodayIsoDate();
    setFormData({
      name: '',
      startDate: today,
      endDate: today,
      location: '',
      notes: '',
    });
    setSelectedEquipment({});
    setEquipmentSearch('');
    setEditingEvent(null);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };
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

  const filteredEquipment = useMemo(() => {
    const query = equipmentSearch.trim().toLowerCase();
    if (!query) {
      return equipment;
    }
    return equipment.filter((item) => {
      const normalizedName = item.name.toLowerCase();
      const normalizedCode = item.code.toLowerCase();
      const normalizedCategory = item.category.toLowerCase();
      return (
        normalizedName.includes(query) ||
        normalizedCode.includes(query) ||
        normalizedCategory.includes(query)
      );
    });
  }, [equipment, equipmentSearch]);

  const selectedEquipmentEntries = Object.entries(selectedEquipment);
  const selectedEquipmentCount = selectedEquipmentEntries.length;
  const selectedUnitsCount = selectedEquipmentEntries.reduce((total, [, quantity]) => total + quantity, 0);

  const isEditing = Boolean(editingEvent);

  const buildHeader = (action: ReactNode) => (
    <div className={HEADER_CONTAINER_CLASS}>
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Eventos</h1>
        <p className="text-sm text-muted-foreground">Gerencie eventos, logística e equipamentos externos</p>
      </div>
      <div className="flex w-full md:w-auto md:justify-end">{action}</div>
    </div>
  );

  if (isLoadingEquipment || isLoadingEvents) {
    return (
      <SectionShell
        title="Eventos"
        subtitle="Gerencie eventos e equipamentos externos"
        header={buildHeader(<div className="h-12 w-full animate-pulse rounded-xl bg-card/60 md:w-36" />)}
      >
        <div className={PAGE_STACK_CLASS}>
          <div className={cn(EVENT_CARD_CLASS, 'space-y-4 animate-pulse')}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-24 rounded-xl bg-card/50" />
            ))}
          </div>
        </div>
      </SectionShell>
    );
  }

  const handleToggleEquipment = (id: string) => {
    setSelectedEquipment((prev) => {
      const next = { ...prev };
      if (Object.prototype.hasOwnProperty.call(next, id)) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  const handleQuantityChange = (id: string, value: number, max: number) => {
    setSelectedEquipment((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, id)) {
        return prev;
      }

      const sanitized = Number.isNaN(value) ? prev[id] : value;
      const clamped = Math.max(1, Math.min(Math.floor(sanitized) || 1, Math.max(max, 1)));
      return { ...prev, [id]: clamped };
    });
  };

  const handleIncrementQuantity = (id: string, max: number) => {
    setSelectedEquipment((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, id)) {
        return prev;
      }

      const current = prev[id];
      const next = Math.min(current + 1, Math.max(max, 1));
      return { ...prev, [id]: next };
    });
  };

  const handleDecrementQuantity = (id: string) => {
    setSelectedEquipment((prev) => {
      if (!Object.prototype.hasOwnProperty.call(prev, id)) {
        return prev;
      }

      const current = prev[id];
      if (current <= 1) {
        return prev;
      }

      return { ...prev, [id]: current - 1 };
    });
  };

  const syncEquipmentAssociations = async (
    eventId: string,
    previousAllocations: InventoryEvent['equipmentAllocations'],
  ) => {
    const previousMap = new Map<string, number>();
    previousAllocations.forEach((allocation) => {
      previousMap.set(allocation.equipmentId, allocation.quantity);
    });

    const toRemove = previousAllocations
      .filter(({ equipmentId }) => !Object.prototype.hasOwnProperty.call(selectedEquipment, equipmentId))
      .map(({ equipmentId }) => equipmentId);

    const toAddOrUpdate = Object.entries(selectedEquipment)
      .map(([equipmentId, quantity]) => ({ equipmentId, quantity }))
      .filter(({ equipmentId, quantity }) => previousMap.get(equipmentId) !== quantity);

    let modified = 0;
    let removed = 0;

    for (const equipmentId of toRemove) {
      const result = await removeEquipmentFromEvent(eventId, equipmentId);
      if (!result.success) {
        throw new Error(result.error?.message || 'Erro ao remover equipamento do evento.');
      }
      removed += 1;
    }

    for (const allocation of toAddOrUpdate) {
      const result = await addEquipmentToEvent(eventId, allocation.equipmentId, allocation.quantity);
      if (!result.success) {
        throw new Error(result.error?.message || 'Erro ao adicionar equipamento ao evento.');
      }
      modified += 1;
    }

    return { modified, removed };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (selectedEquipmentCount === 0) {
      toast({
        title: 'Selecione equipamentos',
        description: 'Adicione ao menos um equipamento ao evento.',
        variant: 'destructive',
      });
      return;
    }

    const sanitizedName = formData.name.trim();
    const sanitizedLocation = formData.location.trim();
    const sanitizedNotes = formData.notes.trim();

    const payload = {
      name: sanitizedName,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: sanitizedLocation,
      notes: sanitizedNotes ? sanitizedNotes : undefined,
    };

    const equipmentAllocations = selectedEquipmentEntries.map(([equipmentId, quantity]) => ({
      equipmentId,
      quantity,
    }));

    if (isEditing && editingEvent) {
      try {
        const updatedEvent = await updateEventMutation.mutateAsync({
          id: editingEvent.id,
          ...payload,
        });

        const { modified, removed } = await syncEquipmentAssociations(
          updatedEvent.id,
          editingEvent.equipmentAllocations,
        );

        const descriptionParts: string[] = [];
        if (modified > 0) {
          descriptionParts.push(`${modified} equipamento(s) atualizado(s)`);
        }
        if (removed > 0) {
          descriptionParts.push(`${removed} equipamento(s) removido(s)`);
        }

        toast({
          title: 'Evento atualizado',
          description:
            descriptionParts.length > 0
              ? descriptionParts.join(' e ')
              : 'Informações atualizadas com sucesso.',
        });

        handleDialogOpenChange(false);
      } catch (error) {
        toast({
          title: 'Erro ao atualizar evento',
          description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
          variant: 'destructive',
        });
      }

      return;
    }

    try {
      await createEventMutation.mutateAsync({
        ...payload,
        equipmentAllocations,
      });

      toast({
        title: 'Evento criado',
        description: `${selectedUnitsCount} unidade(s) adicionadas.`,
      });

      handleDialogOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao criar evento',
        description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    }
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

    const totalUnits = current.equipmentAllocations.reduce(
      (sum, allocation) => sum + allocation.quantity,
      0,
    );

    const rows = current.equipmentAllocations
      .map((allocation) => {
        const item = equipment.find((eq) => eq.id === allocation.equipmentId);
        if (!item) {
          return '';
        }

        return `
          <tr>
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${allocation.quantity}</td>
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
            body { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif; background: #ffffff; color: #111827; padding: 40px; }
            h1 { font-size: 24px; font-weight: 600; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 24px; }
            .info { margin: 20px 0; }
            .info-item { margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: left; }
            th { background-color: #0f172a; color: #f9fafb; font-weight: 500; letter-spacing: 0.02em; }
            tr:nth-child(even) { background-color: #f3f4f6; }
            .footer { margin-top: 40px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>Lista de equipamentos - ${current.name}</h1>
          <div class="info">
            <p class="info-item"><strong>Período:</strong> ${new Date(current.startDate).toLocaleDateString('pt-BR')} até ${new Date(current.endDate).toLocaleDateString('pt-BR')}</p>
            <p class="info-item"><strong>Local:</strong> ${current.location}</p>
            ${current.notes ? `<p class="info-item"><strong>Observações:</strong> ${current.notes}</p>` : ''}
            <p class="info-item"><strong>Total de equipamentos:</strong> ${current.equipmentAllocations.length}</p>
            <p class="info-item"><strong>Total de unidades:</strong> ${totalUnits}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Quantidade</th>
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

  const handleOpenEdit = (eventItem: InventoryEvent) => {
    if (eventItem.status === 'completed') {
      return;
    }
    setEditingEvent(eventItem);
    setFormData({
      name: eventItem.name,
      startDate: toDateInputValue(eventItem.startDate),
      endDate: toDateInputValue(eventItem.endDate),
      location: eventItem.location,
      notes: eventItem.notes ?? '',
    });
    const initialSelection: EquipmentSelection = {};
    eventItem.equipmentAllocations.forEach((allocation) => {
      initialSelection[allocation.equipmentId] = allocation.quantity;
    });
    setSelectedEquipment(initialSelection);
    setEquipmentSearch('');
    handleDialogOpenChange(true);
  };

  const renderEventList = (
    eventList: InventoryEvent[],
    emptyMessage: string,
    emptyIcon: ReactNode,
  ): ReactNode => {
    if (eventList.length === 0) {
      return (
        <div className={EMPTY_STATE_CLASS}>
          {emptyIcon}
          <span>{emptyMessage}</span>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {eventList.map((eventItem) => {
          const totalUnits = eventItem.equipmentAllocations.reduce(
            (sum, allocation) => sum + allocation.quantity,
            0,
          );
          return (
            <article key={eventItem.id} className={EVENT_CARD_CLASS}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{eventItem.name}</h3>
                  <span className={STAT_BADGE_CLASS}>
                    {eventItem.equipmentAllocations.length} equipamentos
                    {totalUnits !== eventItem.equipmentAllocations.length ? ` Â· ${totalUnits} unidades` : ''}
                  </span>
                  {eventItem.status === 'completed' ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-accent">
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      Concluído
                    </span>
                  ) : null}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    {new Date(eventItem.startDate).toLocaleDateString('pt-BR')} até{' '}
                    {new Date(eventItem.endDate).toLocaleDateString('pt-BR')}
                  </p>
                  <p>{eventItem.location}</p>
                  {eventItem.notes ? (
                    <p className="text-xs text-muted-foreground">{eventItem.notes}</p>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(eventItem)}
                  title={
                    eventItem.status === 'completed'
                      ? 'Evento concluído não pode ser editado'
                      : 'Editar evento'
                  }
                  disabled={eventItem.status === 'completed'}
                  className={ACTION_ICON_BUTTON_CLASS}
                >
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePrint(eventItem.id)}
                  title="Imprimir lista"
                  className={ACTION_ICON_BUTTON_CLASS}
                >
                  <Printer className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(eventItem.id)}
                  title="Excluir evento"
                  className={cn(ACTION_ICON_BUTTON_CLASS, 'text-destructive hover:text-destructive')}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Equipamentos</p>
              <div className="flex flex-wrap gap-2">
                {eventItem.equipmentAllocations.map((allocation) => {
                  const item = equipment.find((equipmentItem) => equipmentItem.id === allocation.equipmentId);
                  if (!item) {
                    return null;
                  }

                  return (
                    <span key={allocation.equipmentId} className={EQUIPMENT_TAG_CLASS}>
                      <span className="font-semibold">{allocation.quantity}×</span> {item.code} — {item.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </article>
        );
      })}
      </div>
    );
  };

  const defaultTab = activeEvents.length > 0 ? 'ativos' : 'concluidos';

  const headerAction = (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button className={PRIMARY_BUTTON_CLASS}>
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Novo evento
        </Button>
      </DialogTrigger>
      <DialogContent className={DIALOG_CONTENT_CLASS}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar evento' : 'Criar novo evento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          <Field>
            <Label htmlFor="event-name">Nome do evento *</Label>
            <Input
              id="event-name"
              required
              value={formData.name}
              onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Ex: Feira de Tecnologia 2025"
              className={INPUT_CLASS}
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
                className={cn(INPUT_CLASS, 'pr-3')}
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
                className={cn(INPUT_CLASS, 'pr-3')}
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
              className={INPUT_CLASS}
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
              className={TEXTAREA_CLASS}
            />
          </Field>

          <Field>
            <Label>Selecionar equipamentos *</Label>
            <div className="space-y-3">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  value={equipmentSearch}
                  onChange={(event) => setEquipmentSearch(event.target.value)}
                  placeholder="Pesquisar equipamentos"
                  aria-label="Pesquisar equipamentos"
                  className={cn(INPUT_CLASS, 'pl-10')}
                />
              </div>
              <div className="max-h-64 overflow-y-auto rounded-2xl border border-border bg-card/40 p-4">
                {equipment.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum equipamento cadastrado
                  </p>
                ) : filteredEquipment.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Nenhum equipamento corresponde à busca
                  </p>
                ) : (
                  <div className="space-y-2">
                    {filteredEquipment.map((item) => {
                      const isSelected = Object.prototype.hasOwnProperty.call(selectedEquipment, item.id);
                      const selectedQuantity = selectedEquipment[item.id] ?? 1;
                      const availableQuantity = item.quantity ?? 1;
                      return (
                        <label
                          key={item.id}
                          htmlFor={`equipment-${item.id}`}
                          className={EQUIPMENT_OPTION_CLASS}
                        >
                          <Checkbox
                            id={`equipment-${item.id}`}
                            checked={isSelected}
                            onCheckedChange={() => handleToggleEquipment(item.id)}
                          />
                          <div className="flex-1 text-sm">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.code}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {availableQuantity > 1 ? (
                              <div className="flex items-center gap-2 rounded-full border border-border bg-card/40 px-2 py-1">
                                <button
                                  type="button"
                                  onClick={() => handleDecrementQuantity(item.id)}
                                  disabled={!isSelected || selectedQuantity <= 1}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-transparent text-sm text-muted-foreground transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Minus className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <span className="min-w-[32px] text-center text-sm font-semibold text-foreground">
                                  {selectedQuantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleIncrementQuantity(item.id, availableQuantity)}
                                  disabled={!isSelected || selectedQuantity >= availableQuantity}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-transparent text-sm text-muted-foreground transition hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Plus className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                            ) : null}
                            <span className="text-[11px] text-muted-foreground">
                              Disponível {availableQuantity}
                            </span>
                          </div>
                          <span className={EQUIPMENT_OPTION_BADGE}>{item.category}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedEquipmentCount} equipamento(s), {selectedUnitsCount} unidade(s) selecionado(s)
            </p>
          </Field>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="submit"
              className="h-11 flex-1 rounded-xl border border-accent/30 bg-accent/20 text-foreground transition hover:bg-accent/30"
            >
              {isEditing ? 'Atualizar evento' : 'Criar evento'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogOpenChange(false)}
              className="h-11 rounded-xl border-border"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <SectionShell
      title="Eventos"
      subtitle="Gerencie eventos e equipamentos externos"
      header={buildHeader(headerAction)}
    >
      <div className={PAGE_STACK_CLASS}>
        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className={TABS_LIST_CLASS}>
            <TabsTrigger value="ativos" className={TAB_TRIGGER_CLASS}>
              Eventos ativos
            </TabsTrigger>
            <TabsTrigger value="concluidos" className={TAB_TRIGGER_CLASS}>
              Eventos concluídos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="ativos" className="mt-0">
            {renderEventList(
              activeEvents,
              'Nenhum evento em andamento',
              <Calendar className="h-12 w-12 text-muted-foreground" aria-hidden="true" />,
            )}
          </TabsContent>
          <TabsContent value="concluidos" className="mt-0">
            {renderEventList(
              completedEvents,
              'Nenhum evento concluído',
              <CheckCircle className="h-12 w-12 text-muted-foreground" aria-hidden="true" />,
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SectionShell>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}



