import { z } from 'zod';

// ============================================
// SCHEMAS
// ============================================

const colorRegex = /^#([0-9A-Fa-f]{6})$/;

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
  .min(2, 'Nome da categoria deve ter pelo menos 2 caracteres')
  .max(80, 'Nome da categoria deve ter no maximo 80 caracteres'),
  color: z
    .string()
    .regex(colorRegex, 'Selecione uma cor válida'),
  description: z
    .string()
    .trim()
  .max(1000, 'Descricao deve ter no maximo 1000 caracteres')
    .optional()
    .or(z.literal('').transform(() => undefined)),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const categoryFormSchema = categorySchema.pick({
  name: true,
  color: true,
  description: true,
});

export const createCategorySchema = categoryFormSchema;

export const updateCategorySchema = categoryFormSchema.extend({
  id: z.string().uuid(),
});

export const deleteCategorySchema = z.object({
  id: z.string().uuid(),
});

export const getCategoriesSchema = z.object({
  search: z
    .string()
    .trim()
  .max(120, 'Busca deve ter no maximo 120 caracteres')
    .optional(),
});

// ============================================
// TYPES
// ============================================

export type CategorySchema = z.infer<typeof categorySchema>;
export type CategoryFormSchema = z.infer<typeof categoryFormSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type GetCategoriesInput = z.infer<typeof getCategoriesSchema>;

// TODO (LOW): [Categorias Validacao] Adicionar testes unitarios para garantir mensagens de erro consistentes.
