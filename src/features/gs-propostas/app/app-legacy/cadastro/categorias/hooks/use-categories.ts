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
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/features/gs-propostas/api/categories';
import type { ActionResponse } from '@/shared/lib/types/actions';
import type {
  Category,
  CreateCategoryInput,
  DeleteCategoryInput,
  GetCategoriesInput,
  UpdateCategoryInput,
} from '../types';

function buildQueryKey(input: GetCategoriesInput) {
  return ['gs-propostas', 'categorias', input.search ?? ''] as const;
}

const handleResponse = <T>(response: ActionResponse<T>, fallbackMessage: string): T => {
  if (response.success) {
    return response.data;
  }

  const trimmed = response.error.message.trim();
  const message = trimmed.length > 0 ? trimmed : fallbackMessage;
  throw new Error(message);
};

export function useCategories(
  input: GetCategoriesInput,
): UseQueryResult<Category[], Error> {
  return useQuery<Category[], Error>({
    queryKey: buildQueryKey(input),
    queryFn: async () => {
      const response = await getCategories(input);
      const data = handleResponse(response, 'Nao foi possivel carregar as categorias.');
      return data.categories;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateCategory(
  options?: UseMutationOptions<Category, Error, CreateCategoryInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryInput>({
    ...options,
    mutationFn: async (payload) => {
      const response = await createCategory(payload);
      return handleResponse(response, 'Nao foi possivel criar a categoria.');
    },
    onSuccess: async (category, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'categorias'] });
      if (options?.onSuccess) {
        options.onSuccess(category, variables, context, mutation);
      }
    },
  });
}

export function useUpdateCategory(
  options?: UseMutationOptions<Category, Error, UpdateCategoryInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, UpdateCategoryInput>({
    ...options,
    mutationFn: async (payload) => {
      const response = await updateCategory(payload);
      return handleResponse(response, 'Nao foi possivel atualizar a categoria.');
    },
    onSuccess: async (category, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'categorias'] });
      if (options?.onSuccess) {
        options.onSuccess(category, variables, context, mutation);
      }
    },
  });
}

export function useDeleteCategory(
  options?: UseMutationOptions<string, Error, DeleteCategoryInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, DeleteCategoryInput>({
    ...options,
    mutationFn: async (payload) => {
      const response = await deleteCategory(payload);
      const result = handleResponse(response, 'Nao foi possivel remover a categoria.');
      return result.id;
    },
    onSuccess: async (id, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'categorias'] });
      if (options?.onSuccess) {
        options.onSuccess(id, variables, context, mutation);
      }
    },
  });
}

export function useRefreshCategories() {
  const queryClient = useQueryClient();

  return useCallback(
    async () => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'categorias'] });
    },
    [queryClient],
  );
}
