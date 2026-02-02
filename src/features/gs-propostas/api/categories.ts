import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { ActionResponse, AppErrorCode } from '@/shared/lib/types/actions';
import {
  categorySchema,
  createCategorySchema,
  deleteCategorySchema,
  getCategoriesSchema,
  updateCategorySchema,
  type Category,
  type CreateCategoryInput,
  type DeleteCategoryInput,
  type GetCategoriesInput,
  type UpdateCategoryInput,
} from '@/features/gs-propostas/app/app-legacy/cadastro/categorias/types';

type ApiCategory = {
  id: string;
  name: string;
  color: string;
  optional_field?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

const API_BASE = '/catalog/categories';

const success = <T>(data: T): ActionResponse<T> => ({
  success: true,
  data,
});

const failure = <T>(
  code: AppErrorCode,
  message: string,
): ActionResponse<T> => ({
  success: false,
  error: { code, message },
});

const mapCategory = (input: ApiCategory): Category =>
  categorySchema.parse({
    id: input.id,
    name: input.name,
    color: input.color,
    description: input.optional_field ?? '',
    createdAt: input.created_at,
    updatedAt: input.updated_at,
    deletedAt: input.deleted_at ?? null,
  });

export async function getCategories(
  input: GetCategoriesInput,
): Promise<ActionResponse<{ categories: Category[] }>> {
  const parsed = getCategoriesSchema.safeParse(input);
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', parsed.error.errors[0]?.message ?? 'Filtro invalido.');
  }

  try {
    const params = new URLSearchParams();
    if (parsed.data.search) {
      params.set('search', parsed.data.search);
    }

    const queryString = params.toString();
    const endpoint = queryString ? `${API_BASE}?${queryString}` : API_BASE;
    const response = await fetchApi<ApiCategory[]>(endpoint);
    return success({ categories: response.map(mapCategory) });
  } catch (error) {
    const message = error instanceof HttpError ? error.message : 'Erro ao listar categorias.';
    return failure('UNEXPECTED_ERROR', message);
  }
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<ActionResponse<Category>> {
  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', parsed.error.errors[0]?.message ?? 'Dados invalidos.');
  }

  try {
    const response = await fetchApi<ApiCategory>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        name: parsed.data.name,
        color: parsed.data.color,
        optional_field: parsed.data.description ?? undefined,
      }),
    });

    return success(mapCategory(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      return failure('CONFLICT', 'Ja existe uma categoria com esse nome.');
    }

    const message = error instanceof Error ? error.message : 'Erro ao criar categoria.';
    return failure('UNEXPECTED_ERROR', message);
  }
}

export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<ActionResponse<Category>> {
  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', parsed.error.errors[0]?.message ?? 'Dados invalidos.');
  }

  try {
    const response = await fetchApi<ApiCategory>(`${API_BASE}/${parsed.data.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: parsed.data.name,
        color: parsed.data.color,
        optional_field: parsed.data.description ?? undefined,
      }),
    });

    return success(mapCategory(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('NOT_FOUND', 'Categoria nao encontrada.');
    }

    const message = error instanceof Error ? error.message : 'Erro ao atualizar categoria.';
    return failure('UNEXPECTED_ERROR', message);
  }
}

export async function deleteCategory(
  input: DeleteCategoryInput,
): Promise<ActionResponse<{ id: string }>> {
  const parsed = deleteCategorySchema.safeParse(input);
  if (!parsed.success) {
    return failure('VALIDATION_ERROR', parsed.error.errors[0]?.message ?? 'Categoria invalida.');
  }

  try {
    await fetchApi(`${API_BASE}/${parsed.data.id}`, { method: 'DELETE' });
    return success({ id: parsed.data.id });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('NOT_FOUND', 'Categoria nao encontrada.');
    }

    const message = error instanceof Error ? error.message : 'Erro ao remover categoria.';
    return failure('UNEXPECTED_ERROR', message);
  }
}
