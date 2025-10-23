'use server';

import { actionClient } from '@/app/actions/safe-action';
import { db } from '@/lib/db/client';
import { proposalNotes } from '@/lib/db/schema';
import { and, eq, ilike, isNull, sql } from 'drizzle-orm';
import type { ActionResponse } from '@/types/actions';
import { sanitizeHtml } from '@/lib/utils';
import {
  createNoteSchema,
  deleteNoteSchema,
  getNotesSchema,
  updateNoteSchema,
  type CreateNoteInput,
  type DeleteNoteInput,
  type GetNotesInput,
  type Note,
  type UpdateNoteInput,
} from '../types';

type NoteRecord = typeof proposalNotes.$inferSelect;

type NoteListResult = {
  notes: Note[];
};

function normalizeHtml(content?: string | null): string | undefined {
  if (!content) {
    return undefined;
  }

  const sanitized = sanitizeHtml(content);
  if (!sanitized) {
    return undefined;
  }

  return sanitized;
}

function mapRecord(record: NoteRecord): Note {
  return {
    id: record.id,
    name: record.name,
    description: normalizeHtml(record.description),
    inclusionMode: record.inclusionMode,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt ?? undefined,
  };
}

async function hasDuplicateName(name: string, ignoreId?: string): Promise<boolean> {
  const normalized = name.trim();

  const [existing] = await db
    .select({ id: proposalNotes.id })
    .from(proposalNotes)
    .where(
      and(
        sql`lower(${proposalNotes.name}) = lower(${normalized})`,
        isNull(proposalNotes.deletedAt),
        ignoreId ? sql`${proposalNotes.id} != ${ignoreId}` : sql`true`
      )
    )
    .limit(1);

  return Boolean(existing);
}

function buildUnexpectedError<T = never>(message: string): ActionResponse<T> {
  return {
    success: false,
    error: {
      code: 'UNEXPECTED_ERROR',
      message,
    },
  } as ActionResponse<T>;
}

export const getNotes = actionClient(
  getNotesSchema,
  async (input: GetNotesInput): Promise<ActionResponse<NoteListResult>> => {
    try {
      const conditions = [isNull(proposalNotes.deletedAt)];

      if (input.search) {
        const normalized = `%${input.search.trim()}%`;
        conditions.push(ilike(proposalNotes.name, normalized));
      }

      const results = await db
        .select()
        .from(proposalNotes)
        .where(and(...conditions))
        .orderBy(proposalNotes.name);

      return {
        success: true,
        data: {
          notes: results.map(mapRecord),
        },
      };
    } catch (error) {
      console.error('Erro ao listar notas:', error);
      return buildUnexpectedError('Erro ao listar notas. Tente novamente.');
    }
  }
);

export const createNote = actionClient(
  createNoteSchema,
  async (input: CreateNoteInput): Promise<ActionResponse<Note>> => {
    try {
      if (await hasDuplicateName(input.name)) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Ja existe uma nota com esse nome',
          },
        };
      }

      const [record] = await db
        .insert(proposalNotes)
        .values({
          name: input.name.trim(),
          description: normalizeHtml(input.description) ?? null,
          inclusionMode: input.inclusionMode,
        })
        .returning();

      if (!record) {
        return buildUnexpectedError('Nao foi possivel cadastrar a nota.');
      }

      return {
        success: true,
        data: mapRecord(record),
      };
    } catch (error) {
      console.error('Erro ao cadastrar nota:', error);
      return buildUnexpectedError('Erro ao cadastrar nota. Tente novamente.');
    }
  }
);

export const updateNote = actionClient(
  updateNoteSchema,
  async (input: UpdateNoteInput): Promise<ActionResponse<Note>> => {
    try {
      if (await hasDuplicateName(input.name, input.id)) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Ja existe uma nota com esse nome',
          },
        };
      }

      const [record] = await db
        .update(proposalNotes)
        .set({
          name: input.name.trim(),
          description: normalizeHtml(input.description) ?? null,
          inclusionMode: input.inclusionMode,
          updatedAt: new Date(),
        })
        .where(and(eq(proposalNotes.id, input.id), isNull(proposalNotes.deletedAt)))
        .returning();

      if (!record) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Nota nao encontrada',
          },
        };
      }

      return {
        success: true,
        data: mapRecord(record),
      };
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      return buildUnexpectedError('Erro ao atualizar nota. Tente novamente.');
    }
  }
);

export const deleteNote = actionClient(
  deleteNoteSchema,
  async (input: DeleteNoteInput): Promise<ActionResponse<{ id: string }>> => {
    try {
      const [record] = await db
        .update(proposalNotes)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(proposalNotes.id, input.id), isNull(proposalNotes.deletedAt)))
        .returning({ id: proposalNotes.id });

      if (!record) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Nota nao encontrada',
          },
        };
      }

      return {
        success: true,
        data: { id: record.id },
      };
    } catch (error) {
      console.error('Erro ao remover nota:', error);
      return buildUnexpectedError('Erro ao remover nota. Tente novamente.');
    }
  }
);
