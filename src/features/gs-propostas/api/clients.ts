/* eslint-disable @typescript-eslint/no-explicit-any */

import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { ActionResponse, AppErrorCode } from '@/shared/lib/types/actions';
import {
  clienteFormSchema,
  contatoSecundarioSchema,
  getClientesSchema,
  type CheckDocumentExistsInput,
  type CreateContatoSecundarioInput,
  type DeleteContatoSecundarioInput,
  type DeleteClienteInput,
  type GetClienteByIdInput,
  type GetClientesInput,
  type UpdateContatoSecundarioInput,
} from '@/features/gs-propostas/app/app-legacy/cadastro/clientes/types/cliente-schemas';
import type {
  Cliente,
  ClienteFormData,
  ContatoSecundario,
  DocumentValidationResult,
} from '@/features/gs-propostas/app/app-legacy/cadastro/clientes/types/cliente';
import { removeNonNumeric } from '@/shared/lib/validators';

const BASE_PATH = '/crm/clients';

type ApiClient = {
  id: string;
  tipo: 'fisica' | 'juridica';
  cpf_cnpj: string;
  nome?: string | null;
  cargo?: string | null;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  contato_nome: string;
  contato_email: string;
  contato_telefone: string;
  ativo: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

type ApiContact = {
  id: string;
  client_id: string;
  nome: string;
  email?: string | null;
  telefone?: string | null;
  cargo?: string | null;
  created_at: string;
  updated_at: string;
};

type ClientesPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type ClientesResult = {
  clientes: Cliente[];
  pagination: ClientesPagination;
};

const success = <T>(data: T): ActionResponse<T> => ({
  success: true,
  data,
});

const failure = <T>(
  message: string,
  code: AppErrorCode = 'UNEXPECTED_ERROR',
): ActionResponse<T> => ({
  success: false,
  error: { code, message },
});

const sanitizeDocument = (doc: string): string => doc.replace(/\D/g, '');

const mapClient = (client: ApiClient): Cliente => ({
  id: client.id,
  tipo: client.tipo,
  cpfCnpj: client.cpf_cnpj,
  nome: client.nome ?? '',
  cargo: client.cargo ?? undefined,
  cep: client.cep,
  endereco: client.endereco,
  numero: client.numero,
  complemento: client.complemento ?? undefined,
  bairro: client.bairro,
  cidade: client.cidade,
  estado: client.estado,
  contatoNome: client.contato_nome,
  contatoEmail: client.contato_email,
  contatoTelefone: client.contato_telefone,
  ativo: client.ativo,
  createdAt: new Date(client.created_at),
  updatedAt: new Date(client.updated_at),
  deletedAt: client.deleted_at ? new Date(client.deleted_at) : undefined,
});

const mapContact = (contact: ApiContact): ContatoSecundario => ({
  id: contact.id,
  clientId: contact.client_id,
  nome: contact.nome,
  email: contact.email ?? undefined,
  telefone: contact.telefone ?? undefined,
  cargo: contact.cargo ?? undefined,
  createdAt: new Date(contact.created_at),
  updatedAt: new Date(contact.updated_at),
});

const buildClientPayload = (data: ClienteFormData) => ({
  tipo: data.tipo,
  cpf_cnpj: sanitizeDocument(data.cpfCnpj),
  nome: data.nome,
  cargo: data.cargo ?? null,
  cep: data.cep,
  endereco: data.endereco,
  numero: data.numero,
  complemento: data.complemento ?? null,
  bairro: data.bairro,
  cidade: data.cidade,
  estado: data.estado,
  contato_nome: data.contatoNome,
  contato_email: data.contatoEmail,
  contato_telefone: data.contatoTelefone,
  ativo: data.ativo ?? 1,
});

async function fetchContacts(clientId: string): Promise<ContatoSecundario[]> {
  const contacts = await fetchApi<ApiContact[]>(`${BASE_PATH}/${clientId}/contacts`);
  return contacts.map(mapContact);
}

export async function getClientes(
  params: GetClientesInput,
): Promise<ActionResponse<ClientesResult>> {
  const parsed = getClientesSchema.safeParse(params ?? {});
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Filtros invalidos.';
    return failure(message, 'VALIDATION_ERROR');
  }

  try {
    const response = await fetchApi<ApiClient[]>(BASE_PATH);
    const normalized = response.map(mapClient);

    const filtered = normalized.filter((client) => {
      if (parsed.data.tipo && parsed.data.tipo !== client.tipo) {
        return false;
      }

      if (parsed.data.status) {
        const active = client.ativo === 1;
        if (parsed.data.status === 'ativo' && !active) {
          return false;
        }
        if (parsed.data.status === 'inativo' && active) {
          return false;
        }
      }

      if (parsed.data.estado && parsed.data.estado !== client.estado) {
        return false;
      }

      if (parsed.data.search) {
        const query = parsed.data.search.toLowerCase();
        const documentDigits = removeNonNumeric(client.cpfCnpj);
        const matches =
          client.nome.toLowerCase().includes(query) ||
          client.contatoEmail.toLowerCase().includes(query) ||
          documentDigits.includes(removeNonNumeric(parsed.data.search));
        if (!matches) {
          return false;
        }
      }

      return true;
    });

    const total = filtered.length;
    const page = parsed.data.page ?? 1;
    const pageSize = parsed.data.pageSize ?? 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const paginated = filtered.slice(start, end);

    return success({
      clientes: paginated,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    const message = error instanceof HttpError ? error.message : 'Erro ao buscar clientes.';
    return failure(message);
  }
}

export async function getClienteById(
  input: GetClienteByIdInput,
): Promise<ActionResponse<Cliente>> {
  try {
    const client = await fetchApi<ApiClient>(`${BASE_PATH}/${input.id}`);
    const mapped = mapClient(client);
    mapped.contatosSecundarios = await fetchContacts(mapped.id);
    return success(mapped);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Cliente nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao buscar cliente.';
    return failure(message);
  }
}

export async function createCliente(
  data: ClienteFormData,
): Promise<ActionResponse<Cliente>> {
  const parsed = clienteFormSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Dados invalidos.';
    return failure(message, 'VALIDATION_ERROR');
  }

  try {
    const payload = buildClientPayload(parsed.data);
    const client = await fetchApi<ApiClient>(BASE_PATH, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (parsed.data.contatosSecundarios?.length) {
      for (const contact of parsed.data.contatosSecundarios) {
        const contactParsed = contatoSecundarioSchema.safeParse(contact);
        if (!contactParsed.success) {
          continue;
        }
        await fetchApi(`${BASE_PATH}/${client.id}/contacts`, {
          method: 'POST',
          body: JSON.stringify(contactParsed.data),
        });
      }
    }

    const mapped = mapClient(client);
    mapped.contatosSecundarios = await fetchContacts(mapped.id);
    return success(mapped);
  } catch (error) {
    if (error instanceof HttpError && error.status === 409) {
      return failure('CPF/CNPJ ja cadastrado.', 'CONFLICT');
    }
    const message = error instanceof Error ? error.message : 'Erro ao criar cliente.';
    return failure(message);
  }
}

export async function updateCliente(
  input: ClienteFormData & { id: string },
): Promise<ActionResponse<Cliente>> {
  const { id, ...data } = input;
  const parsed = clienteFormSchema.safeParse(data);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Dados invalidos.';
    return failure(message, 'VALIDATION_ERROR');
  }

  try {
    const payload = buildClientPayload(parsed.data);
    const client = await fetchApi<ApiClient>(`${BASE_PATH}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (parsed.data.contatosSecundarios) {
      const contacts = await fetchContacts(id);
      const incoming = parsed.data.contatosSecundarios;

      const byId = new Map(contacts.map((contact) => [contact.id, contact]));
      for (const contact of incoming) {
        const contactParsed = contatoSecundarioSchema.safeParse(contact);
        if (!contactParsed.success) {
          continue;
        }

        if (contact.id && byId.has(contact.id)) {
          await fetchApi(`${BASE_PATH}/${id}/contacts/${contact.id}`, {
            method: 'PUT',
            body: JSON.stringify(contactParsed.data),
          });
          byId.delete(contact.id);
        } else {
          await fetchApi(`${BASE_PATH}/${id}/contacts`, {
            method: 'POST',
            body: JSON.stringify(contactParsed.data),
          });
        }
      }

      for (const remaining of Array.from(byId.values())) {
        await fetchApi(`${BASE_PATH}/${id}/contacts/${remaining.id}`, { method: 'DELETE' });
      }
    }

    const mapped = mapClient(client);
    mapped.contatosSecundarios = await fetchContacts(id);
    return success(mapped);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Cliente nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao atualizar cliente.';
    return failure(message);
  }
}

export async function deleteCliente(
  input: DeleteClienteInput,
): Promise<ActionResponse<{ id: string }>> {
  try {
    await fetchApi(`${BASE_PATH}/${input.id}`, {
      method: 'DELETE',
    });
    return success({ id: input.id });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Cliente nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao remover cliente.';
    return failure(message);
  }
}

export async function checkDocumentExists(
  input: CheckDocumentExistsInput,
): Promise<ActionResponse<DocumentValidationResult>> {
  try {
    const sanitized = sanitizeDocument(input.cpfCnpj);
    const clients = await fetchApi<ApiClient[]>(BASE_PATH);
    const match = clients.find(
      (client) =>
        client.cpf_cnpj === sanitized && (!input.excludeId || client.id !== input.excludeId),
    );

    return success({
      isValid: !match,
      error: match ? 'Documento ja cadastrado.' : undefined,
    });
  } catch (error) {
    return failure('Erro ao validar documento.');
  }
}

export async function createContatoSecundario(
  clientId: string,
  input: CreateContatoSecundarioInput,
): Promise<ActionResponse<ContatoSecundario>> {
  const parsed = contatoSecundarioSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Dados invalidos.';
    return failure(message, 'VALIDATION_ERROR');
  }

  try {
    const response = await fetchApi<ApiContact>(`${BASE_PATH}/${clientId}/contacts`, {
      method: 'POST',
      body: JSON.stringify(parsed.data),
    });
    return success(mapContact(response));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar contato.';
    return failure(message);
  }
}

export async function updateContatoSecundario(
  clientId: string,
  input: UpdateContatoSecundarioInput,
): Promise<ActionResponse<ContatoSecundario>> {
  const parsed = contatoSecundarioSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message ?? 'Dados invalidos.';
    return failure(message, 'VALIDATION_ERROR');
  }

  try {
    const response = await fetchApi<ApiContact>(
      `${BASE_PATH}/${clientId}/contacts/${input.id}`,
      {
        method: 'PUT',
        body: JSON.stringify(parsed.data),
      },
    );
    return success(mapContact(response));
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Contato nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao atualizar contato.';
    return failure(message);
  }
}

export async function deleteContatoSecundario(
  clientId: string,
  input: DeleteContatoSecundarioInput,
): Promise<ActionResponse<{ id: string }>> {
  try {
    await fetchApi(`${BASE_PATH}/${clientId}/contacts/${input.id}`, {
      method: 'DELETE',
    });
    return success({ id: input.id });
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return failure('Contato nao encontrado.', 'NOT_FOUND');
    }
    const message = error instanceof Error ? error.message : 'Erro ao remover contato.';
    return failure(message);
  }
}

export async function getContatosSecundarios(
  clientId: string,
): Promise<ActionResponse<ContatoSecundario[]>> {
  try {
    const contacts = await fetchContacts(clientId);
    return success(contacts);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar contatos.';
    return failure(message);
  }
}
