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
  completeGovbrValidation,
  createSignature,
  deleteSignature,
  getSignatures,
  requestGovbrValidation,
  updateSignature,
} from '@/features/gs-propostas/api/signatures';
import type {
  CompleteGovbrValidationInput,
  CreateSignatureInput,
  DeleteSignatureInput,
  GetSignaturesInput,
  RequestGovbrValidationInput,
  Signature,
  UpdateSignatureInput,
} from '../types';

type GetSignaturesActionResult = Awaited<ReturnType<typeof getSignatures>>;
type CreateSignatureActionResult = Awaited<ReturnType<typeof createSignature>>;
type UpdateSignatureActionResult = Awaited<ReturnType<typeof updateSignature>>;
type DeleteSignatureActionResult = Awaited<ReturnType<typeof deleteSignature>>;
type RequestGovbrValidationActionResult = Awaited<ReturnType<typeof requestGovbrValidation>>;
type CompleteGovbrValidationActionResult = Awaited<ReturnType<typeof completeGovbrValidation>>;

function resolveActionError(
  actionResult: {
    data?: { success: boolean; error?: { message: string } };
    serverError?: string;
    validationError?: unknown;
  },
  fallbackMessage: string,
): never {
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

function extractSignatures(result: GetSignaturesActionResult): Signature[] {
  if (result.data?.success && result.data.data) {
    return result.data.data.signatures;
  }

  resolveActionError(result, 'Nao foi possivel carregar as assinaturas.');
}

function extractSignature(
  result: CreateSignatureActionResult | UpdateSignatureActionResult | RequestGovbrValidationActionResult | CompleteGovbrValidationActionResult,
  fallback: string,
): Signature {
  if (result.data?.success && result.data.data) {
    return result.data.data;
  }

  resolveActionError(result, fallback);
}

function extractDeleted(result: DeleteSignatureActionResult, fallback: string): string {
  if (result.data?.success && result.data.data) {
    return result.data.data.id;
  }

  resolveActionError(result, fallback);
}

function buildQueryKey(input: GetSignaturesInput) {
  return ['gs-propostas', 'assinaturas', input.search ?? ''] as const;
}

async function invalidateSignatures(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'assinaturas'] });
}

export function useSignatures(input: GetSignaturesInput): UseQueryResult<Signature[], Error> {
  return useQuery<Signature[], Error>({
    queryKey: buildQueryKey(input),
    queryFn: async () => extractSignatures(await getSignatures(input)),
    staleTime: 60 * 1000,
  });
}

export function useCreateSignature(
  options?: UseMutationOptions<Signature, Error, CreateSignatureInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Signature, Error, CreateSignatureInput>({
    ...options,
    mutationFn: async (payload) =>
      extractSignature(await createSignature(payload), 'Nao foi possivel criar a assinatura.'),
    onSuccess: async (signature, variables, context, mutation) => {
      await invalidateSignatures(queryClient);
      options?.onSuccess?.(signature, variables, context, mutation);
    },
  });
}

export function useUpdateSignature(
  options?: UseMutationOptions<Signature, Error, UpdateSignatureInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Signature, Error, UpdateSignatureInput>({
    ...options,
    mutationFn: async (payload) =>
      extractSignature(await updateSignature(payload), 'Nao foi possivel atualizar a assinatura.'),
    onSuccess: async (signature, variables, context, mutation) => {
      await invalidateSignatures(queryClient);
      options?.onSuccess?.(signature, variables, context, mutation);
    },
  });
}

export function useDeleteSignature(
  options?: UseMutationOptions<string, Error, DeleteSignatureInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, DeleteSignatureInput>({
    ...options,
    mutationFn: async (payload) =>
      extractDeleted(await deleteSignature(payload), 'Nao foi possivel remover a assinatura.'),
    onSuccess: async (id, variables, context, mutation) => {
      await invalidateSignatures(queryClient);
      options?.onSuccess?.(id, variables, context, mutation);
    },
  });
}

export function useRequestGovbrValidation(
  options?: UseMutationOptions<Signature, Error, RequestGovbrValidationInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Signature, Error, RequestGovbrValidationInput>({
    ...options,
    mutationFn: async (payload) =>
      extractSignature(await requestGovbrValidation(payload), 'Nao foi possivel solicitar validacao.'),
    onSuccess: async (signature, variables, context, mutation) => {
      await invalidateSignatures(queryClient);
      options?.onSuccess?.(signature, variables, context, mutation);
    },
  });
}

export function useCompleteGovbrValidation(
  options?: UseMutationOptions<Signature, Error, CompleteGovbrValidationInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Signature, Error, CompleteGovbrValidationInput>({
    ...options,
    mutationFn: async (payload) =>
      extractSignature(await completeGovbrValidation(payload), 'Nao foi possivel concluir a validacao.'),
    onSuccess: async (signature, variables, context, mutation) => {
      await invalidateSignatures(queryClient);
      options?.onSuccess?.(signature, variables, context, mutation);
    },
  });
}

export function useRefreshSignatures() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await invalidateSignatures(queryClient);
  }, [queryClient]);
}
