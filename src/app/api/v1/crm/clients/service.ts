import * as repo from './repository';
import { notFound, conflict } from '../../_lib/errors';
import type {
  Client,
  ClientSecondaryContact,
  CreateClientInput,
  UpdateClientInput,
  CreateContactInput,
  UpdateContactInput,
} from './types';

function sanitizeDocument(doc: string): string {
  return doc.replace(/\D/g, '');
}

export async function listClients(search?: string): Promise<Client[]> {
  return repo.findAll(search);
}

export async function getClient(id: string): Promise<Client> {
  const client = await repo.findById(id);
  if (!client) throw notFound('Cliente');
  return client;
}

export async function createClient(input: CreateClientInput): Promise<Client> {
  const sanitized = sanitizeDocument(input.cpf_cnpj);
  const existing = await repo.findByCpfCnpj(sanitized);
  if (existing) throw conflict('CPF/CNPJ já cadastrado');
  return repo.insert({ ...input, cpf_cnpj: sanitized });
}

export async function updateClient(id: string, input: UpdateClientInput): Promise<Client> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Cliente');

  if (input.cpf_cnpj) {
    const sanitized = sanitizeDocument(input.cpf_cnpj);
    if (sanitized !== existing.cpf_cnpj) {
      const dup = await repo.findByCpfCnpj(sanitized);
      if (dup) throw conflict('CPF/CNPJ já cadastrado');
    }
    input = { ...input, cpf_cnpj: sanitized };
  }

  return repo.updateById(id, input);
}

export async function deleteClient(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Cliente');
  return repo.softDelete(id);
}

// --- Contacts ---

export async function listContacts(clientId: string): Promise<ClientSecondaryContact[]> {
  await getClient(clientId);
  return repo.findContacts(clientId);
}

export async function createContact(
  clientId: string,
  input: CreateContactInput
): Promise<ClientSecondaryContact> {
  await getClient(clientId);
  return repo.insertContact(clientId, input);
}

export async function updateContact(
  id: string,
  input: UpdateContactInput
): Promise<ClientSecondaryContact> {
  const existing = await repo.findContactById(id);
  if (!existing) throw notFound('Contato');
  return repo.updateContactById(id, input);
}

export async function deleteContact(id: string): Promise<void> {
  const existing = await repo.findContactById(id);
  if (!existing) throw notFound('Contato');
  return repo.deleteContactById(id);
}
