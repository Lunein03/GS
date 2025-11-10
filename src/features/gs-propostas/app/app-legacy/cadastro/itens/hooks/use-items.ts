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
  createItem,
  deleteItem,
  getItems,
  updateItem,
} from '@/features/gs-propostas/api/items';
import type {
  Item,
  ItemFormData,
  GetItemsInput,
  ItemListResult,
} from '../types/item.types';
import type { ActionResponse } from '@/shared/lib/types/actions';

const QUERY_KEY_BASE = ['gs-propostas', 'itens'] as const;

const buildQueryKey = (input: GetItemsInput) => [
  ...QUERY_KEY_BASE,
  input.search ?? '',
  (input.categoryIds ?? []).join(','),
  input.page ?? 1,
  input.pageSize ?? 20,
  input.includeInactive ?? false,
] as const;

const handleResponse = <T>(
  response: ActionResponse<T>,
  fallbackMessage: string,
): T => {
  if (response.success) {
    return response.data;
  }

  const trimmed = response.error.message.trim();
  const message = trimmed.length > 0 ? trimmed : fallbackMessage;
  throw new Error(message);
};

export const useItems = (
  input: GetItemsInput,
): UseQueryResult<ItemListResult, Error> =>
  useQuery<ItemListResult, Error>({
    queryKey: buildQueryKey(input),
    queryFn: async () => {
      const response = await getItems(input);
      return handleResponse(response, 'Nao foi possivel carregar os itens.');
    },
    staleTime: 60 * 1000,
  });

export const useCreateItem = (
  options?: UseMutationOptions<Item, Error, ItemFormData>,
) => {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, ItemFormData>({
    ...options,
    mutationFn: async (payload) => {
      const response = await createItem(payload);
      return handleResponse(response, 'Nao foi possivel criar o item.');
    },
    onSuccess: async (item, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY_BASE });
      options?.onSuccess?.(item, variables, context, mutation);
    },
  });
};

export const useUpdateItem = (
  options?: UseMutationOptions<Item, Error, { id: string; data: ItemFormData }>,
) => {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, { id: string; data: ItemFormData }>({
    ...options,
    mutationFn: async ({ id, data }) => {
      const response = await updateItem(id, data);
      return handleResponse(response, 'Nao foi possivel atualizar o item.');
    },
    onSuccess: async (item, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY_BASE });
      options?.onSuccess?.(item, variables, context, mutation);
    },
  });
};

export const useDeleteItem = (
  options?: UseMutationOptions<string, Error, string>,
) => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    ...options,
    mutationFn: async (id) => {
      const response = await deleteItem(id);
      const result = handleResponse(response, 'Nao foi possivel remover o item.');
      return result.id;
    },
    onSuccess: async (id, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY_BASE });
      options?.onSuccess?.(id, variables, context, mutation);
    },
  });
};

export const useRefreshItems = () => {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY_BASE });
  }, [queryClient]);
};
