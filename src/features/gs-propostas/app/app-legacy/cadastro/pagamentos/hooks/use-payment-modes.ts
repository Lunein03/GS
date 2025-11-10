'use client';

import { useCallback } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  createPaymentMode,
  deletePaymentMode,
  getPaymentModes,
  updatePaymentMode,
} from '../actions/payment-mode-actions';
import type {
  CreatePaymentModeInput,
  DeletePaymentModeInput,
  GetPaymentModesInput,
  PaymentMode,
  UpdatePaymentModeInput,
} from '../types';

type GetPaymentModesActionResult = Awaited<ReturnType<typeof getPaymentModes>>;
type CreatePaymentModeActionResult = Awaited<ReturnType<typeof createPaymentMode>>;
type UpdatePaymentModeActionResult = Awaited<ReturnType<typeof updatePaymentMode>>;
type DeletePaymentModeActionResult = Awaited<ReturnType<typeof deletePaymentMode>>;

function resolveActionError(actionResult: {
  data?: { success: boolean; error?: { message: string } };
  serverError?: string;
  validationError?: unknown;
}, fallbackMessage: string): never {
  if (actionResult.serverError) {
    throw new Error(actionResult.serverError);
  }

  if (actionResult.data && !actionResult.data.success) {
    const message = actionResult.data.error?.message ?? fallbackMessage;
    throw new Error(message);
  }

  if (actionResult.validationError) {
    throw new Error(fallbackMessage);
  }

  throw new Error(fallbackMessage);
}

function extractPaymentModes(result: GetPaymentModesActionResult): PaymentMode[] {
  if (result.data?.success && result.data.data) {
    return result.data.data.paymentModes;
  }

  resolveActionError(result, 'Nao foi possivel carregar os modos de pagamento.');
}

function extractPaymentMode(
  result: CreatePaymentModeActionResult | UpdatePaymentModeActionResult,
  fallback: string,
): PaymentMode {
  if (result.data?.success && result.data.data) {
    return result.data.data;
  }

  resolveActionError(result, fallback);
}

function ensureDeleted(
  result: DeletePaymentModeActionResult,
  fallback: string,
): string {
  if (result.data?.success && result.data.data) {
    return result.data.data.id;
  }

  resolveActionError(result, fallback);
}

function buildQueryKey(input: GetPaymentModesInput) {
  return ['gs-propostas', 'pagamentos', input.search ?? ''] as const;
}

export function usePaymentModes(input: GetPaymentModesInput): UseQueryResult<PaymentMode[], Error> {
  return useQuery<PaymentMode[], Error>({
    queryKey: buildQueryKey(input),
    queryFn: async () => extractPaymentModes(await getPaymentModes(input)),
    staleTime: 60 * 1000,
  });
}

export function useCreatePaymentMode(
  options?: UseMutationOptions<PaymentMode, Error, CreatePaymentModeInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<PaymentMode, Error, CreatePaymentModeInput>({
    ...options,
    mutationFn: async (payload) => extractPaymentMode(
      await createPaymentMode(payload),
      'Nao foi possivel criar o modo de pagamento.',
    ),
    onSuccess: async (paymentMode, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'pagamentos'] });
      if (options?.onSuccess) {
        options.onSuccess(paymentMode, variables, context, mutation);
      }
    },
  });
}

export function useUpdatePaymentMode(
  options?: UseMutationOptions<PaymentMode, Error, UpdatePaymentModeInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<PaymentMode, Error, UpdatePaymentModeInput>({
    ...options,
    mutationFn: async (payload) => extractPaymentMode(
      await updatePaymentMode(payload),
      'Nao foi possivel atualizar o modo de pagamento.',
    ),
    onSuccess: async (paymentMode, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'pagamentos'] });
      if (options?.onSuccess) {
        options.onSuccess(paymentMode, variables, context, mutation);
      }
    },
  });
}

export function useDeletePaymentMode(
  options?: UseMutationOptions<string, Error, DeletePaymentModeInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, DeletePaymentModeInput>({
    ...options,
    mutationFn: async (payload) => ensureDeleted(
      await deletePaymentMode(payload),
      'Nao foi possivel remover o modo de pagamento.',
    ),
    onSuccess: async (id, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'pagamentos'] });
      if (options?.onSuccess) {
        options.onSuccess(id, variables, context, mutation);
      }
    },
  });
}

export function useRefreshPaymentModes() {
  const queryClient = useQueryClient();

  return useCallback(
    async () => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'pagamentos'] });
    },
    [queryClient],
  );
}
