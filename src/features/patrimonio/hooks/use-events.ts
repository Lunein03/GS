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
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  addEquipmentToEvent,
  removeEquipmentFromEvent,
  type CreateEventInput,
  type UpdateEventInput,
} from '@/features/patrimonio/api/events';
import type { Event } from '@/features/patrimonio/domain/types/equipment';

type GetEventsResult = Awaited<ReturnType<typeof getEvents>>;
type CreateEventResult = Awaited<ReturnType<typeof createEvent>>;
type UpdateEventResult = Awaited<ReturnType<typeof updateEvent>>;
type DeleteEventResult = Awaited<ReturnType<typeof deleteEvent>>;

function extractEvents(result: GetEventsResult): Event[] {
  if (result.success) {
    return result.data.events;
  }
  throw new Error(result.error.message);
}

function extractSingleEvent(
  result: CreateEventResult | UpdateEventResult,
  fallback: string,
): Event {
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message || fallback);
}

function ensureDeleted(result: DeleteEventResult, fallback: string): string {
  if (result.success) {
    return result.data.id;
  }
  throw new Error(result.error.message || fallback);
}

export function useEventsList(): UseQueryResult<Event[], Error> {
  return useQuery<Event[], Error>({
    queryKey: ['patrimonio', 'events'],
    queryFn: async () => extractEvents(await getEvents()),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateEvent(
  options?: UseMutationOptions<Event, Error, CreateEventInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, CreateEventInput>({
    ...options,
    mutationFn: async (payload) =>
      extractSingleEvent(await createEvent(payload), 'Nao foi possivel criar o evento.'),
    onSuccess: async (event, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'events'] });
      if (options?.onSuccess) {
        options.onSuccess(event, variables, context, mutation);
      }
    },
  });
}

export function useUpdateEvent(
  options?: UseMutationOptions<Event, Error, UpdateEventInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, UpdateEventInput>({
    ...options,
    mutationFn: async (payload) =>
      extractSingleEvent(await updateEvent(payload), 'Nao foi possivel atualizar o evento.'),
    onSuccess: async (event, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'events'] });
      if (options?.onSuccess) {
        options.onSuccess(event, variables, context, mutation);
      }
    },
  });
}

export function useDeleteEvent(options?: UseMutationOptions<string, Error, string>) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    ...options,
    mutationFn: async (id) =>
      ensureDeleted(await deleteEvent(id), 'Nao foi possivel remover o evento.'),
    onSuccess: async (id, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'events'] });
      if (options?.onSuccess) {
        options.onSuccess(id, variables, context, mutation);
      }
    },
  });
}

export function useAddEquipmentToEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { eventId: string; equipmentId: string; quantity?: number }>({
    mutationFn: async ({ eventId, equipmentId, quantity = 1 }) => {
      const result = await addEquipmentToEvent(eventId, equipmentId, quantity);
      if (!result.success) {
        throw new Error(result.error.message);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'events'] });
    },
  });
}

export function useRemoveEquipmentFromEvent() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { eventId: string; equipmentId: string }>({
    mutationFn: async ({ eventId, equipmentId }) => {
      const result = await removeEquipmentFromEvent(eventId, equipmentId);
      if (!result.success) {
        throw new Error(result.error.message);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'events'] });
    },
  });
}

export function useRefreshEvents() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'events'] });
  }, [queryClient]);
}

export function useUpdateEventStatus(
  options?: UseMutationOptions<Event, Error, { eventId: string; status: 'pending' | 'completed' }>,
) {
  const queryClient = useQueryClient();

  return useMutation<Event, Error, { eventId: string; status: 'pending' | 'completed' }>({
    ...options,
    mutationFn: async ({ eventId, status }) => {
      const { updateEventStatus } = await import('@/features/patrimonio/api/events');
      const result = await updateEventStatus(eventId, status);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['patrimonio', 'events'] });
      await options?.onSuccess?.(...args);
    },
  });
}

