import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { ActionResponse } from '@/shared/lib/types/actions';
import {
  createPaymentModeSchema,
  deletePaymentModeSchema,
  getPaymentModesSchema,
  paymentModeSchema,
  updatePaymentModeSchema,
  type CreatePaymentModeInput,
  type DeletePaymentModeInput,
  type GetPaymentModesInput,
  type PaymentMode,
  type UpdatePaymentModeInput,
} from '@/features/gs-propostas/app/app-legacy/cadastro/pagamentos/types';

type ApiPaymentMode = {
  id: string;
  name: string;
  installments: number;
  interest_rate: string;
  adjustment_rate: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

const API_BASE = '/proposals/payment-modes';

const success = <T>(data: T): ActionResponse<T> => ({
  success: true,
  data,
});

const failure = <T>(
  message: string,
  code: 'UNEXPECTED_ERROR' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'CONFLICT' | 'UNAUTHORIZED' = 'UNEXPECTED_ERROR',
): ActionResponse<T> => ({
  success: false,
  error: { code, message },
});

const mapPaymentMode = (input: ApiPaymentMode): PaymentMode =>
  paymentModeSchema.parse({
    id: input.id,
    name: input.name,
    installments: input.installments,
    interestRate: Number(input.interest_rate),
    adjustmentRate: Number(input.adjustment_rate),
    description: input.description ?? undefined,
    createdAt: input.created_at,
    updatedAt: input.updated_at,
    deletedAt: input.deleted_at ?? null,
  });

export async function getPaymentModes(
  input: GetPaymentModesInput,
): Promise<ActionResponse<{ paymentModes: PaymentMode[] }>> {
  const parsed = getPaymentModesSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      parsed.error.errors[0]?.message ?? 'Filtro invalido.',
      'VALIDATION_ERROR',
    );
  }

  try {
    const response = await fetchApi<ApiPaymentMode[]>(API_BASE);

    const filtered = parsed.data.search
      ? response.filter((mode) =>
          mode.name.toLowerCase().includes(parsed.data.search!.toLowerCase()),
        )
      : response;

    return success({ paymentModes: filtered.map(mapPaymentMode) });
  } catch (error) {
    const message =
      error instanceof HttpError ? error.message : 'Erro ao listar modos de pagamento.';
    return failure(message);
  }
}

export async function createPaymentMode(
  input: CreatePaymentModeInput,
): Promise<ActionResponse<PaymentMode>> {
  const parsed = createPaymentModeSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      parsed.error.errors[0]?.message ?? 'Dados invalidos.',
      'VALIDATION_ERROR',
    );
  }

  try {
    const response = await fetchApi<ApiPaymentMode>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        name: parsed.data.name.trim(),
        installments: parsed.data.installments,
        interest_rate: parsed.data.interestRate,
        adjustment_rate: parsed.data.adjustmentRate,
        description: parsed.data.description ?? undefined,
      }),
    });

    return success(mapPaymentMode(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      return failure('Ja existe um modo de pagamento com esse nome.', 'CONFLICT');
    }
    const message =
      error instanceof Error ? error.message : 'Erro ao cadastrar modo de pagamento.';
    return failure(message);
  }
}

export async function updatePaymentMode(
  input: UpdatePaymentModeInput,
): Promise<ActionResponse<PaymentMode>> {
  const parsed = updatePaymentModeSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      parsed.error.errors[0]?.message ?? 'Dados invalidos.',
      'VALIDATION_ERROR',
    );
  }

  try {
    const response = await fetchApi<ApiPaymentMode>(`${API_BASE}/${parsed.data.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: parsed.data.name.trim(),
        installments: parsed.data.installments,
        interest_rate: parsed.data.interestRate,
        adjustment_rate: parsed.data.adjustmentRate,
        description: parsed.data.description ?? undefined,
      }),
    });

    return success(mapPaymentMode(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Modo de pagamento nao encontrado.', 'NOT_FOUND');
    }
    const message =
      error instanceof Error ? error.message : 'Erro ao atualizar modo de pagamento.';
    return failure(message);
  }
}

export async function deletePaymentMode(
  input: DeletePaymentModeInput,
): Promise<ActionResponse<{ id: string }>> {
  const parsed = deletePaymentModeSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      parsed.error.errors[0]?.message ?? 'Registro invalido.',
      'VALIDATION_ERROR',
    );
  }

  try {
    await fetchApi(`${API_BASE}/${parsed.data.id}`, { method: 'DELETE' });
    return success({ id: parsed.data.id });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Modo de pagamento nao encontrado.', 'NOT_FOUND');
    }
    const message =
      error instanceof Error ? error.message : 'Erro ao remover modo de pagamento.';
    return failure(message);
  }
}
