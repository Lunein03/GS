'use server';

import { inArray } from 'drizzle-orm';

import { actionClient } from '@/app/actions/safe-action';
import { db } from '@/lib/db/client';
import { equipment as equipmentTable } from '@/lib/db/schema';
import { mapEventEntity } from '@/app/patrimonio/lib/mappers';
import {
  createEventSchema,
  deleteEventSchema,
  eventFiltersSchema,
  type CreateEventInput,
  type DeleteEventInput,
  type EventFiltersInput,
} from '@/app/patrimonio/lib/validators';
import {
  createEvent,
  deleteEvent,
  findEventById,
  listEvents,
} from '@/app/patrimonio/lib/repositories/event-repository';
import type { Event as EventView } from '@/app/patrimonio/types/equipment';
import type { ActionResponse } from '@/types/actions';
import { appErrors } from '@/types/actions';

const handleUnexpectedError = <T>(error: unknown): ActionResponse<T> => {
  console.error('Erro inesperado em ação de evento', error);
  return { success: false, error: appErrors.UNEXPECTED_ERROR };
};

async function ensureEquipmentExists(equipmentIds: string[]): Promise<boolean> {
  if (equipmentIds.length === 0) {
    return false;
  }

  const records = await db
    .select({ id: equipmentTable.id })
    .from(equipmentTable)
    .where(inArray(equipmentTable.id, equipmentIds));

  return records.length === equipmentIds.length;
}

export const listEventsAction = actionClient(
  eventFiltersSchema.optional(),
  async (input: EventFiltersInput | undefined): Promise<ActionResponse<EventView[]>> => {
    try {
      const filters = input ?? {};
      const rows = await listEvents(filters);
      return {
        success: true,
        data: rows.map(mapEventEntity),
      };
    } catch (error) {
      return handleUnexpectedError<EventView[]>(error);
    }
  }
);

export const createEventAction = actionClient(
  createEventSchema,
  async (input: CreateEventInput): Promise<ActionResponse<EventView>> => {
    try {
      const equipmentExists = await ensureEquipmentExists(input.equipmentIds);
      if (!equipmentExists) {
        return {
          success: false,
          error: {
            ...appErrors.VALIDATION_ERROR,
            message: 'Alguns equipamentos selecionados não existem ou foram removidos.',
          },
        };
      }

      const created = await createEvent({
        ...input,
        date: input.date,
      });

      return {
        success: true,
        data: mapEventEntity(created),
      };
    } catch (error) {
      return handleUnexpectedError<EventView>(error);
    }
  }
);

export const deleteEventAction = actionClient(
  deleteEventSchema,
  async (input: DeleteEventInput): Promise<ActionResponse<{ id: string }>> => {
    try {
      const { id } = input;
      const existing = await findEventById(id);
      if (!existing) {
        return { success: false, error: appErrors.NOT_FOUND };
      }

      await deleteEvent(id);

      return {
        success: true,
        data: { id },
      };
    } catch (error) {
      return handleUnexpectedError<{ id: string }>(error);
    }
  }
);
