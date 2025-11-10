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
  createCompany,
  deleteCompany,
  getCompanies,
  updateCompany,
} from '@/features/gs-propostas/api/companies';
import type {
  Company,
  CreateCompanyInput,
  DeleteCompanyInput,
  GetCompaniesInput,
  UpdateCompanyInput,
} from '../types';
import type { ActionResponse } from '@/shared/lib/types/actions';

const QUERY_KEY_BASE = ['gs-propostas', 'empresas'] as const;

const buildQueryKey = (input: GetCompaniesInput) => [
  ...QUERY_KEY_BASE,
  input.search ?? '',
] as const;

const resolveErrorMessage = (message: string | undefined, fallbackMessage: string) => {
  if (!message) {
    return fallbackMessage;
  }

  const trimmed = message.trim();
  return trimmed.length > 0 ? trimmed : fallbackMessage;
};

const assertSuccess = <T>(response: ActionResponse<T>, fallbackMessage: string): T => {
  if (response.success) {
    return response.data;
  }

  throw new Error(resolveErrorMessage(response.error.message, fallbackMessage));
};

export const useCompanies = (input: GetCompaniesInput): UseQueryResult<Company[], Error> =>
  useQuery<Company[], Error>({
    queryKey: buildQueryKey(input),
    queryFn: async () => {
      const response = await getCompanies(input);
      const data = assertSuccess(response, 'Não foi possível carregar as empresas.');
      return data.companies;
    },
    staleTime: 60 * 1000,
  });

export const useCreateCompany = (
  options?: UseMutationOptions<Company, Error, CreateCompanyInput>,
) => {
  const queryClient = useQueryClient();

  return useMutation<Company, Error, CreateCompanyInput>({
    ...options,
    mutationFn: async (payload) => {
      const response = await createCompany(payload);
      return assertSuccess(response, 'Não foi possível cadastrar a empresa.');
    },
    onSuccess: async (company, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY_BASE });
      if (options?.onSuccess) {
        options.onSuccess(company, variables, context, mutation);
      }
    },
  });
};

export const useUpdateCompany = (
  options?: UseMutationOptions<Company, Error, UpdateCompanyInput>,
) => {
  const queryClient = useQueryClient();

  return useMutation<Company, Error, UpdateCompanyInput>({
    ...options,
    mutationFn: async (payload) => {
      const response = await updateCompany(payload);
      return assertSuccess(response, 'Não foi possível atualizar a empresa.');
    },
    onSuccess: async (company, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY_BASE });
      if (options?.onSuccess) {
        options.onSuccess(company, variables, context, mutation);
      }
    },
  });
};

export const useDeleteCompany = (
  options?: UseMutationOptions<string, Error, DeleteCompanyInput>,
) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, DeleteCompanyInput>({
    ...options,
    mutationFn: async (payload) => {
      const response = await deleteCompany(payload);
      const result = assertSuccess(response, 'Não foi possível remover a empresa.');
      return result.id;
    },
    onSuccess: async (id, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY_BASE });
      if (options?.onSuccess) {
        options.onSuccess(id, variables, context, mutation);
      }
    },
  });
};

export const useRefreshCompanies = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY_BASE });
  }, [queryClient]);
};
