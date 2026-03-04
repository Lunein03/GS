import * as repo from './repository';
import { notFound } from '../_lib/errors';
import type { Equipment, InventoryEvent, EventEquipment } from './types';
import type { z } from 'zod';
import type {
  createEquipmentSchema, updateEquipmentSchema,
  createEventSchema, updateEventSchema,
} from './schemas';

type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
type CreateEventInput = z.infer<typeof createEventSchema>;
type UpdateEventInput = z.infer<typeof updateEventSchema>;

// --- Equipment ---

export async function listEquipment(): Promise<Equipment[]> {
  return repo.findAllEquipment();
}

export async function getEquipment(id: string): Promise<Equipment> {
  const eq = await repo.findEquipmentById(id);
  if (!eq) throw notFound('Equipamento');
  return eq;
}

export async function createEquipment(input: CreateEquipmentInput): Promise<Equipment> {
  return repo.insertEquipment(input);
}

export async function updateEquipment(id: string, input: UpdateEquipmentInput): Promise<Equipment> {
  const existing = await repo.findEquipmentById(id);
  if (!existing) throw notFound('Equipamento');
  return repo.updateEquipmentById(id, input);
}

export async function deleteEquipment(id: string): Promise<void> {
  const existing = await repo.findEquipmentById(id);
  if (!existing) throw notFound('Equipamento');
  return repo.softDeleteEquipment(id);
}

async function markEquipmentInUse(equipmentId: string): Promise<void> {
  await repo.updateEquipmentStatus(equipmentId, 'in-use');
}

async function markEquipmentAvailableIfUnused(equipmentId: string, excludeEventId?: string): Promise<void> {
  const activeEvents = await repo.findActiveEventsForEquipment(equipmentId, excludeEventId);
  if (activeEvents.length === 0) {
    await repo.updateEquipmentStatus(equipmentId, 'available');
  }
}

export async function reconcileAll(): Promise<{ released_count: number; total: number }> {
  const inUseIds = await repo.findAllInUseEquipmentIds();
  let released = 0;

  for (const id of inUseIds) {
    const activeEvents = await repo.findActiveEventsForEquipment(id);
    if (activeEvents.length === 0) {
      await repo.updateEquipmentStatus(id, 'available');
      released++;
    }
  }

  return { released_count: released, total: inUseIds.length };
}

// --- Events ---

export async function listEvents(): Promise<InventoryEvent[]> {
  return repo.findAllEvents();
}

export async function getEvent(id: string): Promise<InventoryEvent & { equipment: (EventEquipment & { equipment: Equipment })[] }> {
  const event = await repo.findEventById(id);
  if (!event) throw notFound('Evento');
  const equipment = await repo.findEventEquipment(id);
  return { ...event, equipment };
}

export async function createEvent(
  input: CreateEventInput
): Promise<InventoryEvent> {
  const equipments = (input.equipment ?? []) as { equipment_id: string; quantity: number }[];
  const eventData = { ...input };
  delete eventData.equipment;

  const event = await repo.insertEvent(eventData);

  for (const eq of equipments) {
    await repo.addEquipmentToEvent(event.id, eq.equipment_id, eq.quantity);
    await markEquipmentInUse(eq.equipment_id);
  }

  return event;
}

export async function updateEvent(id: string, input: UpdateEventInput): Promise<InventoryEvent> {
  const existing = await repo.findEventById(id);
  if (!existing) throw notFound('Evento');

  const updated = await repo.updateEventById(id, input);

  if (input.status === 'completed' && existing.status !== 'completed') {
    const eventEquipment = await repo.findEventEquipment(id);
    for (const eq of eventEquipment) {
      await markEquipmentAvailableIfUnused(eq.equipment_id, id);
    }
  }

  return updated;
}

export async function deleteEvent(id: string): Promise<void> {
  const existing = await repo.findEventById(id);
  if (!existing) throw notFound('Evento');

  const eventEquipment = await repo.findEventEquipment(id);
  await repo.softDeleteEvent(id);

  for (const eq of eventEquipment) {
    await markEquipmentAvailableIfUnused(eq.equipment_id, id);
  }
}

// --- Event Equipment ---

export async function addEquipmentToEventService(
  eventId: string,
  equipmentId: string,
  quantity: number
): Promise<EventEquipment> {
  const event = await repo.findEventById(eventId);
  if (!event) throw notFound('Evento');

  const eq = await repo.findEquipmentById(equipmentId);
  if (!eq) throw notFound('Equipamento');

  const result = await repo.addEquipmentToEvent(eventId, equipmentId, quantity);
  await markEquipmentInUse(equipmentId);
  return result;
}

export async function removeEquipmentFromEventService(
  eventId: string,
  equipmentId: string
): Promise<void> {
  await repo.removeEquipmentFromEvent(eventId, equipmentId);
  await markEquipmentAvailableIfUnused(equipmentId, eventId);
}
