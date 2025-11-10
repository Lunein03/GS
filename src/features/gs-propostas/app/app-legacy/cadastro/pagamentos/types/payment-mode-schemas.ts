import { z } from 'zod';

const MAX_INSTALLMENTS = 120;
const MAX_DESCRIPTION_LENGTH = 1000;

const descriptionField = z
  .string()
  .trim()
  .max(MAX_DESCRIPTION_LENGTH, 'Descricao deve ter no maximo 1000 caracteres')
  .optional()
  .transform((value) => {
    if (!value) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  });

export const paymentModeSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(120, 'Nome deve ter no maximo 120 caracteres'),
  installments: z
    .number()
    .int()
    .min(1, 'Numero minimo de prestacoes e 1')
    .max(MAX_INSTALLMENTS, 'Numero maximo de prestacoes excedido'),
  interestRate: z
    .number()
    .min(0, 'Taxa de juros nao pode ser negativa')
    .max(100, 'Taxa de juros nao pode exceder 100%'),
  adjustmentRate: z
    .number()
    .min(0, 'Ajuste nao pode ser negativo')
    .max(100, 'Ajuste nao pode exceder 100%'),
  description: descriptionField,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().optional().nullable(),
});

export const paymentModeFormSchema = z.object({
  name: paymentModeSchema.shape.name,
  installments: z.coerce
    .number()
    .int()
    .min(1, 'Numero minimo de prestacoes e 1')
    .max(MAX_INSTALLMENTS, 'Numero maximo de prestacoes excedido'),
  interestRate: z.coerce
    .number()
    .min(0, 'Taxa de juros nao pode ser negativa')
    .max(100, 'Taxa de juros nao pode exceder 100%'),
  adjustmentRate: z.coerce
    .number()
    .min(0, 'Ajuste nao pode ser negativo')
    .max(100, 'Ajuste nao pode exceder 100%'),
  description: descriptionField,
});

export const createPaymentModeSchema = paymentModeFormSchema;

export const updatePaymentModeSchema = paymentModeFormSchema.extend({
  id: z.string().uuid(),
});

export const deletePaymentModeSchema = z.object({
  id: z.string().uuid(),
});

export const getPaymentModesSchema = z.object({
  search: z
    .string()
    .trim()
    .max(120, 'Busca deve ter no maximo 120 caracteres')
    .optional(),
});

export type PaymentModeSchema = z.infer<typeof paymentModeSchema>;
export type PaymentModeFormSchema = z.infer<typeof paymentModeFormSchema>;
export type CreatePaymentModeInput = z.infer<typeof createPaymentModeSchema>;
export type UpdatePaymentModeInput = z.infer<typeof updatePaymentModeSchema>;
export type DeletePaymentModeInput = z.infer<typeof deletePaymentModeSchema>;
export type GetPaymentModesInput = z.infer<typeof getPaymentModesSchema>;

// TODO (LOW): [Pagamentos Validacao] Criar testes unitarios para cobranca de limites de percentual e prestacoes.
