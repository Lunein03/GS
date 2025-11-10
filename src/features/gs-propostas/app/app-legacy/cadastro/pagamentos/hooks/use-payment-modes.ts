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
} from '@/features/gs-propostas/api/payment-modes';
import type {
  CreatePaymentModeInput,
  DeletePaymentModeInput,
  GetPaymentModesInput,
  PaymentMode,
  UpdatePaymentModeInput,
} from '../types';
import { extractActionArray, extractActionData } from '../../../shared/utils/action-helpers';

function buildQueryKey(input: GetPaymentModesInput) {
  return ['gs-propostas', 'pagamentos', input.search ?? ''] as const;
}

export function usePaymentModes(input: GetPaymentModesInput): UseQueryResult<PaymentMode[], Error> {
  return useQuery<PaymentMode[], Error>({
    queryKey: buildQueryKey(input),
    queryFn: async () => extractActionArray(await getPaymentModes(input), 'paymentModes', 'Não foi possível carregar os modos de pagamento.'),
    staleTime: 60 * 1000,
  });
}

export function useCreatePaymentMode(
  options?: UseMutationOptions<PaymentMode, Error, CreatePaymentModeInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<PaymentMode, Error, CreatePaymentModeInput>({
    ...options,
    mutationFn: async (payload) => extractActionData(
      await createPaymentMode(payload),
      'Não foi possível criar o modo de pagamento.',
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
    mutationFn: async (payload) => extractActionData(
      await updatePaymentMode(payload),
      'Não foi possível atualizar o modo de pagamento.',
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
    mutationFn: async (payload) => {
      const result = await deletePaymentMode(payload);
      return extractActionData(result, 'Não foi possível remover o modo de pagamento.').id;
    },
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
