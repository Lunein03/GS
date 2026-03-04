import * as repo from './repository';
import { notFound } from '../../_lib/errors';
import type { CreateOvertimeInput, UpdateOvertimeInput, OvertimeRequest } from './types';

export async function listOvertimeRequests(): Promise<OvertimeRequest[]> {
  return repo.findAll();
}

export async function createOvertimeRequest(
  input: CreateOvertimeInput
): Promise<OvertimeRequest> {
  return repo.insert(input);
}

export async function updateOvertimeRequest(
  id: string,
  input: UpdateOvertimeInput
): Promise<OvertimeRequest> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Solicitação de hora extra');
  return repo.updateById(id, input);
}

export async function deleteOvertimeRequest(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Solicitação de hora extra');
  return repo.deleteById(id);
}
