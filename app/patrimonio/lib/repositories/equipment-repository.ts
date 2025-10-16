import type { SQL } from 'drizzle-orm';
import { and, asc, eq, ilike, isNull, or } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { equipment } from '@/lib/db/schema';

export type EquipmentEntity = typeof equipment.$inferSelect;
export type EquipmentInsert = typeof equipment.$inferInsert;

export interface EquipmentFilters {
  status?: EquipmentEntity['status'];
  category?: string;
  search?: string;
  includeDeleted?: boolean;
}

export async function listEquipment(filters: EquipmentFilters = {}): Promise<EquipmentEntity[]> {
  const { status, category, search, includeDeleted } = filters;
  const conditions: SQL[] = [];

  if (!includeDeleted) {
    conditions.push(isNull(equipment.deletedAt));
  }

  if (status) {
    conditions.push(eq(equipment.status, status));
  }

  if (category) {
    conditions.push(ilike(equipment.category, `%${category}%`));
  }

  if (search) {
    const normalized = `%${search}%`;
    const searchConditions = [
      ilike(equipment.name, normalized),
      ilike(equipment.code, normalized),
      ilike(equipment.brand, normalized),
      ilike(equipment.location, normalized),
    ].filter(Boolean) as SQL[];

    if (searchConditions.length > 0) {
      const searchClause = or(...searchConditions);
      if (searchClause) {
        conditions.push(searchClause);
      }
    }
  }

  const baseQuery = db.select().from(equipment);
  const filteredQuery = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

  return filteredQuery.orderBy(asc(equipment.name));
}

export async function findEquipmentById(id: string): Promise<EquipmentEntity | undefined> {
  const [record] = await db.select().from(equipment).where(eq(equipment.id, id)).limit(1);
  return record;
}

export async function createEquipment(payload: EquipmentInsert): Promise<EquipmentEntity> {
  const [record] = await db.insert(equipment).values(payload).returning();
  return record;
}

export async function updateEquipmentById(
  id: string,
  data: Partial<EquipmentInsert>
): Promise<EquipmentEntity | undefined> {
  const [record] = await db
    .update(equipment)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(equipment.id, id))
    .returning();

  return record;
}

export async function softDeleteEquipment(id: string): Promise<EquipmentEntity | undefined> {
  const [record] = await db
    .update(equipment)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(equipment.id, id))
    .returning();

  return record;
}

export async function hardDeleteEquipment(id: string): Promise<void> {
  await db.delete(equipment).where(eq(equipment.id, id));
}
