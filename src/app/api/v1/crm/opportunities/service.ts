import * as repo from './repository';
import { notFound } from '../../_lib/errors';
import type {
  Opportunity,
  OpportunityActivity,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  OpportunityStatus,
} from './types';

const STATUSES: { id: OpportunityStatus; title: string; color: string }[] = [
  { id: 'OPEN', title: 'Aberto', color: '#3b82f6' },
  { id: 'IN_PROGRESS', title: 'Em Andamento', color: '#f59e0b' },
  { id: 'WON', title: 'Ganho', color: '#10b981' },
  { id: 'LOST', title: 'Perdido', color: '#ef4444' },
];

export function getStatuses() {
  return STATUSES;
}

export async function listOpportunities(): Promise<Opportunity[]> {
  return repo.findAll();
}

export async function getOpportunity(id: string): Promise<Opportunity> {
  const opp = await repo.findById(id);
  if (!opp) throw notFound('Oportunidade');
  return opp;
}

export async function createOpportunity(
  input: CreateOpportunityInput
): Promise<Opportunity> {
  const opp = await repo.insert(input);

  await repo.insertActivity({
    opportunity_id: opp.id,
    action: 'Oportunidade criada',
    to_status: opp.status,
  });

  return opp;
}

export async function updateOpportunity(
  id: string,
  input: UpdateOpportunityInput
): Promise<Opportunity> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Oportunidade');
  return repo.updateById(id, input);
}

export async function changeStatus(
  id: string,
  newStatus: OpportunityStatus,
  userId?: string,
  notes?: string
): Promise<Opportunity> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Oportunidade');

  const updated = await repo.updateById(id, { status: newStatus } as UpdateOpportunityInput);

  await repo.insertActivity({
    opportunity_id: id,
    action: `Status alterado de ${existing.status} para ${newStatus}`,
    from_status: existing.status,
    to_status: newStatus,
    user_id: userId ?? null,
    notes: notes ?? null,
  });

  return updated;
}

export async function deleteOpportunity(id: string): Promise<void> {
  const existing = await repo.findById(id);
  if (!existing) throw notFound('Oportunidade');
  return repo.deleteById(id);
}

export async function getActivities(
  opportunityId: string
): Promise<OpportunityActivity[]> {
  const existing = await repo.findById(opportunityId);
  if (!existing) throw notFound('Oportunidade');
  return repo.findActivities(opportunityId);
}
