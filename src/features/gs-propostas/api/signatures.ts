import { fetchApi, HttpError } from '@/shared/lib/api-client';
import { removeNonNumeric } from '@/shared/lib/validators';
import type { ActionResponse } from '@/shared/lib/types/actions';
import {
  createSignatureSchema,
  updateSignatureSchema,
  deleteSignatureSchema,
  getSignaturesSchema,
  requestGovbrValidationSchema,
  completeGovbrValidationSchema,
  signatureSchema,
  type Signature,
  type CreateSignatureInput,
  type UpdateSignatureInput,
  type DeleteSignatureInput,
  type GetSignaturesInput,
  type RequestGovbrValidationInput,
  type CompleteGovbrValidationInput,
} from '@/features/gs-propostas/app/app-legacy/cadastro/assinaturas/types';

interface ApiSignature {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone?: string | null;
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
}

const API_BASE = '/proposals/signatures';

const success = <T>(data: T): ActionResponse<T> => ({ success: true, data });

const failure = <T>(message: string, code: ActionResponse<T>['error']['code'] = 'UNEXPECTED_ERROR'): ActionResponse<T> => ({
  success: false,
  error: { code, message },
});

const mapSignature = (input: ApiSignature): Signature =>
  signatureSchema.parse({
    id: input.id,
    name: input.name,
    cpf: input.cpf,
    email: input.email,
    phone: input.phone ?? '',
    signatureType: input.signature_type,
    status: input.status,
    govbrIdentifier: input.govbr_identifier ?? undefined,
    govbrLastValidatedAt: input.govbr_last_validated_at ?? undefined,
    signatureImage: input.signature_image ?? undefined,
    signatureImageMime: input.signature_image_mime ?? undefined,
    signatureImageWidth: input.signature_image_width ?? undefined,
    signatureImageHeight: input.signature_image_height ?? undefined,
    createdAt: input.created_at,
    updatedAt: input.updated_at,
    deletedAt: input.deleted_at ?? undefined,
  });

export async function getSignatures(
  input: GetSignaturesInput
): Promise<ActionResponse<{ signatures: Signature[] }>> {
  const parsed = getSignaturesSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.errors[0]?.message ?? 'Filtro inválido.', 'VALIDATION_ERROR');
  }

  try {
    const response = await fetchApi<ApiSignature[]>(API_BASE);

    const filtered = parsed.data.search
      ? response.filter((signature) => {
          const needle = parsed.data.search!.toLowerCase();
          const safeCpf = removeNonNumeric(signature.cpf);
          return (
            signature.name.toLowerCase().includes(needle) ||
            signature.email.toLowerCase().includes(needle) ||
            safeCpf.includes(removeNonNumeric(needle))
          );
        })
      : response;

    return success({ signatures: filtered.map(mapSignature) });
  } catch (error) {
    const message = error instanceof HttpError ? error.message : 'Erro ao listar assinaturas.';
    return failure(message);
  }
}

export async function createSignature(
  input: CreateSignatureInput
): Promise<ActionResponse<Signature>> {
  const parsed = createSignatureSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.errors[0]?.message ?? 'Dados inválidos.', 'VALIDATION_ERROR');
  }

  try {
    const response = await fetchApi<ApiSignature>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        name: parsed.data.name,
        cpf: parsed.data.cpf,
        email: parsed.data.email,
        phone: parsed.data.phone,
        signature_type: parsed.data.signatureType,
        govbr_identifier: parsed.data.govbrIdentifier ?? undefined,
        signature_image_data: parsed.data.signatureImageData ?? undefined,
        signature_image_mime: parsed.data.signatureImageMime ?? undefined,
        signature_image_width: parsed.data.signatureImageWidth ?? undefined,
        signature_image_height: parsed.data.signatureImageHeight ?? undefined,
      }),
    });

    return success(mapSignature(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      return failure('Já existe uma assinatura com este CPF.', 'CONFLICT');
    }
    const message = error instanceof Error ? error.message : 'Erro ao criar assinatura.';
    return failure(message);
  }
}

export async function updateSignature(
  input: UpdateSignatureInput
): Promise<ActionResponse<Signature>> {
  const parsed = updateSignatureSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.errors[0]?.message ?? 'Dados inválidos.', 'VALIDATION_ERROR');
  }

  try {
    const response = await fetchApi<ApiSignature>(`${API_BASE}/${parsed.data.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: parsed.data.name,
        cpf: parsed.data.cpf,
        email: parsed.data.email,
        phone: parsed.data.phone,
        signature_type: parsed.data.signatureType,
        govbr_identifier: parsed.data.govbrIdentifier ?? undefined,
        signature_image_data: parsed.data.signatureImageData ?? undefined,
        signature_image_mime: parsed.data.signatureImageMime ?? undefined,
        signature_image_width: parsed.data.signatureImageWidth ?? undefined,
        signature_image_height: parsed.data.signatureImageHeight ?? undefined,
      }),
    });

    return success(mapSignature(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Assinatura não encontrada.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao atualizar assinatura.';
    return failure(message);
  }
}

export async function deleteSignature(
  input: DeleteSignatureInput
): Promise<ActionResponse<{ id: string }>> {
  const parsed = deleteSignatureSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.errors[0]?.message ?? 'Assinatura inválida.', 'VALIDATION_ERROR');
  }

  try {
    await fetchApi(`${API_BASE}/${parsed.data.id}`, { method: 'DELETE' });
    return success({ id: parsed.data.id });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Assinatura não encontrada.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao remover assinatura.';
    return failure(message);
  }
}

export async function requestGovbrValidation(
  input: RequestGovbrValidationInput
): Promise<ActionResponse<Signature>> {
  const parsed = requestGovbrValidationSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.errors[0]?.message ?? 'Assinatura inválida.', 'VALIDATION_ERROR');
  }

  try {
    const response = await fetchApi<ApiSignature>(`${API_BASE}/${parsed.data.id}/govbr/request`, {
      method: 'POST',
    });

    return success(mapSignature(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Assinatura não encontrada.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao solicitar validação.';
    return failure(message);
  }
}

export async function completeGovbrValidation(
  input: CompleteGovbrValidationInput
): Promise<ActionResponse<Signature>> {
  const parsed = completeGovbrValidationSchema.safeParse(input);
  if (!parsed.success) {
    return failure(parsed.error.errors[0]?.message ?? 'Assinatura inválida.', 'VALIDATION_ERROR');
  }

  try {
    const response = await fetchApi<ApiSignature>(`${API_BASE}/${parsed.data.id}/govbr/complete`, {
      method: 'POST',
    });

    return success(mapSignature(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Assinatura não encontrada.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao concluir validação.';
    return failure(message);
  }
}
