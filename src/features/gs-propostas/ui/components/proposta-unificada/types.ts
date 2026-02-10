/**
 * Types compartilhados para o mÃ³dulo PropostaUnificada
 * @see docs/specs/SPEC-002-proposta-unificada.md
 */

import * as z from "zod";

// ============================================
// PROPOSAL TYPES
// ============================================

export type ItemUnit = 'hora' | 'dia' | 'unidade' | 'evento';

export const ITEM_UNIT_LABELS: Record<ItemUnit, string> = {
  hora: 'Hora(s)',
  dia: 'Dia(s)',
  unidade: 'Unidade(s)',
  evento: 'Evento',
};

export const ITEM_UNIT_ABBREV: Record<ItemUnit, string> = {
  hora: 'h',
  dia: 'd',
  unidade: 'un',
  evento: 'ev',
};

export interface ProposalItem {
  id: string;
  description: string;
  quantity: number;
  unitValue: number;
  unit?: ItemUnit;
  itemObservation?: string;
}

export interface ProposalData {
  id?: string;
  code: string;
  name: string;
  date?: Date; // Data da Proposta (visual)
  clientId?: string;
  clientName?: string;
  companyId?: string;
  companyName?: string;
  companyCnpj?: string;
  companyAddress?: string;
  companyNeighborhood?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyEmail?: string;
  companyPhone?: string;
  contactName?: string;
  responsibleName?: string;
  paymentMode?: string;
  validity?: Date;
  items: ProposalItem[];
  observations?: string;
  /** Notas internas (nÃ£o vÃ£o para o cliente) */
  internalNotes?: string;
  status: ProposalStatus;
  createdAt?: Date;
  updatedAt?: Date;
  logoUrl?: string;
  logoPosition?: 'left' | 'right';
}

export type ProposalStatus = 'draft' | 'open' | 'sent' | 'won' | 'lost';

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: 'Rascunho',
  open: 'Aberto',
  sent: 'Enviado',
  won: 'Ganha',
  lost: 'Perdida',
};

export const PROPOSAL_STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: 'bg-gray-500',
  open: 'bg-amber-500',
  sent: 'bg-blue-500',
  won: 'bg-emerald-500',
  lost: 'bg-red-500',
};

// ============================================
// TAB TYPES
// ============================================

export type TabKey = 
  | 'principal'
  | 'itens'
  | 'observacoes'
  | 'documentos'
  | 'clientes'
  | 'empresas'

  | 'categorias'
  | 'pagamentos'
  | 'assinaturas'
  | 'notas'
  | 'historico';

export interface TabDefinition {
  key: TabKey;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  group?: 'proposta' | 'cadastro';
}

// ============================================
// FORM SCHEMAS
// ============================================

const parseDateInput = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
};

export const proposalItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "DescriÃ§Ã£o Ã© obrigatÃ³ria"),
  quantity: z.number().min(0, "Quantidade deve ser positiva"),
  unitValue: z.number().min(0, "Valor unitÃ¡rio deve ser positivo"),
  unit: z.enum(['hora', 'dia', 'unidade', 'evento']).optional().default('hora'),
  itemObservation: z.string().optional(),
});

export const proposalFormSchema = z.object({
  code: z.string().min(1, "CÃ³digo Ã© obrigatÃ³rio"),
  name: z.string().min(1, "Nome Ã© obrigatÃ³rio"),
  date: z.string().optional(),
  paymentMode: z.string().optional(),
  validity: z.string().optional(),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  companyCnpj: z.string().optional(),
  companyAddress: z.string().optional(),
  companyNeighborhood: z.string().optional(),
  companyCity: z.string().optional(),
  companyState: z.string().optional(),
  companyZip: z.string().optional(),
  companyEmail: z.string().optional(),
  companyPhone: z.string().optional(),
  responsibleName: z.string().optional(),
  contactName: z.string().optional(),
  items: z.array(proposalItemSchema).default([]),
  observations: z.string().optional(),
  internalNotes: z.string().optional(),
  logoUrl: z.string().optional(),
  logoPosition: z.enum(['left', 'right']).optional().default('left'),
}).superRefine((data, ctx) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const proposalDate = parseDateInput(data.date);
  if (proposalDate && proposalDate < today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["date"],
      message: "Data da proposta nÃ£o pode ser anterior a hoje",
    });
  }

  const validityDate = parseDateInput(data.validity);
  if (validityDate && validityDate < today) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["validity"],
      message: "Validade nÃ£o pode ser anterior a hoje",
    });
  }

  if (proposalDate && validityDate && validityDate < proposalDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["validity"],
      message: "Validade nÃ£o pode ser anterior Ã  data da proposta",
    });
  }
});
export type ProposalFormData = z.infer<typeof proposalFormSchema>;

// ============================================
// COMPONENT PROPS
// ============================================

export interface PropostaUnificadaProps {
  /** ID da proposta (undefined = nova proposta) */
  proposalId?: string;
  
  /** Dados iniciais da proposta (para ediÃ§Ã£o) */
  initialData?: ProposalData;
  
  /** Callback ao salvar com sucesso */
  onSaveSuccess?: (proposal: ProposalData) => void;
  
  /** Callback ao fechar */
  onClose?: () => void;
}

export interface PropostaHeaderProps {
  code: string;
  name: string;
  totalValue: number;
  status: ProposalStatus;
  isPreviewFullscreen: boolean;
  onTogglePreview: () => void;
  onClose: () => void;
}

export interface PropostaFooterProps {
  onExportPdf: () => void;

  onClose: () => void;
  onSave: () => void;
  isSubmitting: boolean;
  isDirty: boolean;
}

// ============================================
// DEFAULTS
// ============================================

export const DEFAULT_PROPOSAL_DATA: ProposalData = {
  code: '',
  name: 'Nova Proposta',
  items: [],
  status: 'draft',
  companyId: undefined,
  companyName: '',
  companyCnpj: '',
  companyAddress: '',
  companyNeighborhood: '',
  companyCity: '',
  companyState: '',
  companyZip: '',
  companyEmail: '',
  companyPhone: '',
  responsibleName: '',
  observations: '',
  internalNotes: '',
  logoPosition: 'left',
};

export const DEFAULT_PROPOSAL_ITEM: Omit<ProposalItem, 'id'> = {
  description: '',
  quantity: 1,
  unitValue: 0,
  unit: 'hora',
};

