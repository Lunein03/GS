import * as repo from './repository';
import { notFound, conflict } from '../../_lib/errors';
import type { Company, CreateCompanyInput, UpdateCompanyInput } from './types';

function sanitizeDocument(doc: string): string {
  return doc.replace(/\D/g, '');
}

export async function listCompanies(search?: string): Promise<Company[]> {
  return repo.findAll(search);
}

export async function getCompany(id: string): Promise<Company> {
  const company = await repo.findById(id);
  if (!company) throw notFound('Empresa');
  return company;
}

export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  const sanitized = sanitizeDocument(input.cpf_cnpj);
  const existing = await repo.findByCpfCnpj(sanitized);
  if (existing) throw conflict('CPF/CNPJ já cadastrado');
  return repo.insert({ ...input, cpf_cnpj: sanitized });
}

export async function updateCompany(id: string, input: UpdateCompanyInput): Promise<Company> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Empresa');

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

export async function deleteCompany(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Empresa');
  return repo.softDelete(id);
}
