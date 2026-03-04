import { z } from 'zod';

const equipmentStatuses = ['available', 'in-use', 'maintenance', 'retired'] as const;
const eventStatuses = ['pending', 'completed'] as const;

export const createEquipmentSchema = z.object({
  code: z.string().min(1, 'Código é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  serial_number: z.string().nullable().optional(),
  acquisition_date: z.string().min(1, 'Data de aquisição é obrigatória'),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  quantity: z.number().int().positive().default(1),
  unit_value_cents: z.number().int().nullable().optional(),
});

export const updateEquipmentSchema = z.object({
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  serial_number: z.string().nullable().optional(),
  acquisition_date: z.string().optional(),
  status: z.enum(equipmentStatuses).optional(),
  location: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  quantity: z.number().int().positive().optional(),
  unit_value_cents: z.number().int().nullable().optional(),
});

export const createEventSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de fim é obrigatória'),
  location: z.string().min(1, 'Local é obrigatório'),
  notes: z.string().nullable().optional(),
  equipment: z.array(z.object({
    equipment_id: z.string().uuid(),
    quantity: z.number().int().positive().default(1),
  })).optional(),
});

export const updateEventSchema = z.object({
  name: z.string().min(1).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  location: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(eventStatuses).optional(),
});

export const addEquipmentToEventSchema = z.object({
  quantity: z.number().int().positive().default(1),
});
