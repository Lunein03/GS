import type { Equipment } from '@/app/patrimonio/types/equipment';

export const EQUIPMENT_STATUS_LABEL: Record<Equipment['status'], string> = {
  available: 'Disponível',
  'in-use': 'Em uso',
  maintenance: 'Manutenção',
  retired: 'Inativo',
};

export const EQUIPMENT_STATUS_STYLES: Record<Equipment['status'], string> = {
  available: 'border-accent/30 bg-accent/20 text-accent',
  'in-use': 'border-primary/30 bg-primary/20 text-primary',
  maintenance: 'border-destructive/30 bg-destructive/20 text-destructive',
  retired: 'border-muted-foreground/30 bg-muted text-muted-foreground',
};
