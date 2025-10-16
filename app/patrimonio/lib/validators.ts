import { z } from 'zod';

const equipmentStatusSchema = z.enum(['available', 'in-use', 'maintenance', 'retired']);

const optionalString = z
  .string()
  .trim()
  .max(255)
  .transform((value: string) => (value.length === 0 ? undefined : value))
  .optional();

export const createEquipmentSchema = z.object({
  name: z.string().trim().min(3, 'Informe ao menos 3 caracteres'),
  category: z.string().trim().min(2, 'Informe ao menos 2 caracteres'),
  brand: optionalString,
  model: optionalString,
  serialNumber: optionalString,
  acquisitionDate: z.coerce.date({ invalid_type_error: 'Data de aquisição inválida' }),
  status: equipmentStatusSchema.default('available'),
  location: optionalString,
  notes: optionalString,
});

export const updateEquipmentSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
  data: createEquipmentSchema
    .partial()
    .refine((values: Partial<z.infer<typeof createEquipmentSchema>>) => Object.keys(values).length > 0, {
      message: 'Informe ao menos um campo para atualizar',
    }),
});

export const deleteEquipmentSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
  softDelete: z.boolean().default(true),
});

export const equipmentFiltersSchema = z.object({
  status: equipmentStatusSchema.optional(),
  category: optionalString,
  search: optionalString,
  includeDeleted: z.boolean().optional(),
});

export const createEventSchema = z.object({
  name: z.string().trim().min(3, 'Informe um nome válido'),
  date: z.coerce.date({ invalid_type_error: 'Data do evento inválida' }),
  location: z.string().trim().min(2, 'Informe uma localização'),
  notes: optionalString,
  equipmentIds: z.array(z.string().uuid()).min(1, 'Selecione ao menos um equipamento'),
});

export const deleteEventSchema = z.object({
  id: z.string().uuid('Identificador inválido'),
});

export const eventFiltersSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  includeDeleted: z.boolean().optional(),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type EquipmentFiltersInput = z.infer<typeof equipmentFiltersSchema>;
export type EventFiltersInput = z.infer<typeof eventFiltersSchema>;
export type DeleteEquipmentInput = z.infer<typeof deleteEquipmentSchema>;
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;
