import { z } from 'zod';

export const createItemSchema = z.object({
  type: z.string().min(1, 'Tipo é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  default_price: z.number().min(0, 'Preço deve ser positivo'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  sku: z.string().optional(),
  pn: z.string().optional(),
  features: z.string().optional(),
  images: z.array(z.string()).optional(),
  category_id: z.string().uuid().optional().nullable(),
});

export const updateItemSchema = z
  .object({
    type: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    default_price: z.number().min(0).optional(),
    unit: z.string().min(1).optional(),
    sku: z.string().nullable().optional(),
    pn: z.string().nullable().optional(),
    features: z.string().nullable().optional(),
    images: z.array(z.string()).optional(),
    category_id: z.string().uuid().nullable().optional(),
    active: z.number().int().min(0).max(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser enviado',
  });
