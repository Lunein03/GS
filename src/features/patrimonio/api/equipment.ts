import {
  coerceCents,
  extractAcquisitionCentsFromNotes,
  parseBRLToCents,
} from '@/shared/lib/currency';
import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { ActionResponse } from '@/shared/lib/types/actions';
import type { Equipment } from '@/features/patrimonio/domain/types/equipment';

type ApiEquipment = {
  id: string;
  code: string;
  name: string;
  category: string;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  acquisition_date: string;
  status: 'available' | 'in-use' | 'maintenance' | 'retired';
  location?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  // Campos antigos (compat):
  valor_aquisicao_cents?: number | null;
  // Campos atuais do backend:
  quantity?: number | null;
  unit_value_cents?: number | null;
};

export type CreateEquipmentInput = {
  code: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  acquisitionDate: string;
  status?: 'available' | 'in-use' | 'maintenance' | 'retired';
  location?: string;
  notes?: string;
  // Preferir unitValueCents; manter acquisitionValueCents por compatibilidade
  unitValueCents?: number;
  acquisitionValueCents?: number;
  quantity?: number;
};

export type UpdateEquipmentInput = {
  id: string;
  name?: string;
  category?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  acquisitionDate?: string;
  status?: 'available' | 'in-use' | 'maintenance' | 'retired';
  location?: string;
  notes?: string;
  unitValueCents?: number;
  acquisitionValueCents?: number;
  quantity?: number;
};

const API_BASE = '/inventory/equipment';

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

const mapEquipment = (input: ApiEquipment): Equipment => {
  const centsFromNewField = coerceCents(input.unit_value_cents);
  const centsFromLegacyField = coerceCents(input.valor_aquisicao_cents);
  const centsFromNotes =
    centsFromNewField === undefined && centsFromLegacyField === undefined
      ? extractAcquisitionCentsFromNotes(input.notes) ?? (input.notes ? parseBRLToCents(input.notes) : undefined)
      : undefined;

  const normalizedCents = centsFromNewField ?? centsFromLegacyField ?? centsFromNotes;

  return {
    id: input.id,
    code: input.code,
    name: input.name,
    category: input.category,
    brand: input.brand ?? undefined,
    model: input.model ?? undefined,
    serialNumber: input.serial_number ?? undefined,
    acquisitionDate: input.acquisition_date,
    status: input.status,
    location: input.location ?? undefined,
    notes: input.notes ?? undefined,
    acquisitionValueCents: normalizedCents,
    quantity: input.quantity ?? undefined,
    unitValueCents: normalizedCents,
    createdAt: input.created_at,
    updatedAt: input.updated_at,
  };
};

export async function getEquipment(): Promise<ActionResponse<{ equipment: Equipment[] }>> {
  try {
    const response = await fetchApi<ApiEquipment[]>(API_BASE);
    return success({ equipment: response.map(mapEquipment) });
  } catch (error) {
    const message = error instanceof HttpError ? error.message : 'Erro ao listar equipamentos.';
    return failure(message);
  }
}

export async function getEquipmentById(id: string): Promise<ActionResponse<Equipment>> {
  try {
    const response = await fetchApi<ApiEquipment>(`${API_BASE}/${id}`);
    return success(mapEquipment(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Equipamento nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao buscar equipamento.';
    return failure(message);
  }
}

export async function createEquipment(
  input: CreateEquipmentInput,
): Promise<ActionResponse<Equipment>> {
  try {
    const response = await fetchApi<ApiEquipment>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        code: input.code,
        name: input.name,
        category: input.category,
        brand: input.brand ?? null,
        model: input.model ?? null,
        serial_number: input.serialNumber ?? null,
        acquisition_date: input.acquisitionDate,
        status: input.status ?? 'available',
        location: input.location ?? null,
        notes: input.notes ?? null,
        quantity: input.quantity ?? 1,
        unit_value_cents: input.unitValueCents ?? input.acquisitionValueCents ?? null,
      }),
    });

    return success(mapEquipment(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      return failure('Codigo de equipamento ja existe.', 'CONFLICT');
    }
    const message = error instanceof Error ? error.message : 'Erro ao criar equipamento.';
    return failure(message);
  }
}

export async function updateEquipment(
  input: UpdateEquipmentInput,
): Promise<ActionResponse<Equipment>> {
  try {
    const payload: Record<string, unknown> = {};
    
    if (input.name !== undefined) payload.name = input.name;
    if (input.category !== undefined) payload.category = input.category;
    if (input.brand !== undefined) payload.brand = input.brand;
    if (input.model !== undefined) payload.model = input.model;
    if (input.serialNumber !== undefined) payload.serial_number = input.serialNumber;
    if (input.acquisitionDate !== undefined) payload.acquisition_date = input.acquisitionDate;
    if (input.status !== undefined) payload.status = input.status;
    if (input.location !== undefined) payload.location = input.location;
    if (input.notes !== undefined) payload.notes = input.notes;
    if (input.quantity !== undefined) payload.quantity = input.quantity;
    if (input.unitValueCents !== undefined) payload.unit_value_cents = input.unitValueCents;
    if (input.acquisitionValueCents !== undefined && payload.unit_value_cents === undefined) {
      payload.unit_value_cents = input.acquisitionValueCents;
    }

    const response = await fetchApi<ApiEquipment>(`${API_BASE}/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return success(mapEquipment(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Equipamento nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao atualizar equipamento.';
    return failure(message);
  }
}

export async function deleteEquipment(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    await fetchApi(`${API_BASE}/${id}`, { method: 'DELETE' });
    return success({ id });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Equipamento nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao remover equipamento.';
    return failure(message);
  }
}
