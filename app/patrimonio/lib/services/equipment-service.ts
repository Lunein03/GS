import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { equipment } from '@/lib/db/schema';
import { appErrors } from '@/types/actions';
import type { AppError } from '@/types/actions';

export async function ensureSerialNumberIsUnique(
  serialNumber: string,
  currentId?: string
): Promise<AppError | null> {
  const [conflict] = await db
    .select({ id: equipment.id })
    .from(equipment)
    .where(and(eq(equipment.serialNumber, serialNumber), isNull(equipment.deletedAt)))
    .limit(1);

  if (!conflict) {
    return null;
  }

  if (currentId && conflict.id === currentId) {
    return null;
  }

  return {
    ...appErrors.CONFLICT,
    message: 'Já existe um equipamento com o mesmo número de série.',
    details: { serialNumber },
  };
}
