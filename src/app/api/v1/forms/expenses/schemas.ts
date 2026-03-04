import { z } from 'zod';

export const createExpenseSchema = z.object({
  employee_name: z.string().min(1, 'Nome do funcionário é obrigatório'),
  expense_date: z.string().min(1, 'Data da despesa é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  category_other: z.string().optional(),
  event_name: z.string().min(1, 'Nome do evento é obrigatório'),
  transport_type: z.string().optional(),
  transport_other: z.string().optional(),
  amount: z.number().positive('Valor deve ser positivo'),
});

export const updateExpenseSchema = z
  .object({
    status: z.string().optional(),
    approved_by: z.string().optional(),
    rejection_reason: z.string().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser enviado',
  });

export type CreateExpensePayload = z.infer<typeof createExpenseSchema>;
export type UpdateExpensePayload = z.infer<typeof updateExpenseSchema>;
