import { z } from 'zod';

const inclusionModes = ['manual', 'automatic'] as const;

const editorHtmlRegex = /<[^>]+>/;

export const noteSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(2, 'Nome da nota deve ter pelo menos 2 caracteres')
    .max(120, 'Nome da nota deve ter no maximo 120 caracteres'),
  description: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length === 0 || editorHtmlRegex.test(value), {
      message: 'Descricao deve conter conteudo formatado',
    })
    .optional(),
  inclusionMode: z.enum(inclusionModes).default('manual'),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const noteFormSchema = noteSchema
  .pick({
    name: true,
    description: true,
    inclusionMode: true,
  })
  .extend({
    inclusionMode: z.enum(inclusionModes),
  });

export const createNoteSchema = noteFormSchema;

export const updateNoteSchema = noteFormSchema.extend({
  id: z.string().uuid(),
});

export const deleteNoteSchema = z.object({
  id: z.string().uuid(),
});

export const getNotesSchema = z.object({
  search: z
    .string()
    .trim()
    .max(120, 'Busca deve ter no maximo 120 caracteres')
    .optional(),
});

export type NoteSchema = z.infer<typeof noteSchema>;
export type NoteFormSchema = z.infer<typeof noteFormSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
export type DeleteNoteInput = z.infer<typeof deleteNoteSchema>;
export type GetNotesInput = z.infer<typeof getNotesSchema>;

// TODO (LOW): [Notas Validacao] Adicionar testes unitarios cobrindo sanitizer do editor.
