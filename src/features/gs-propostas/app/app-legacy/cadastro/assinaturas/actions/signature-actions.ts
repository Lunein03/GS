'use server';

import { actionClient } from '@/app/actions/safe-action';
import { db } from '@/lib/db/client';
import { proposalSignatures, proposalSignatureTypeEnum } from '@/lib/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import type { ActionResponse } from '@/types/actions';
import { removeNonNumeric } from '@/lib/validators';
import {
  completeGovbrValidationSchema,
  createSignatureSchema,
  deleteSignatureSchema,
  getSignaturesSchema,
  requestGovbrValidationSchema,
  signatureSchema,
  updateSignatureSchema,
  type CompleteGovbrValidationInput,
  type CreateSignatureInput,
  type DeleteSignatureInput,
  type GetSignaturesInput,
  type RequestGovbrValidationInput,
  type Signature,
  type SignatureStatus,
  type SignatureType,
  type UpdateSignatureInput,
} from '../types';

const MAX_SIGNATURE_IMAGE_SIZE = 500 * 1024; // 500 KB
const MAX_SIGNATURE_DIMENSION = 2000;
const SIGNATURE_IMAGE_REGEX = /^data:image\/(png|jpeg|jpg);base64,/;

type SignatureRecord = typeof proposalSignatures.$inferSelect;

type SignatureListResult = {
  signatures: Signature[];
};

function calculateDataUrlSize(dataUrl: string): number {
  const [, base64Content] = dataUrl.split(',');
  if (!base64Content) {
    return 0;
  }

  const padding = (base64Content.match(/=+$/) ?? [''])[0].length;
  return Math.ceil((base64Content.length * 3) / 4 - padding);
}

function normalizeName(name: string): string {
  return name.trim();
}

function normalizeCpf(cpf: string): string {
  return removeNonNumeric(cpf);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string): string {
  return removeNonNumeric(phone);
}

function sanitizeDimension(value?: number | null): number | null {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  const clamped = Math.max(1, Math.min(Math.floor(value), MAX_SIGNATURE_DIMENSION));
  return clamped;
}

function parseSignatureType(value: string): SignatureType {
  return value === 'custom' ? 'custom' : 'govbr';
}

function parseSignatureStatus(value: string): SignatureStatus {
  if (value === 'verified') {
    return 'verified';
  }

  if (value === 'revoked') {
    return 'revoked';
  }

  return 'pending';
}

function parseSignatureRecord(record: SignatureRecord): Signature {
  return signatureSchema.parse({
    id: record.id,
    name: record.name,
    cpf: record.cpf,
    email: record.email,
    phone: record.phone ?? '',
    signatureType: parseSignatureType(record.signatureType),
    status: parseSignatureStatus(record.status),
    govbrIdentifier: record.govbrIdentifier ?? undefined,
    govbrLastValidatedAt: record.govbrLastValidatedAt ?? undefined,
    signatureImage: record.signatureImage ?? undefined,
    signatureImageMime: record.signatureImageMime ?? undefined,
    signatureImageWidth: record.signatureImageWidth ?? undefined,
    signatureImageHeight: record.signatureImageHeight ?? undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    deletedAt: record.deletedAt ?? undefined,
  });
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

async function hasDuplicateCpf(cpf: string, ignoreId?: string): Promise<boolean> {
  const normalizedCpf = normalizeCpf(cpf);
  const results = await db
    .select({ id: proposalSignatures.id })
    .from(proposalSignatures)
    .where(
      and(
        eq(proposalSignatures.cpf, normalizedCpf),
        isNull(proposalSignatures.deletedAt),
        ignoreId ? sql`${proposalSignatures.id} != ${ignoreId}` : sql`true`,
      ),
    )
    .limit(1);

  return results.length > 0;
}

function sanitizeSignatureImage(input: CreateSignatureInput | UpdateSignatureInput) {
  if (!input.signatureImageData) {
    return {
      signatureImage: null,
      signatureImageMime: null,
      signatureImageWidth: null,
      signatureImageHeight: null,
    };
  }

  const trimmed = input.signatureImageData.trim();
  if (!SIGNATURE_IMAGE_REGEX.test(trimmed)) {
    throw new Error('Formato de imagem invalido. Utilize PNG ou JPEG.');
  }

  const size = calculateDataUrlSize(trimmed);
  if (size === 0 || size > MAX_SIGNATURE_IMAGE_SIZE) {
    throw new Error('Imagem da assinatura invalida ou muito grande. Limite de 500KB.');
  }

  const mimeMatch = trimmed.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  const signatureImageMime = mimeMatch ? mimeMatch[1] : 'image/png';

  const width = sanitizeDimension(input.signatureImageWidth);
  const height = sanitizeDimension(input.signatureImageHeight);

  return {
    signatureImage: trimmed,
    signatureImageMime,
    signatureImageWidth: width,
    signatureImageHeight: height,
  };
}

function resolveStatusByType(type: SignatureType, current?: SignatureStatus): SignatureStatus {
  if (type === 'custom') {
    return 'verified';
  }

  if (current && current === 'revoked') {
    return 'revoked';
  }

  return 'pending';
}

export const getSignatures = actionClient(
  getSignaturesSchema,
  async (input: GetSignaturesInput): Promise<ActionResponse<SignatureListResult>> => {
    try {
      const conditions = [isNull(proposalSignatures.deletedAt)];

      if (input.search) {
        const normalized = `%${input.search.trim()}%`;
        conditions.push(
          sql`
            ${proposalSignatures.name} ILIKE ${normalized}
            OR ${proposalSignatures.email} ILIKE ${normalized}
            OR ${proposalSignatures.cpf} ILIKE ${normalized}
          `,
        );
      }

      const results = await db
        .select()
        .from(proposalSignatures)
        .where(and(...conditions))
        .orderBy(proposalSignatures.name);

      return {
        success: true,
        data: {
          signatures: results.map(parseSignatureRecord),
        },
      };
    } catch (error) {
      console.error('Erro ao listar assinaturas:', error);
      return unexpectedError('Erro ao listar assinaturas. Tente novamente.');
    }
  },
);

export const createSignature = actionClient(
  createSignatureSchema,
  async (input: CreateSignatureInput): Promise<ActionResponse<Signature>> => {
    try {
      if (await hasDuplicateCpf(input.cpf)) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Ja existe uma assinatura com este CPF',
          },
        };
      }

      const { signatureImage, signatureImageMime, signatureImageWidth, signatureImageHeight } =
        sanitizeSignatureImage(input);

      const signatureType = input.signatureType;
      const status = resolveStatusByType(signatureType);

      const [record] = await db
        .insert(proposalSignatures)
        .values({
          name: normalizeName(input.name),
          cpf: normalizeCpf(input.cpf),
          email: normalizeEmail(input.email),
          phone: normalizePhone(input.phone),
          signatureType: proposalSignatureTypeEnum.enumValues.includes(signatureType) ? signatureType : 'govbr',
          status,
          govbrIdentifier: input.signatureType === 'govbr' ? input.govbrIdentifier ?? null : null,
          govbrLastValidatedAt: null,
          signatureImage,
          signatureImageMime,
          signatureImageWidth,
          signatureImageHeight,
        })
        .returning();

      if (!record) {
        return unexpectedError('Nao foi possivel cadastrar a assinatura.');
      }

      return {
        success: true,
        data: parseSignatureRecord(record),
      };
    } catch (error) {
      console.error('Erro ao cadastrar assinatura:', error);
      return unexpectedError('Erro ao cadastrar assinatura. Tente novamente.');
    }
  },
);

export const updateSignature = actionClient(
  updateSignatureSchema,
  async (input: UpdateSignatureInput): Promise<ActionResponse<Signature>> => {
    try {
      const existing = await db
        .select()
        .from(proposalSignatures)
        .where(and(eq(proposalSignatures.id, input.id), isNull(proposalSignatures.deletedAt)))
        .limit(1);

      if (existing.length === 0) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assinatura nao encontrada',
          },
        };
      }

      if (await hasDuplicateCpf(input.cpf, input.id)) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Ja existe uma assinatura com este CPF',
          },
        };
      }

      const persisted = existing[0];

      const signatureType = input.signatureType;
      const status = resolveStatusByType(signatureType, parseSignatureStatus(persisted.status));

      const {
        signatureImage,
        signatureImageMime,
        signatureImageWidth,
        signatureImageHeight,
      } = input.signatureType === 'custom' ? sanitizeSignatureImage(input) : sanitizeSignatureImage({
        ...input,
        signatureImageData: persisted.signatureImage ?? undefined,
        signatureImageHeight: persisted.signatureImageHeight ?? undefined,
        signatureImageWidth: persisted.signatureImageWidth ?? undefined,
      });

      const [record] = await db
        .update(proposalSignatures)
        .set({
          name: normalizeName(input.name),
          cpf: normalizeCpf(input.cpf),
          email: normalizeEmail(input.email),
          phone: normalizePhone(input.phone),
          signatureType,
          status,
          govbrIdentifier: input.signatureType === 'govbr' ? input.govbrIdentifier ?? null : null,
          signatureImage: input.signatureType === 'custom' ? signatureImage : null,
          signatureImageMime: input.signatureType === 'custom' ? signatureImageMime : null,
          signatureImageWidth: input.signatureType === 'custom' ? signatureImageWidth : null,
          signatureImageHeight: input.signatureType === 'custom' ? signatureImageHeight : null,
          govbrLastValidatedAt:
            input.signatureType === 'govbr' && status === 'verified'
              ? new Date()
              : input.signatureType === 'govbr'
                ? persisted.govbrLastValidatedAt ?? null
                : null,
          updatedAt: new Date(),
        })
        .where(and(eq(proposalSignatures.id, input.id), isNull(proposalSignatures.deletedAt)))
        .returning();

      if (!record) {
        return unexpectedError('Nao foi possivel atualizar a assinatura.');
      }

      return {
        success: true,
        data: parseSignatureRecord(record),
      };
    } catch (error) {
      console.error('Erro ao atualizar assinatura:', error);
      return unexpectedError('Erro ao atualizar assinatura. Tente novamente.');
    }
  },
);

export const deleteSignature = actionClient(
  deleteSignatureSchema,
  async (input: DeleteSignatureInput): Promise<ActionResponse<{ id: string }>> => {
    try {
      const [record] = await db
        .update(proposalSignatures)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
          status: 'revoked',
        })
        .where(and(eq(proposalSignatures.id, input.id), isNull(proposalSignatures.deletedAt)))
        .returning({ id: proposalSignatures.id });

      if (!record) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assinatura nao encontrada',
          },
        };
      }

      return {
        success: true,
        data: { id: record.id },
      };
    } catch (error) {
      console.error('Erro ao remover assinatura:', error);
      return unexpectedError('Erro ao remover assinatura. Tente novamente.');
    }
  },
);

export const requestGovbrValidation = actionClient(
  requestGovbrValidationSchema,
  async (input: RequestGovbrValidationInput): Promise<ActionResponse<Signature>> => {
    try {
      const [record] = await db
        .update(proposalSignatures)
        .set({
          status: 'pending',
          govbrLastValidatedAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(proposalSignatures.id, input.id),
            isNull(proposalSignatures.deletedAt),
            eq(proposalSignatures.signatureType, 'govbr'),
          ),
        )
        .returning();

      if (!record) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assinatura Gov.br nao encontrada para solicitacao de validacao',
          },
        };
      }

      return {
        success: true,
        data: parseSignatureRecord(record),
      };
    } catch (error) {
      console.error('Erro ao solicitar validacao Gov.br:', error);
      return unexpectedError('Erro ao solicitar validacao Gov.br. Tente novamente.');
    }
  },
);

export const completeGovbrValidation = actionClient(
  completeGovbrValidationSchema,
  async (input: CompleteGovbrValidationInput): Promise<ActionResponse<Signature>> => {
    try {
      const [record] = await db
        .update(proposalSignatures)
        .set({
          status: 'verified',
          govbrLastValidatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(proposalSignatures.id, input.id),
            isNull(proposalSignatures.deletedAt),
            eq(proposalSignatures.signatureType, 'govbr'),
          ),
        )
        .returning();

      if (!record) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Assinatura Gov.br nao encontrada para conclusao de validacao',
          },
        };
      }

      return {
        success: true,
        data: parseSignatureRecord(record),
      };
    } catch (error) {
      console.error('Erro ao concluir validacao Gov.br:', error);
      return unexpectedError('Erro ao concluir validacao Gov.br. Tente novamente.');
    }
  },
);
