import type { Equipment } from '@/features/patrimonio/domain/types/equipment';

export const EQUIPMENT_STATUS_LABEL: Record<Equipment['status'], string> = {
  available: 'Disponível',
  'in-use': 'Em uso',
  maintenance: 'Manutenção',
  retired: 'Inativo',
};

export const EQUIPMENT_STATUS_STYLES: Record<Equipment['status'], string> = {
  available:
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/45 dark:bg-emerald-400/20 dark:text-emerald-50',
  'in-use':
    'border-violet-500/40 bg-violet-500/10 text-violet-600 dark:border-violet-400/45 dark:bg-violet-400/20 dark:text-violet-100',
  maintenance:
    'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:border-amber-400/45 dark:bg-amber-400/20 dark:text-amber-100',
  retired:
    'border-slate-400/50 bg-slate-200/80 text-slate-700 dark:border-slate-500/40 dark:bg-slate-600/40 dark:text-slate-100',
};

