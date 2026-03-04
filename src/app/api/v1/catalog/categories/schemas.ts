import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.string().min(1, 'Cor é obrigatória'),
  optional_field: z.string().optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    optional_field: z.string().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser enviado',
  });
