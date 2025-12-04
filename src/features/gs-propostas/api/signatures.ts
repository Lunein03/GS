'use server';

import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type {
  Signature,
  CreateSignatureInput,
  UpdateSignatureInput,
  DeleteSignatureInput,
  GetSignaturesInput,
  RequestGovbrValidationInput,
  CompleteGovbrValidationInput,
} from '@/features/gs-propostas/app/app-legacy/cadastro/assinaturas/types';

type ApiSignature = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  signature_type: 'govbr' | 'custom';
  status: 'pending' | 'verified' | 'revoked';
  govbr_identifier?: string | null;
  govbr_last_validated_at?: string | null;
  signature_image?: string | null;
  signature_image_mime?: string | null;
  signature_image_width?: number | null;
  signature_image_height?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

type ActionResult<T> = {
  data?: {
    success: boolean;
    data?: T;
    error?: { message: string };
  };
  serverError?: string;
  validationError?: unknown;
};

const mapSignature = (input: ApiSignature): Signature => ({
  id: input.id,
  name: input.name,
  cpf: input.cpf,
  email: input.email,
  phone: input.phone,
  signatureType: input.signature_type,
  status: input.status,
  govbrIdentifier: input.govbr_identifier ?? undefined,
  govbrLastValidatedAt: input.govbr_last_validated_at ? new Date(input.govbr_last_validated_at) : undefined,
  signatureImage: input.signature_image ?? undefined,
  signatureImageMime: input.signature_image_mime ?? undefined,
  signatureImageWidth: input.signature_image_width ?? undefined,
  signatureImageHeight: input.signature_image_height ?? undefined,
  createdAt: new Date(input.created_at),
  updatedAt: new Date(input.updated_at),
  deletedAt: input.deleted_at ? new Date(input.deleted_at) : null,
});

export async function getSignatures(input: GetSignaturesInput): Promise<ActionResult<{ signatures: Signature[] }>> {
  try {
    const queryParams = input.search ? `?search=${encodeURIComponent(input.search)}` : '';
    const response = await fetchApi<ApiSignature[]>(`/crm/signatures${queryParams}`);
    return { data: { success: true, data: { signatures: response.map(mapSignature) } } };
  } catch (error) {
    if (error instanceof HttpError) {
      return { data: { success: false, error: { message: error.message } } };
    }
    return { serverError: 'Erro ao buscar assinaturas' };
  }
}

export async function createSignature(input: CreateSignatureInput): Promise<ActionResult<Signature>> {
  try {
    const response = await fetchApi<ApiSignature>('/crm/signatures', {
      method: 'POST',
      body: JSON.stringify({
        name: input.name,
        cpf: input.cpf,
        email: input.email,
        phone: input.phone,
        signature_type: input.signatureType,
        govbr_identifier: input.govbrIdentifier,
        signature_image: input.signatureImageData,
        signature_image_mime: input.signatureImageMime,
        signature_image_width: input.signatureImageWidth,
        signature_image_height: input.signatureImageHeight,
      }),
    });
    return { data: { success: true, data: mapSignature(response) } };
  } catch (error) {
    if (error instanceof HttpError) {
      return { data: { success: false, error: { message: error.message } } };
    }
    return { serverError: 'Erro ao criar assinatura' };
  }
}

export async function updateSignature(input: UpdateSignatureInput): Promise<ActionResult<Signature>> {
  try {
    const response = await fetchApi<ApiSignature>(`/crm/signatures/${input.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: input.name,
        cpf: input.cpf,
        email: input.email,
        phone: input.phone,
        signature_type: input.signatureType,
        govbr_identifier: input.govbrIdentifier,
        signature_image: input.signatureImageData,
        signature_image_mime: input.signatureImageMime,
        signature_image_width: input.signatureImageWidth,
        signature_image_height: input.signatureImageHeight,
      }),
    });
    return { data: { success: true, data: mapSignature(response) } };
  } catch (error) {
    if (error instanceof HttpError) {
      return { data: { success: false, error: { message: error.message } } };
    }
    return { serverError: 'Erro ao atualizar assinatura' };
  }
}

export async function deleteSignature(input: DeleteSignatureInput): Promise<ActionResult<{ id: string }>> {
  try {
    await fetchApi(`/crm/signatures/${input.id}`, {
      method: 'DELETE',
    });
    return { data: { success: true, data: { id: input.id } } };
  } catch (error) {
    if (error instanceof HttpError) {
      return { data: { success: false, error: { message: error.message } } };
    }
    return { serverError: 'Erro ao excluir assinatura' };
  }
}

export async function requestGovbrValidation(input: RequestGovbrValidationInput): Promise<ActionResult<Signature>> {
  try {
    const response = await fetchApi<ApiSignature>(`/crm/signatures/${input.id}/govbr/request`, {
      method: 'POST',
    });
    return { data: { success: true, data: mapSignature(response) } };
  } catch (error) {
    if (error instanceof HttpError) {
      return { data: { success: false, error: { message: error.message } } };
    }
    return { serverError: 'Erro ao solicitar validação Gov.br' };
  }
}

export async function completeGovbrValidation(input: CompleteGovbrValidationInput): Promise<ActionResult<Signature>> {
  try {
    const response = await fetchApi<ApiSignature>(`/crm/signatures/${input.id}/govbr/complete`, {
      method: 'POST',
    });
    return { data: { success: true, data: mapSignature(response) } };
  } catch (error) {
    if (error instanceof HttpError) {
      return { data: { success: false, error: { message: error.message } } };
    }
    return { serverError: 'Erro ao concluir validação Gov.br' };
  }
}
