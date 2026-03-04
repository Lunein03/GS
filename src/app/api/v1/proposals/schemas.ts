import { z } from 'zod';

const proposalStatuses = ['DRAFT', 'OPEN', 'SENT', 'WON', 'LOST'] as const;
const noteModes = ['manual', 'automatic'] as const;
const signatureTypes = ['govbr', 'custom'] as const;

// --- Proposals ---

export const createProposalSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  title: z.string().min(1, 'Título é obrigatório'),
  opportunity_id: z.string().uuid().nullable().optional(),
  client_name: z.string().min(1, 'Nome do cliente é obrigatório'),
  client_email: z.string().nullable().optional(),
  client_phone: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  payment_mode: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional(),
  total_value: z.number().default(0),
  discount: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  responsible_user: z.string().nullable().optional(),
  items: z.array(z.object({
    type: z.string().min(1),
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    quantity: z.number().positive(),
    unit_price: z.number().min(0),
    discount: z.number().nullable().optional(),
    total: z.number().min(0),
    order: z.number().int().default(0),
  })).optional(),
});

export const updateProposalSchema = z.object({
  title: z.string().min(1).optional(),
  client_name: z.string().min(1).optional(),
  client_email: z.string().nullable().optional(),
  client_phone: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  payment_mode: z.string().nullable().optional(),
  valid_until: z.string().nullable().optional(),
  total_value: z.number().optional(),
  discount: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  responsible_user: z.string().nullable().optional(),
});

export const changeProposalStatusSchema = z.object({
  new_status: z.enum(proposalStatuses),
  user_id: z.string().optional(),
});

// --- Items ---

export const createItemSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  quantity: z.number().positive(),
  unit_price: z.number().min(0),
  discount: z.number().nullable().optional(),
  total: z.number().min(0),
  order: z.number().int().default(0),
});

export const updateItemSchema = createItemSchema.partial();

// --- Notes ---

export const createNoteSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullable().optional(),
  inclusion_mode: z.enum(noteModes).default('manual'),
});

export const updateNoteSchema = createNoteSchema.partial();

// --- Payment Modes ---

export const createPaymentModeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  installments: z.number().int().positive().default(1),
  interest_rate: z.number().default(0),
  adjustment_rate: z.number().default(0),
  description: z.string().nullable().optional(),
});

export const updatePaymentModeSchema = createPaymentModeSchema.partial();

// --- Signatures ---

export const createSignatureSchema = z.object({
  proposal_id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  email: z.string().min(1, 'Email é obrigatório'),
  phone: z.string().nullable().optional(),
  signature_type: z.enum(signatureTypes),
});

export const updateSignatureSchema = z.object({
  name: z.string().min(1).optional(),
  cpf: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  status: z.string().optional(),
  govbr_identifier: z.string().nullable().optional(),
  signature_image: z.string().nullable().optional(),
  signature_image_mime: z.string().nullable().optional(),
  signature_image_width: z.number().nullable().optional(),
  signature_image_height: z.number().nullable().optional(),
});
