import type { Equipment, Event } from '@/features/patrimonio/domain/types/equipment';
import type { EquipmentEntity } from '@/features/patrimonio/server/repositories/equipment-repository';
import type { EventWithEquipment } from '@/features/patrimonio/server/repositories/event-repository';

export function mapEquipmentEntity(entity: EquipmentEntity): Equipment {
  return {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    category: entity.category,
    brand: entity.brand ?? undefined,
    model: entity.model ?? undefined,
    serialNumber: entity.serialNumber ?? undefined,
    acquisitionDate: entity.acquisitionDate.toISOString(),
    status: entity.status,
    location: entity.location ?? undefined,
    notes: entity.notes ?? undefined,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}

export function mapEventEntity(entity: EventWithEquipment): Event {
  return {
    id: entity.id,
    name: entity.name,
    date: entity.date.toISOString(),
    location: entity.location,
    equipmentIds: entity.equipmentIds,
    createdAt: entity.createdAt.toISOString(),
    notes: entity.notes ?? undefined,
  };
}
