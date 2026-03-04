import * as repo from './repository';
import { notFound } from '../_lib/errors';
import type { Proposal, ProposalItem, ProposalNote, PaymentMode, ProposalSignature, ProposalHistory, ProposalStatus } from './types';
import type { z } from 'zod';
import type {
  createProposalSchema, updateProposalSchema,
  createItemSchema, updateItemSchema,
  createNoteSchema, updateNoteSchema,
  createPaymentModeSchema, updatePaymentModeSchema,
  createSignatureSchema, updateSignatureSchema,
} from './schemas';

type CreateProposalInput = z.infer<typeof createProposalSchema>;
type UpdateProposalInput = z.infer<typeof updateProposalSchema>;
type CreateItemInput = z.infer<typeof createItemSchema>;
type UpdateItemInput = z.infer<typeof updateItemSchema>;
type CreateNoteInput = z.infer<typeof createNoteSchema>;
type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
type CreatePaymentModeInput = z.infer<typeof createPaymentModeSchema>;
type UpdatePaymentModeInput = z.infer<typeof updatePaymentModeSchema>;
type CreateSignatureInput = z.infer<typeof createSignatureSchema>;
type UpdateSignatureInput = z.infer<typeof updateSignatureSchema>;

// --- Proposals ---

export async function listProposals(): Promise<Proposal[]> {
  return repo.findAllProposals();
}

export async function getProposal(id: string): Promise<Proposal & { items: ProposalItem[]; history: ProposalHistory[] }> {
  const proposal = await repo.findProposalById(id);
  if (!proposal) throw notFound('Proposta');
  const [items, history] = await Promise.all([
    repo.findItemsByProposal(id),
    repo.findHistoryByProposal(id),
  ]);
  return { ...proposal, items, history };
}

export async function createProposal(input: CreateProposalInput): Promise<Proposal> {
  const items = (input.items ?? []) as CreateItemInput[];
  const proposalData = { ...input };
  delete proposalData.items;

  const proposal = await repo.insertProposal(proposalData);

  if (items.length > 0) {
    const itemsWithProposalId = items.map((item) => ({
      ...item,
      proposal_id: proposal.id,
    }));
    await repo.insertManyItems(itemsWithProposalId);
  }

  await repo.insertHistory({
    proposal_id: proposal.id,
    event_type: 'create',
    title: 'Proposta criada',
    description: `Proposta "${proposal.title}" criada`,
  });

  return proposal;
}

export async function updateProposal(id: string, input: UpdateProposalInput): Promise<Proposal> {
  const existing = await repo.findProposalById(id);
  if (!existing) throw notFound('Proposta');

  const updated = await repo.updateProposalById(id, input);

  await repo.insertHistory({
    proposal_id: id,
    event_type: 'update',
    title: 'Proposta atualizada',
    description: `Proposta "${updated.title}" atualizada`,
  });

  return updated;
}

export async function changeProposalStatus(id: string, newStatus: ProposalStatus, userId?: string): Promise<Proposal> {
  const existing = await repo.findProposalById(id);
  if (!existing) throw notFound('Proposta');

  const updated = await repo.updateProposalById(id, { status: newStatus } as unknown as UpdateProposalInput);

  await repo.insertHistory({
    proposal_id: id,
    event_type: 'status_change',
    title: `Status alterado para ${newStatus}`,
    description: `Status alterado de ${existing.status} para ${newStatus}`,
    user_id: userId ?? null,
    meta_data: { from: existing.status, to: newStatus },
  });

  return updated;
}

export async function deleteProposal(id: string): Promise<void> {
  const existing = await repo.findProposalById(id);
  if (!existing) throw notFound('Proposta');
  return repo.deleteProposalById(id);
}

// --- Items ---

export async function addItem(proposalId: string, input: CreateItemInput): Promise<ProposalItem> {
  const proposal = await repo.findProposalById(proposalId);
  if (!proposal) throw notFound('Proposta');
  return repo.insertItem({ ...input, proposal_id: proposalId });
}

export async function updateItem(itemId: string, input: UpdateItemInput): Promise<ProposalItem> {
  const existing = await repo.findItemById(itemId);
  if (!existing) throw notFound('Item');
  return repo.updateItemById(itemId, input);
}

export async function deleteItem(itemId: string): Promise<void> {
  const existing = await repo.findItemById(itemId);
  if (!existing) throw notFound('Item');
  return repo.deleteItemById(itemId);
}

// --- Notes ---

export async function listNotes(): Promise<ProposalNote[]> {
  return repo.findAllNotes();
}

export async function createNote(input: CreateNoteInput): Promise<ProposalNote> {
  return repo.insertNote(input);
}

export async function updateNote(id: string, input: UpdateNoteInput): Promise<ProposalNote> {
  const existing = await repo.findNoteById(id);
  if (!existing) throw notFound('Nota');
  return repo.updateNoteById(id, input);
}

export async function deleteNote(id: string): Promise<void> {
  const existing = await repo.findNoteById(id);
  if (!existing) throw notFound('Nota');
  return repo.softDeleteNote(id);
}

// --- Payment Modes ---

export async function listPaymentModes(): Promise<PaymentMode[]> {
  return repo.findAllPaymentModes();
}

export async function createPaymentMode(input: CreatePaymentModeInput): Promise<PaymentMode> {
  return repo.insertPaymentMode(input);
}

export async function updatePaymentMode(id: string, input: UpdatePaymentModeInput): Promise<PaymentMode> {
  const existing = await repo.findPaymentModeById(id);
  if (!existing) throw notFound('Modo de pagamento');
  return repo.updatePaymentModeById(id, input);
}

export async function deletePaymentMode(id: string): Promise<void> {
  const existing = await repo.findPaymentModeById(id);
  if (!existing) throw notFound('Modo de pagamento');
  return repo.softDeletePaymentMode(id);
}

// --- Signatures ---

export async function listSignatures(proposalId?: string): Promise<ProposalSignature[]> {
  return repo.findAllSignatures(proposalId);
}

export async function createSignature(input: CreateSignatureInput): Promise<ProposalSignature> {
  return repo.insertSignature(input);
}

export async function updateSignature(id: string, input: UpdateSignatureInput): Promise<ProposalSignature> {
  const existing = await repo.findSignatureById(id);
  if (!existing) throw notFound('Assinatura');
  return repo.updateSignatureById(id, input);
}

export async function deleteSignature(id: string): Promise<void> {
  const existing = await repo.findSignatureById(id);
  if (!existing) throw notFound('Assinatura');
  return repo.softDeleteSignature(id);
}
