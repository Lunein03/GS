import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { ActionResponse } from '@/shared/lib/types/actions';
import type { Event } from '@/features/patrimonio/domain/types/equipment';

type ApiEvent = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  notes?: string | null;
  created_at: string;
  deleted_at?: string | null;
  equipment_ids: string[];
  equipment_allocations: {
    equipment_id: string;
    quantity: number;
  }[];
  status: 'pending' | 'completed';
};

export type CreateEventInput = {
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  notes?: string;
  equipmentAllocations?: { equipmentId: string; quantity: number }[];
};

export type UpdateEventInput = {
  id: string;
  name?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  notes?: string;
  status?: 'pending' | 'completed';
};

const API_BASE = '/inventory/events';

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

const mapEvent = (input: ApiEvent): Event => ({
  id: input.id,
  name: input.name,
  startDate: input.start_date,
  endDate: input.end_date,
  location: input.location,
  notes: input.notes ?? undefined,
  createdAt: input.created_at,
  equipmentIds:
    input.equipment_ids.length > 0
      ? input.equipment_ids
      : input.equipment_allocations.map((allocation) => allocation.equipment_id),
  equipmentAllocations: input.equipment_allocations.map((allocation) => ({
    equipmentId: allocation.equipment_id,
    quantity: allocation.quantity,
  })),
  status: input.status,
});

export async function getEvents(): Promise<ActionResponse<{ events: Event[] }>> {
  try {
    const response = await fetchApi<ApiEvent[]>(API_BASE);
    return success({ events: response.map(mapEvent) });
  } catch (error) {
    const message = error instanceof HttpError ? error.message : 'Erro ao listar eventos.';
    return failure(message);
  }
}

export async function getEventById(id: string): Promise<ActionResponse<Event>> {
  try {
    const response = await fetchApi<ApiEvent>(`${API_BASE}/${id}`);
    return success(mapEvent(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Evento nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao buscar evento.';
    return failure(message);
  }
}

export async function createEvent(input: CreateEventInput): Promise<ActionResponse<Event>> {
  try {
    const response = await fetchApi<ApiEvent>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        start_date: input.startDate,
        end_date: input.endDate,
        location: input.location,
        notes: input.notes ?? null,
        status: 'pending',
        equipment_allocations: input.equipmentAllocations?.map((allocation) => ({
          equipment_id: allocation.equipmentId,
          quantity: allocation.quantity,
        })),
      }),
    });

    return success(mapEvent(response));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar evento.';
    return failure(message);
  }
}

export async function updateEvent(input: UpdateEventInput): Promise<ActionResponse<Event>> {
  try {
    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) payload.name = input.name;
    if (input.startDate !== undefined) payload.start_date = input.startDate;
    if (input.endDate !== undefined) payload.end_date = input.endDate;
    if (input.location !== undefined) payload.location = input.location;
    if (input.notes !== undefined) payload.notes = input.notes;
    if (input.status !== undefined) payload.status = input.status;

    const response = await fetchApi<ApiEvent>(`${API_BASE}/${input.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return success(mapEvent(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Evento nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao atualizar evento.';
    return failure(message);
  }
}

export async function deleteEvent(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    await fetchApi(`${API_BASE}/${id}`, { method: 'DELETE' });
    return success({ id });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Evento nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao remover evento.';
    return failure(message);
  }
}

export async function addEquipmentToEvent(
  eventId: string,
  equipmentId: string,
  quantity: number,
): Promise<ActionResponse<void>> {
  try {
    await fetchApi(`${API_BASE}/${eventId}/equipment/${equipmentId}`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
    return success(undefined);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao adicionar equipamento ao evento.';
    return failure(message);
  }
}

export async function removeEquipmentFromEvent(
  eventId: string,
  equipmentId: string,
): Promise<ActionResponse<void>> {
  try {
    await fetchApi(`${API_BASE}/${eventId}/equipment/${equipmentId}`, {
      method: 'DELETE',
    });
    return success(undefined);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao remover equipamento do evento.';
    return failure(message);
  }
}

export async function updateEventStatus(
  eventId: string,
  status: 'pending' | 'completed',
): Promise<ActionResponse<Event>> {
  try {
    const response = await fetchApi<ApiEvent>(`${API_BASE}/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return success(mapEvent(response));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar status do evento.';
    return failure(message);
  }
}
