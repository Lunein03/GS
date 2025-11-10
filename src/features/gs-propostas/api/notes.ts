import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { ActionResponse } from '@/shared/lib/types/actions';
import { sanitizeHtml } from '@/shared/lib/utils';
import {
  createNoteSchema,
  deleteNoteSchema,
  getNotesSchema,
  noteSchema,
  updateNoteSchema,
  type CreateNoteInput,
  type DeleteNoteInput,
  type GetNotesInput,
  type Note,
  type UpdateNoteInput,
} from '@/features/gs-propostas/app/app-legacy/cadastro/notas/types';

type ApiNote = {
  id: string;
  name: string;
  description?: string | null;
  inclusion_mode: 'manual' | 'automatic';
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

const API_BASE = '/proposals/notes';

const success = <T>(data: T): ActionResponse<T> => ({
  success: true,
  data,
});

const failure = <T>(
  message: string,
  code: 'UNEXPECTED_ERROR' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'CONFLICT' | 'UNAUTHORIZED' = 'UNEXPECTED_ERROR',
): ActionResponse<T> => ({
  success: false,
  error: { code, message },
});

const mapNote = (input: ApiNote): Note =>
  noteSchema.parse({
    id: input.id,
    name: input.name,
    description: input.description ?? undefined,
    inclusionMode: input.inclusion_mode,
    createdAt: input.created_at,
    updatedAt: input.updated_at,
    deletedAt: input.deleted_at ?? null,
  });

export async function getNotes(
  input: GetNotesInput,
): Promise<ActionResponse<{ notes: Note[] }>> {
  const parsed = getNotesSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      parsed.error.errors[0]?.message ?? 'Filtro invalido.',
      'VALIDATION_ERROR',
    );
  }

  try {
    const response = await fetchApi<ApiNote[]>(API_BASE);

    const filtered = parsed.data.search
      ? response.filter((note) =>
          note.name.toLowerCase().includes(parsed.data.search!.toLowerCase()),
        )
      : response;

    return success({ notes: filtered.map(mapNote) });
  } catch (error) {
    const message = error instanceof HttpError ? error.message : 'Erro ao listar notas.';
    return failure(message);
  }
}

export async function createNote(
  input: CreateNoteInput,
): Promise<ActionResponse<Note>> {
  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      parsed.error.errors[0]?.message ?? 'Dados invalidos.',
      'VALIDATION_ERROR',
    );
  }

  try {
    const description = sanitizeHtml(parsed.data.description ?? '') || undefined;
    const response = await fetchApi<ApiNote>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        name: parsed.data.name.trim(),
        description,
        inclusion_mode: parsed.data.inclusionMode,
      }),
    });

    return success(mapNote(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      return failure('Ja existe uma nota com esse nome.', 'CONFLICT');
    }
    const message = error instanceof Error ? error.message : 'Erro ao cadastrar nota.';
    return failure(message);
  }
}

export async function updateNote(
  input: UpdateNoteInput,
): Promise<ActionResponse<Note>> {
  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      parsed.error.errors[0]?.message ?? 'Dados invalidos.',
      'VALIDATION_ERROR',
    );
  }

  try {
    const description = sanitizeHtml(parsed.data.description ?? '') || undefined;
    const response = await fetchApi<ApiNote>(`${API_BASE}/${parsed.data.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: parsed.data.name.trim(),
        description,
        inclusion_mode: parsed.data.inclusionMode,
      }),
    });

    return success(mapNote(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Nota nao encontrada.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao atualizar nota.';
    return failure(message);
  }
}

export async function deleteNote(
  input: DeleteNoteInput,
): Promise<ActionResponse<{ id: string }>> {
  const parsed = deleteNoteSchema.safeParse(input);
  if (!parsed.success) {
    return failure(
      parsed.error.errors[0]?.message ?? 'Nota invalida.',
      'VALIDATION_ERROR',
    );
  }

  try {
    await fetchApi(`${API_BASE}/${parsed.data.id}`, { method: 'DELETE' });
    return success({ id: parsed.data.id });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Nota nao encontrada.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao remover nota.';
    return failure(message);
  }
}
