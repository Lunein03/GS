import { desc, sql } from 'drizzle-orm';

import { db } from '@/lib/db/client';
import { equipment } from '@/lib/db/schema';

const CODE_PREFIX = 'PAT';
const CODE_PADDING = 5;

export async function generateEquipmentCode(): Promise<string> {
  const now = new Date();
  const yearSuffix = now.getFullYear().toString().slice(-2);
  const prefix = `${CODE_PREFIX}${yearSuffix}`;

  const [latest] = await db
    .select({ lastCode: equipment.code })
    .from(equipment)
    .where(sql`substring(${equipment.code} from 1 for 5) = ${prefix}`)
    .orderBy(desc(equipment.code))
    .limit(1);

  const currentSequence = latest?.lastCode ? Number.parseInt(latest.lastCode.slice(5), 10) : 0;
  const nextSequence = currentSequence + 1;

  return `${prefix}${nextSequence.toString().padStart(CODE_PADDING, '0')}`;
}
