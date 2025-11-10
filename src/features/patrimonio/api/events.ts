import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { ActionResponse } from '@/shared/lib/types/actions';
import type { Event } from '@/features/patrimonio/domain/types/equipment';

type ApiEvent = {
  id: string;
  name: string;
  date: string;
  location: string;
  notes?: string | null;
  created_at: string;
  deleted_at?: string | null;
  equipment_ids: string[];
};

export type CreateEventInput = {
  name: string;
  date: string;
  location: string;
  notes?: string;
  equipmentIds?: string[];
};

export type UpdateEventInput = {
  id: string;
  name?: string;
  date?: string;
  location?: string;
  notes?: string;
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
  date: input.date,
  location: input.location,
  notes: input.notes ?? undefined,
  createdAt: input.created_at,
  equipmentIds: input.equipment_ids,
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
        date: input.date,
        location: input.location,
        notes: input.notes ?? null,
      }),
    });

    const event = mapEvent(response);

    // Add equipment associations if provided
    if (input.equipmentIds && input.equipmentIds.length > 0) {
      for (const equipmentId of input.equipmentIds) {
        await addEquipmentToEvent(event.id, equipmentId);
      }
      event.equipmentIds = input.equipmentIds;
    }

    return success(event);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar evento.';
    return failure(message);
  }
}

export async function updateEvent(input: UpdateEventInput): Promise<ActionResponse<Event>> {
  try {
    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) payload.name = input.name;
    if (input.date !== undefined) payload.date = input.date;
    if (input.location !== undefined) payload.location = input.location;
    if (input.notes !== undefined) payload.notes = input.notes;

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
): Promise<ActionResponse<void>> {
  try {
    await fetchApi(`${API_BASE}/${eventId}/equipment/${equipmentId}`, {
      method: 'POST',
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
