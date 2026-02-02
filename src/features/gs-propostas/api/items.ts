import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { ActionResponse, AppErrorCode } from '@/shared/lib/types/actions';
import {
  itemFormSchema,
  getItemsSchema,
  type Item,
  type ItemFormData,
  type GetItemsInput,
  type ItemListResult,
} from '@/features/gs-propostas/app/app-legacy/cadastro/itens/types/item.types';

type ApiItem = {
  id: string;
  type: string;
  category_id: string | null;
  name: string;
  unit: string;
  default_price: string | number;
  sku?: string | null;
  pn?: string | null;
  description?: string | null;
  features?: string | null;
  images?: string[] | null;
  active: number;
  created_at: string;
  updated_at: string;
};

const API_BASE = '/catalog/items';

const success = <T>(data: T): ActionResponse<T> => ({ success: true, data });

const failure = <T>(
  message: string,
  code: AppErrorCode = 'UNEXPECTED_ERROR',
): ActionResponse<T> => ({
  success: false,
  error: { code, message },
});

const toItem = (input: ApiItem): Item => ({
  id: input.id,
  type: input.type as Item['type'],
  categoryId: input.category_id ?? '',
  name: input.name,
  unit: input.unit as Item['unit'],
  defaultPrice: Number(input.default_price),
  sku: input.sku ?? undefined,
  pn: input.pn ?? undefined,
  description: input.description ?? undefined,
  features: input.features ?? undefined,
  images: input.images ?? [],
  active: input.active === 1,
  createdAt: new Date(input.created_at),
  updatedAt: new Date(input.updated_at),
});

const buildItemPayload = (data: ItemFormData) => ({
  type: data.type,
  name: data.name,
  description: data.description ?? undefined,
  default_price: data.defaultPrice,
  unit: data.unit,
  sku: data.sku ?? undefined,
  pn: data.pn ?? undefined,
  features: data.features ?? undefined,
  images: data.images ?? [],
  category_id: data.categoryId,
  active: true,
});

const applyFilters = (items: Item[], filters: GetItemsInput | undefined) => {
  if (!filters) {
    return items;
  }

  let filtered = items;

  if (filters.search) {
    const needle = filters.search.toLowerCase();
    filtered = filtered.filter((item) =>
      item.name.toLowerCase().includes(needle) ||
      item.description?.toLowerCase().includes(needle),
    );
  }

  if (filters.categoryIds?.length) {
    const categorySet = new Set(filters.categoryIds);
    filtered = filtered.filter((item) => categorySet.has(item.categoryId));
  }

  if (!filters.includeInactive) {
    filtered = filtered.filter((item) => item.active);
  }

  return filtered;
};

const applyPagination = (
  items: Item[],
  page: number | undefined,
  pageSize: number | undefined,
) => {
  const resolvedPageSize = pageSize && pageSize > 0 ? pageSize : 20;
  const resolvedPage = page && page > 0 ? page : 1;

  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / resolvedPageSize);
  const start = (resolvedPage - 1) * resolvedPageSize;
  const paginated = items.slice(start, start + resolvedPageSize);

  return {
    items: paginated,
    pagination: {
      page: resolvedPage,
      pageSize: resolvedPageSize,
      total,
      totalPages,
    },
  };
};

export async function getItems(
  input: GetItemsInput,
): Promise<ActionResponse<ItemListResult>> {
  const parsed = getItemsSchema.safeParse(input ?? {});
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Filtro invalido.';
    return failure(message, 'VALIDATION_ERROR');
  }

  try {
    const params = new URLSearchParams();
    if (parsed.data.includeInactive) {
      params.set('include_inactive', 'true');
    }

    const query = params.toString();
    const endpoint = query ? `${API_BASE}?${query}` : API_BASE;
    const response = await fetchApi<ApiItem[]>(endpoint);
    const items = response.map(toItem);
    const filtered = applyFilters(items, parsed.data);
    const result = applyPagination(filtered, parsed.data.page, parsed.data.pageSize);
    return success(result);
  } catch (error) {
    const message = error instanceof HttpError ? error.message : 'Erro ao listar itens.';
    return failure(message);
  }
}

export async function createItem(
  data: ItemFormData,
): Promise<ActionResponse<Item>> {
  const parsed = itemFormSchema.safeParse(data);
  if (!parsed.success) {
    return failure(parsed.error.errors[0]?.message ?? 'Dados invalidos.', 'VALIDATION_ERROR');
  }

  try {
    const response = await fetchApi<ApiItem>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(buildItemPayload(parsed.data)),
    });
    return success(toItem(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      return failure('Ja existe um item com esses dados.', 'CONFLICT');
    }
    const message = error instanceof Error ? error.message : 'Erro ao criar item.';
    return failure(message);
  }
}

export async function updateItem(
  id: string,
  data: ItemFormData,
): Promise<ActionResponse<Item>> {
  const parsed = itemFormSchema.safeParse(data);
  if (!parsed.success) {
    return failure(parsed.error.errors[0]?.message ?? 'Dados invalidos.', 'VALIDATION_ERROR');
  }

  try {
    const response = await fetchApi<ApiItem>(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(buildItemPayload(parsed.data)),
    });
    return success(toItem(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Item nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao atualizar item.';
    return failure(message);
  }
}

export async function deleteItem(
  id: string,
): Promise<ActionResponse<{ id: string }>> {
  try {
    await fetchApi(`${API_BASE}/${id}`, { method: 'DELETE' });
    return success({ id });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Item nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao remover item.';
    return failure(message);
  }
}
