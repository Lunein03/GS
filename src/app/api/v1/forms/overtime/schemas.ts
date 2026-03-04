import { z } from 'zod';

export const createOvertimeSchema = z.object({
  employee_name: z.string().min(1, 'Nome do funcionário é obrigatório'),
  overtime_date: z.string().min(1, 'Data é obrigatória'),
  start_time: z.string().min(1, 'Hora de início é obrigatória'),
  end_time: z.string().min(1, 'Hora de fim é obrigatória'),
  justification: z.string().min(1, 'Justificativa é obrigatória'),
});

export const updateOvertimeSchema = z
  .object({
    status: z.string().optional(),
    approved_by: z.string().optional(),
    rejection_reason: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser enviado',
  });

export type CreateOvertimePayload = z.infer<typeof createOvertimeSchema>;
export type UpdateOvertimePayload = z.infer<typeof updateOvertimeSchema>;
