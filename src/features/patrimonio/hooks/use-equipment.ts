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
  createEquipment,
  deleteEquipment,
  getEquipment,
  updateEquipment,
  type CreateEquipmentInput,
  type UpdateEquipmentInput,
} from '@/features/patrimonio/api/equipment';
import type { Equipment } from '@/features/patrimonio/domain/types/equipment';

type GetEquipmentResult = Awaited<ReturnType<typeof getEquipment>>;
type CreateEquipmentResult = Awaited<ReturnType<typeof createEquipment>>;
type UpdateEquipmentResult = Awaited<ReturnType<typeof updateEquipment>>;
type DeleteEquipmentResult = Awaited<ReturnType<typeof deleteEquipment>>;

function extractEquipment(result: GetEquipmentResult): Equipment[] {
  if (result.success) {
    return result.data.equipment;
  }
  throw new Error(result.error.message);
}

function extractSingleEquipment(
  result: CreateEquipmentResult | UpdateEquipmentResult,
  fallback: string,
): Equipment {
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message || fallback);
}

function ensureDeleted(result: DeleteEquipmentResult, fallback: string): string {
  if (result.success) {
    return result.data.id;
  }
  throw new Error(result.error.message || fallback);
}

export function useEquipmentList(): UseQueryResult<Equipment[], Error> {
  return useQuery<Equipment[], Error>({
    queryKey: ['patrimonio', 'equipment'],
    queryFn: async () => extractEquipment(await getEquipment()),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateEquipment(
  options?: UseMutationOptions<Equipment, Error, CreateEquipmentInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Equipment, Error, CreateEquipmentInput>({
    ...options,
    mutationFn: async (payload) =>
      extractSingleEquipment(
        await createEquipment(payload),
        'Nao foi possivel criar o equipamento.',
      ),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'equipment'] });
      await options?.onSuccess?.(...args);
    },
  });
}

export function useUpdateEquipment(
  options?: UseMutationOptions<Equipment, Error, UpdateEquipmentInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Equipment, Error, UpdateEquipmentInput>({
    ...options,
    mutationFn: async (payload) =>
      extractSingleEquipment(
        await updateEquipment(payload),
        'Nao foi possivel atualizar o equipamento.',
      ),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'equipment'] });
      await options?.onSuccess?.(...args);
    },
  });
}

export function useDeleteEquipment(
  options?: UseMutationOptions<string, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    ...options,
    mutationFn: async (id) =>
      ensureDeleted(await deleteEquipment(id), 'Nao foi possivel remover o equipamento.'),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'equipment'] });
      await options?.onSuccess?.(...args);
    },
  });
}

export function useRefreshEquipment() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'equipment'] });
  }, [queryClient]);
}
