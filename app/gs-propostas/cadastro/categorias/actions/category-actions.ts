'use server';

import { actionClient } from '@/app/actions/safe-action';
import { db } from '@/lib/db/client';
import { categories } from '@/lib/db/schema';
import { and, eq, ilike, isNull, sql } from 'drizzle-orm';
import type { ActionResponse } from '@/types/actions';
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
  type Category,
  type CreateCategoryInput,
  type DeleteCategoryInput,
  type GetCategoriesInput,
  type UpdateCategoryInput,
} from '../types';

type CategoryRecord = typeof categories.$inferSelect;

type CategoryListResult = {
  categories: Category[];
};

function normalizeDescription(description?: string | null): string | undefined {
  if (!description) {
    return undefined;
  }

  const trimmed = description.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  return trimmed;
}

function mapCategory(record: CategoryRecord): Category {
  return {
    id: record.id,
    name: record.name,
    color: record.color.toUpperCase(),
    description: normalizeDescription(record.optionalField),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt ?? undefined,
  };
}

async function hasDuplicateName(name: string, ignoreId?: string): Promise<boolean> {
  const normalizedName = name.trim();

  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(
        sql`lower(${categories.name}) = lower(${normalizedName})`,
        isNull(categories.deletedAt),
        ignoreId ? sql`${categories.id} != ${ignoreId}` : sql`true`
      )
    )
    .limit(1);

  return Boolean(existing);
}

function buildActionError<TData = never>(message: string): ActionResponse<TData> {
  return {
    success: false,
    error: {
      code: 'UNEXPECTED_ERROR',
      message,
    },
  } as ActionResponse<TData>;
}

export const getCategories = actionClient(
  getCategoriesSchema,
  async (input: GetCategoriesInput): Promise<ActionResponse<CategoryListResult>> => {
    try {
      const conditions = [isNull(categories.deletedAt)];

      if (input.search) {
        const normalized = `%${input.search.trim()}%`;
        conditions.push(ilike(categories.name, normalized));
      }

      const results = await db
        .select()
        .from(categories)
        .where(and(...conditions))
        .orderBy(categories.name);

      return {
        success: true,
        data: {
          categories: results.map(mapCategory),
        },
      };
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      return buildActionError('Erro ao listar categorias. Tente novamente.');
    }
  }
);

export const createCategory = actionClient(
  createCategorySchema,
  async (input: CreateCategoryInput): Promise<ActionResponse<Category>> => {
    try {
      if (await hasDuplicateName(input.name)) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Ja existe uma categoria com esse nome',
          },
        };
      }

      const [record] = await db
        .insert(categories)
        .values({
          name: input.name.trim(),
          color: input.color.toUpperCase(),
          optionalField: normalizeDescription(input.description) ?? null,
        })
        .returning();

      if (!record) {
        return buildActionError('Nao foi possivel cadastrar a categoria.');
      }

      return {
        success: true,
        data: mapCategory(record),
      };
    } catch (error) {
      console.error('Erro ao cadastrar categoria:', error);
      return buildActionError('Erro ao cadastrar categoria. Tente novamente.');
    }
  }
);

export const updateCategory = actionClient(
  updateCategorySchema,
  async (input: UpdateCategoryInput): Promise<ActionResponse<Category>> => {
    try {
      if (await hasDuplicateName(input.name, input.id)) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Ja existe uma categoria com esse nome',
          },
        };
      }

      const [record] = await db
        .update(categories)
        .set({
          name: input.name.trim(),
          color: input.color.toUpperCase(),
          optionalField: normalizeDescription(input.description) ?? null,
          updatedAt: new Date(),
        })
        .where(and(eq(categories.id, input.id), isNull(categories.deletedAt)))
        .returning();

      if (!record) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Categoria nao encontrada',
          },
        };
      }

      return {
        success: true,
        data: mapCategory(record),
      };
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return buildActionError('Erro ao atualizar categoria. Tente novamente.');
    }
  }
);

export const deleteCategory = actionClient(
  deleteCategorySchema,
  async (input: DeleteCategoryInput): Promise<ActionResponse<{ id: string }>> => {
    try {
      const [record] = await db
        .update(categories)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(categories.id, input.id), isNull(categories.deletedAt)))
        .returning({ id: categories.id });

      if (!record) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Categoria nao encontrada',
          },
        };
      }

      return {
        success: true,
        data: { id: record.id },
      };
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      return buildActionError('Erro ao remover categoria. Tente novamente.');
    }
  }
);
