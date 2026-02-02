import { fetchApi, HttpError } from '@/shared/lib/api-client';
import { removeNonNumeric } from '@/shared/lib/validators';
import type { ActionResponse, AppErrorCode } from '@/shared/lib/types/actions';
import {
  companySchema,
  createCompanySchema,
  deleteCompanySchema,
  getCompaniesSchema,
  updateCompanySchema,
  type Company,
  type CreateCompanyInput,
  type DeleteCompanyInput,
  type GetCompaniesInput,
  type UpdateCompanyInput,
} from '@/features/gs-propostas/app/app-legacy/cadastro/empresas/types';

type ApiCompany = {
  id: string;
  tipo: 'fisica' | 'juridica';
  cpf_cnpj: string;
  nome?: string | null;
  razao_social?: string | null;
  nome_fantasia?: string | null;
  logo?: string | null;
  contato_nome: string;
  contato_email: string;
  contato_telefone: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  ativo?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

const API_BASE = '/crm/companies';

const success = <T>(data: T): ActionResponse<T> => ({
  success: true,
  data,
});

const failure = <T>(
  code: AppErrorCode,
  message: string,
): ActionResponse<T> => ({
  success: false,
  error: { code, message },
});

const mapCompany = (input: ApiCompany): Company =>
  companySchema.parse({
    id: input.id,
    tipo: input.tipo,
    cpfCnpj: input.cpf_cnpj,
    nome: input.nome ?? null,
    razaoSocial: input.razao_social ?? null,
    nomeFantasia: input.nome_fantasia ?? null,
    logo: input.logo ?? null,
    contatoNome: input.contato_nome,
    contatoEmail: input.contato_email,
    contatoTelefone: input.contato_telefone,
    cep: input.cep,
    endereco: input.endereco,
    numero: input.numero,
    complemento: input.complemento ?? null,
    bairro: input.bairro,
    cidade: input.cidade,
    estado: input.estado,
    ativo: input.ativo ?? 1,
    createdAt: input.created_at,
    updatedAt: input.updated_at,
    deletedAt: input.deleted_at ?? null,
  });

const resolveTipo = (documentDigits: string): 'fisica' | 'juridica' =>
  documentDigits.length === 11 ? 'fisica' : 'juridica';

const serializeCompanyInput = (
  data: CreateCompanyInput | UpdateCompanyInput,
) => {
  const documentDigits = removeNonNumeric(data.cpfCnpj);

  return {
    tipo: resolveTipo(documentDigits),
    cpf_cnpj: documentDigits,
    nome: data.nome ?? null,
    razao_social: data.razaoSocial ?? null,
    nome_fantasia: data.nomeFantasia ?? null,
    logo: data.logo ?? null,
    contato_nome: data.contatoNome,
    contato_email: data.contatoEmail,
    contato_telefone: removeNonNumeric(data.contatoTelefone),
    cep: removeNonNumeric(data.cep),
    endereco: data.endereco,
    numero: data.numero,
    complemento: data.complemento ?? null,
    bairro: data.bairro,
    cidade: data.cidade,
    estado: data.estado,
  };
};

export async function getCompanies(
  input: GetCompaniesInput,
): Promise<ActionResponse<{ companies: Company[] }>> {
  const parsed = getCompaniesSchema.safeParse(input ?? {});
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Filtro invalido.';
    return failure('VALIDATION_ERROR', message);
  }

  try {
    const params = new URLSearchParams();
    if (parsed.data.search) {
      params.set('search', parsed.data.search);
    }

    const url = params.toString() ? `${API_BASE}?${params.toString()}` : API_BASE;
    const response = await fetchApi<ApiCompany[]>(url);
    return success({ companies: response.map(mapCompany) });
  } catch (error) {
    const message =
      error instanceof HttpError ? error.message : 'Erro ao listar empresas.';
    return failure('UNEXPECTED_ERROR', message);
  }
}

export async function createCompany(
  input: CreateCompanyInput,
): Promise<ActionResponse<Company>> {
  const parsed = createCompanySchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Dados invalidos.';
    return failure('VALIDATION_ERROR', message);
  }

  try {
    const payload = serializeCompanyInput(parsed.data);
    const response = await fetchApi<ApiCompany>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return success(mapCompany(response));
  } catch (error) {
    const message =
      error instanceof HttpError ? error.message : 'Erro ao cadastrar empresa.';
    const code = error instanceof HttpError && error.status === 409 ? 'CONFLICT' : 'UNEXPECTED_ERROR';
    return failure(code, message);
  }
}

export async function updateCompany(
  input: UpdateCompanyInput,
): Promise<ActionResponse<Company>> {
  const parsed = updateCompanySchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Dados invalidos.';
    return failure('VALIDATION_ERROR', message);
  }

  try {
    const { id, ...rest } = parsed.data;
    const payload = serializeCompanyInput({
      ...rest,
      cpfCnpj: rest.cpfCnpj,
    } as UpdateCompanyInput);

    const response = await fetchApi<ApiCompany>(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return success(mapCompany(response));
  } catch (error) {
    const message =
      error instanceof HttpError ? error.message : 'Erro ao atualizar empresa.';
    const code = error instanceof HttpError && error.status === 404 ? 'NOT_FOUND' : 'UNEXPECTED_ERROR';
    return failure(code, message);
  }
}

export async function deleteCompany(
  input: DeleteCompanyInput,
): Promise<ActionResponse<{ id: string }>> {
  const parsed = deleteCompanySchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Registro invalido.';
    return failure('VALIDATION_ERROR', message);
  }

  try {
    await fetchApi(`${API_BASE}/${parsed.data.id}`, { method: 'DELETE' });
    return success({ id: parsed.data.id });
  } catch (error) {
    const message =
      error instanceof HttpError ? error.message : 'Erro ao remover empresa.';
    const code = error instanceof HttpError && error.status === 404 ? 'NOT_FOUND' : 'UNEXPECTED_ERROR';
    return failure(code, message);
  }
}
