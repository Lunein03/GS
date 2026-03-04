import { z } from 'zod';

const opportunityStatuses = ['OPEN', 'IN_PROGRESS', 'WON', 'LOST'] as const;

export const createOpportunitySchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().nullable().optional(),
  value: z.union([z.number(), z.string()]).transform((v) =>
    typeof v === 'string' ? parseFloat(v) || 0 : v
  ),
  probability: z.number().int().min(0).max(100).nullable().optional(),
  next_step: z.string().nullable().optional(),
  client_name: z.string().nullable().optional(),
  client_email: z.string().nullable().optional(),
  responsible_user: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateOpportunitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  value: z.union([z.number(), z.string()]).transform((v) =>
    typeof v === 'string' ? parseFloat(v) || 0 : v
  ).optional(),
  probability: z.number().int().min(0).max(100).nullable().optional(),
  next_step: z.string().nullable().optional(),
  client_name: z.string().nullable().optional(),
  client_email: z.string().nullable().optional(),
  responsible_user: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export const changeStatusSchema = z.object({
  new_status: z.enum(opportunityStatuses),
  user_id: z.string().optional().default('system'),
  notes: z.string().optional(),
});
