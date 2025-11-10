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
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from '@/features/gs-propostas/api/notes';
import type {
  CreateNoteInput,
  DeleteNoteInput,
  GetNotesInput,
  Note,
  UpdateNoteInput,
} from '../types';
import { extractActionArray, extractActionData } from '../../../shared/utils/action-helpers';

function buildQueryKey(input: GetNotesInput) {
  return ['gs-propostas', 'notas', input.search ?? ''] as const;
}

export function useNotes(input: GetNotesInput): UseQueryResult<Note[], Error> {
  return useQuery<Note[], Error>({
    queryKey: buildQueryKey(input),
    queryFn: async () => extractActionArray(await getNotes(input), 'notes', 'Não foi possível carregar as notas.'),
    staleTime: 60 * 1000,
  });
}

export function useCreateNote(
  options?: UseMutationOptions<Note, Error, CreateNoteInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, CreateNoteInput>({
    ...options,
    mutationFn: async (payload) => extractActionData(
      await createNote(payload),
      'Não foi possível criar a nota.',
    ),
    onSuccess: async (note, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'notas'] });
      if (options?.onSuccess) {
        options.onSuccess(note, variables, context, mutation);
      }
    },
  });
}

export function useUpdateNote(
  options?: UseMutationOptions<Note, Error, UpdateNoteInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, UpdateNoteInput>({
    ...options,
    mutationFn: async (payload) => extractActionData(
      await updateNote(payload),
      'Não foi possível atualizar a nota.',
    ),
    onSuccess: async (note, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'notas'] });
      if (options?.onSuccess) {
        options.onSuccess(note, variables, context, mutation);
      }
    },
  });
}

export function useDeleteNote(
  options?: UseMutationOptions<string, Error, DeleteNoteInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<string, Error, DeleteNoteInput>({
    ...options,
    mutationFn: async (payload) => {
      const result = await deleteNote(payload);
      return extractActionData(result, 'Não foi possível remover a nota.').id;
    },
    onSuccess: async (id, variables, context, mutation) => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'notas'] });
      if (options?.onSuccess) {
        options.onSuccess(id, variables, context, mutation);
      }
    },
  });
}

export function useRefreshNotes() {
  const queryClient = useQueryClient();

  return useCallback(
    async () => {
      await queryClient.invalidateQueries({ queryKey: ['gs-propostas', 'notas'] });
    },
    [queryClient],
  );
}
