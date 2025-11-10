'use server';

import { actionClient } from '@/app/actions/safe-action';
import { db } from '@/lib/db/client';
import { paymentModes } from '@/lib/db/schema';
import { and, eq, ilike, isNull, sql } from 'drizzle-orm';
import type { ActionResponse } from '@/types/actions';
import {
  createPaymentModeSchema,
  deletePaymentModeSchema,
  getPaymentModesSchema,
  updatePaymentModeSchema,
  type CreatePaymentModeInput,
  type DeletePaymentModeInput,
  type GetPaymentModesInput,
  type PaymentMode,
  type UpdatePaymentModeInput,
} from '../types';

type PaymentModeRecord = typeof paymentModes.$inferSelect;

type PaymentModeListResult = {
  paymentModes: PaymentMode[];
};

function normalizeDescription(description?: string | null): string | undefined {
  if (!description) {
    return undefined;
  }

  const trimmed = description.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeRate(value: number): string {
  return value.toFixed(4);
}

function parseRate(value: string | number | null): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return parseFloat(value);
  }

  return 0;
}

function mapRecord(record: PaymentModeRecord): PaymentMode {
  return {
    id: record.id,
    name: record.name,
    installments: record.installments,
    interestRate: parseRate(record.interestRate),
    adjustmentRate: parseRate(record.adjustmentRate),
    description: normalizeDescription(record.description),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt ?? undefined,
  };
}

async function hasDuplicateName(name: string, ignoreId?: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: paymentModes.id })
    .from(paymentModes)
    .where(
      and(
        sql`lower(${paymentModes.name}) = lower(${name.trim()})`,
        isNull(paymentModes.deletedAt),
        ignoreId ? sql`${paymentModes.id} != ${ignoreId}` : sql`true`,
      ),
    )
    .limit(1);

  return Boolean(existing);
}

function unexpectedError<T = never>(message: string): ActionResponse<T> {
  return {
    success: false,
    error: {
      code: 'UNEXPECTED_ERROR',
      message,
    },
  } as ActionResponse<T>;
}

export const getPaymentModes = actionClient(
  getPaymentModesSchema,
  async (input: GetPaymentModesInput): Promise<ActionResponse<PaymentModeListResult>> => {
    try {
      const conditions = [isNull(paymentModes.deletedAt)];

      if (input.search) {
        const normalized = `%${input.search.trim()}%`;
        conditions.push(ilike(paymentModes.name, normalized));
      }

      const results = await db
        .select()
        .from(paymentModes)
        .where(and(...conditions))
        .orderBy(paymentModes.name);

      return {
        success: true,
        data: {
          paymentModes: results.map(mapRecord),
        },
      };
    } catch (error) {
      console.error('Erro ao listar modos de pagamento:', error);
      return unexpectedError('Erro ao listar modos de pagamento. Tente novamente.');
    }
  },
);

export const createPaymentMode = actionClient(
  createPaymentModeSchema,
  async (input: CreatePaymentModeInput): Promise<ActionResponse<PaymentMode>> => {
    try {
      if (await hasDuplicateName(input.name)) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Ja existe um modo de pagamento com esse nome',
          },
        };
      }

      const [record] = await db
        .insert(paymentModes)
        .values({
          name: input.name.trim(),
          installments: input.installments,
          interestRate: normalizeRate(input.interestRate),
          adjustmentRate: normalizeRate(input.adjustmentRate),
          description: normalizeDescription(input.description) ?? null,
        })
        .returning();

      if (!record) {
        return unexpectedError('Nao foi possivel cadastrar o modo de pagamento.');
      }

      return {
        success: true,
        data: mapRecord(record),
      };
    } catch (error) {
      console.error('Erro ao cadastrar modo de pagamento:', error);
      return unexpectedError('Erro ao cadastrar modo de pagamento. Tente novamente.');
    }
  },
);

export const updatePaymentMode = actionClient(
  updatePaymentModeSchema,
  async (input: UpdatePaymentModeInput): Promise<ActionResponse<PaymentMode>> => {
    try {
      if (await hasDuplicateName(input.name, input.id)) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Ja existe um modo de pagamento com esse nome',
          },
        };
      }

      const [record] = await db
        .update(paymentModes)
        .set({
          name: input.name.trim(),
          installments: input.installments,
          interestRate: normalizeRate(input.interestRate),
          adjustmentRate: normalizeRate(input.adjustmentRate),
          description: normalizeDescription(input.description) ?? null,
          updatedAt: new Date(),
        })
        .where(and(eq(paymentModes.id, input.id), isNull(paymentModes.deletedAt)))
        .returning();

      if (!record) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Modo de pagamento nao encontrado',
          },
        };
      }

      return {
        success: true,
        data: mapRecord(record),
      };
    } catch (error) {
      console.error('Erro ao atualizar modo de pagamento:', error);
      return unexpectedError('Erro ao atualizar modo de pagamento. Tente novamente.');
    }
  },
);

export const deletePaymentMode = actionClient(
  deletePaymentModeSchema,
  async (input: DeletePaymentModeInput): Promise<ActionResponse<{ id: string }>> => {
    try {
      const [record] = await db
        .update(paymentModes)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(paymentModes.id, input.id), isNull(paymentModes.deletedAt)))
        .returning({ id: paymentModes.id });

      if (!record) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Modo de pagamento nao encontrado',
          },
        };
      }

      return {
        success: true,
        data: { id: record.id },
      };
    } catch (error) {
      console.error('Erro ao remover modo de pagamento:', error);
      return unexpectedError('Erro ao remover modo de pagamento. Tente novamente.');
    }
  },
);
