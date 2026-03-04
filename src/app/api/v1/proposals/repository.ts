import { createSupabaseAdmin } from '../_lib/supabase-server';
import type {
  Proposal, ProposalItem, ProposalNote, PaymentMode,
  ProposalSignature, ProposalHistory, ProposalHistoryEventType,
} from './types';
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

export async function findAllProposals(): Promise<Proposal[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Proposal[];
}

export async function findProposalById(id: string): Promise<Proposal | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Proposal | null;
}

export async function insertProposal(input: Omit<CreateProposalInput, 'items'>): Promise<Proposal> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposals').insert(input).select().single();
  if (error) throw error;
  return data as Proposal;
}

export async function updateProposalById(id: string, input: UpdateProposalInput): Promise<Proposal> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposals').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as Proposal;
}

export async function deleteProposalById(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('proposals').delete().eq('id', id);
  if (error) throw error;
}

// --- Items ---

export async function findItemsByProposal(proposalId: string): Promise<ProposalItem[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('proposal_items')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('order', { ascending: true });
  if (error) throw error;
  return data as ProposalItem[];
}

export async function insertItem(input: CreateItemInput & { proposal_id: string }): Promise<ProposalItem> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposal_items').insert(input).select().single();
  if (error) throw error;
  return data as ProposalItem;
}

export async function insertManyItems(items: (CreateItemInput & { proposal_id: string })[]): Promise<ProposalItem[]> {
  if (items.length === 0) return [];
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposal_items').insert(items).select();
  if (error) throw error;
  return data as ProposalItem[];
}

export async function updateItemById(id: string, input: UpdateItemInput): Promise<ProposalItem> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposal_items').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as ProposalItem;
}

export async function deleteItemById(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('proposal_items').delete().eq('id', id);
  if (error) throw error;
}

export async function findItemById(id: string): Promise<ProposalItem | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposal_items').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as ProposalItem | null;
}

// --- History ---

export async function insertHistory(input: {
  proposal_id: string;
  event_type: ProposalHistoryEventType;
  title: string;
  description?: string | null;
  meta_data?: Record<string, unknown> | null;
  user_id?: string | null;
}): Promise<ProposalHistory> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposal_histories').insert(input).select().single();
  if (error) throw error;
  return data as ProposalHistory;
}

export async function findHistoryByProposal(proposalId: string): Promise<ProposalHistory[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('proposal_histories')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ProposalHistory[];
}

// --- Notes ---

export async function findAllNotes(): Promise<ProposalNote[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('proposal_notes').select('*').is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as ProposalNote[];
}

export async function findNoteById(id: string): Promise<ProposalNote | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('proposal_notes').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw error;
  return data as ProposalNote | null;
}

export async function insertNote(input: CreateNoteInput): Promise<ProposalNote> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposal_notes').insert(input).select().single();
  if (error) throw error;
  return data as ProposalNote;
}

export async function updateNoteById(id: string, input: UpdateNoteInput): Promise<ProposalNote> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposal_notes').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as ProposalNote;
}

export async function softDeleteNote(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('proposal_notes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// --- Payment Modes ---

export async function findAllPaymentModes(): Promise<PaymentMode[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('payment_modes').select('*').is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as PaymentMode[];
}

export async function findPaymentModeById(id: string): Promise<PaymentMode | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('payment_modes').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw error;
  return data as PaymentMode | null;
}

export async function insertPaymentMode(input: CreatePaymentModeInput): Promise<PaymentMode> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('payment_modes').insert(input).select().single();
  if (error) throw error;
  return data as PaymentMode;
}

export async function updatePaymentModeById(id: string, input: UpdatePaymentModeInput): Promise<PaymentMode> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('payment_modes').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as PaymentMode;
}

export async function softDeletePaymentMode(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('payment_modes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// --- Signatures ---

export async function findAllSignatures(proposalId?: string): Promise<ProposalSignature[]> {
  const supabase = createSupabaseAdmin();
  let query = supabase.from('proposal_signatures').select('*').is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (proposalId) query = query.eq('proposal_id', proposalId);
  const { data, error } = await query;
  if (error) throw error;
  return data as ProposalSignature[];
}

export async function findSignatureById(id: string): Promise<ProposalSignature | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from('proposal_signatures').select('*').eq('id', id).is('deleted_at', null).maybeSingle();
  if (error) throw error;
  return data as ProposalSignature | null;
}

export async function insertSignature(input: CreateSignatureInput): Promise<ProposalSignature> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposal_signatures').insert(input).select().single();
  if (error) throw error;
  return data as ProposalSignature;
}

export async function updateSignatureById(id: string, input: UpdateSignatureInput): Promise<ProposalSignature> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from('proposal_signatures').update(input).eq('id', id).select().single();
  if (error) throw error;
  return data as ProposalSignature;
}

export async function softDeleteSignature(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from('proposal_signatures').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}
