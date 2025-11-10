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
} from '../actions/category-actions';
import type {
  Category,
  CreateCategoryInput,
  DeleteCategoryInput,
  GetCategoriesInput,
  UpdateCategoryInput,
} from '../types';

type GetCategoriesActionResult = Awaited<ReturnType<typeof getCategories>>;
type CreateCategoryActionResult = Awaited<ReturnType<typeof createCategory>>;
type UpdateCategoryActionResult = Awaited<ReturnType<typeof updateCategory>>;
type DeleteCategoryActionResult = Awaited<ReturnType<typeof deleteCategory>>;

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

function extractCategories(result: GetCategoriesActionResult): Category[] {
  if (result.data?.success && result.data.data) {
    return result.data.data.categories;
  }

  resolveActionError(result, 'Nao foi possivel carregar as categorias.');
}

function extractCategory(
  result: CreateCategoryActionResult | UpdateCategoryActionResult,
  fallback: string,
): Category {
  if (result.data?.success && result.data.data) {
    return result.data.data;
  }

  resolveActionError(result, fallback);
}

function ensureDeleted(
  result: DeleteCategoryActionResult,
  fallback: string,
): string {
  if (result.data?.success && result.data.data) {
    return result.data.data.id;
  }

  resolveActionError(result, fallback);
}

function buildQueryKey(input: GetCategoriesInput) {
  return ['gs-propostas', 'categorias', input.search ?? ''] as const;
}

export function useCategories(
  input: GetCategoriesInput,
): UseQueryResult<Category[], Error> {
  return useQuery<Category[], Error>({
    queryKey: buildQueryKey(input),
    queryFn: async () => extractCategories(await getCategories(input)),
    staleTime: 60 * 1000,
  });
}

export function useCreateCategory(
  options?: UseMutationOptions<Category, Error, CreateCategoryInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryInput>({
    ...options,
    mutationFn: async (payload) => extractCategory(
      await createCategory(payload),
      'Nao foi possivel criar a categoria.',
    ),
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
    mutationFn: async (payload) => extractCategory(
      await updateCategory(payload),
      'Nao foi possivel atualizar a categoria.',
    ),
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
    mutationFn: async (payload) => ensureDeleted(
      await deleteCategory(payload),
      'Nao foi possivel remover a categoria.',
    ),
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
