import type { SQL } from 'drizzle-orm';
import { and, asc, eq, gte, isNull, lte } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { eventEquipment, events } from '@/lib/db/schema';

export type EventEntity = typeof events.$inferSelect;
export type EventInsert = typeof events.$inferInsert;

export interface EventFilters {
  from?: Date;
  to?: Date;
  includeDeleted?: boolean;
}

export type EventWithEquipment = EventEntity & { equipmentIds: string[] };

export async function listEvents(filters: EventFilters = {}): Promise<EventWithEquipment[]> {
  const { from, to, includeDeleted } = filters;
  const conditions: SQL[] = [];

  if (!includeDeleted) {
    conditions.push(isNull(events.deletedAt));
  }

  if (from) {
    conditions.push(gte(events.date, from));
  }

  if (to) {
    conditions.push(lte(events.date, to));
  }

  const baseQuery = db
    .select({
      event: events,
      equipmentId: eventEquipment.equipmentId,
    })
    .from(events)
    .leftJoin(eventEquipment, eq(eventEquipment.eventId, events.id));

  const filteredQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  const rows = await filteredQuery.orderBy(asc(events.date));

  const grouped = new Map<string, EventWithEquipment>();

  for (const row of rows) {
    const current = grouped.get(row.event.id);
    if (!current) {
      grouped.set(row.event.id, {
        ...row.event,
        equipmentIds: row.equipmentId ? [row.equipmentId] : [],
      });
      continue;
    }

    if (row.equipmentId) {
      current.equipmentIds.push(row.equipmentId);
    }
  }

  return Array.from(grouped.values());
}

export async function findEventById(id: string): Promise<EventWithEquipment | undefined> {
  const rows = await db
    .select({
      event: events,
      equipmentId: eventEquipment.equipmentId,
    })
    .from(events)
    .leftJoin(eventEquipment, eq(eventEquipment.eventId, events.id))
    .where(eq(events.id, id));

  if (rows.length === 0) {
    return undefined;
  }

  const equipmentIds: string[] = [];
  for (const row of rows) {
    if (row.equipmentId) {
      equipmentIds.push(row.equipmentId);
    }
  }

  return {
    ...rows[0].event,
    equipmentIds,
  };
}

export async function createEvent(
  payload: EventInsert & { equipmentIds: string[] }
): Promise<EventWithEquipment> {
  return db.transaction(async (tx) => {
    const { equipmentIds, ...eventPayload } = payload;
    const [createdEvent] = await tx.insert(events).values(eventPayload).returning();

    if (equipmentIds.length > 0) {
      const equipmentLinks = equipmentIds.map((equipmentId: string) => ({
        eventId: createdEvent.id,
        equipmentId,
      }));
      await tx.insert(eventEquipment).values(equipmentLinks);
    }

    return { ...createdEvent, equipmentIds: [...equipmentIds] };
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(eventEquipment).where(eq(eventEquipment.eventId, id));
    await tx
      .update(events)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(events.id, id));
  });
}
