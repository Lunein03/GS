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
} from '../actions/note-actions';
import type {
  CreateNoteInput,
  DeleteNoteInput,
  GetNotesInput,
  Note,
  UpdateNoteInput,
} from '../types';

type GetNotesActionResult = Awaited<ReturnType<typeof getNotes>>;
type CreateNoteActionResult = Awaited<ReturnType<typeof createNote>>;
type UpdateNoteActionResult = Awaited<ReturnType<typeof updateNote>>;
type DeleteNoteActionResult = Awaited<ReturnType<typeof deleteNote>>;

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

function extractNotes(result: GetNotesActionResult): Note[] {
  if (result.data?.success && result.data.data) {
    return result.data.data.notes;
  }

  resolveActionError(result, 'Nao foi possivel carregar as notas.');
}

function extractNote(
  result: CreateNoteActionResult | UpdateNoteActionResult,
  fallback: string,
): Note {
  if (result.data?.success && result.data.data) {
    return result.data.data;
  }

  resolveActionError(result, fallback);
}

function ensureDeleted(
  result: DeleteNoteActionResult,
  fallback: string,
): string {
  if (result.data?.success && result.data.data) {
    return result.data.data.id;
  }

  resolveActionError(result, fallback);
}

function buildQueryKey(input: GetNotesInput) {
  return ['gs-propostas', 'notas', input.search ?? ''] as const;
}

export function useNotes(input: GetNotesInput): UseQueryResult<Note[], Error> {
  return useQuery<Note[], Error>({
    queryKey: buildQueryKey(input),
    queryFn: async () => extractNotes(await getNotes(input)),
    staleTime: 60 * 1000,
  });
}

export function useCreateNote(
  options?: UseMutationOptions<Note, Error, CreateNoteInput>,
) {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, CreateNoteInput>({
    ...options,
    mutationFn: async (payload) => extractNote(
      await createNote(payload),
      'Nao foi possivel criar a nota.',
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
    mutationFn: async (payload) => extractNote(
      await updateNote(payload),
      'Nao foi possivel atualizar a nota.',
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
    mutationFn: async (payload) => ensureDeleted(
      await deleteNote(payload),
      'Nao foi possivel remover a nota.',
    ),
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
