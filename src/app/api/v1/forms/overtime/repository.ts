import { createSupabaseAdmin } from '../../_lib/supabase-server';
import type { OvertimeRequest, CreateOvertimeInput, UpdateOvertimeInput } from './types';

const TABLE = 'overtime_requests';

export async function findAll(): Promise<OvertimeRequest[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as OvertimeRequest[];
}

export async function findById(id: string): Promise<OvertimeRequest | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as OvertimeRequest | null;
}

export async function insert(input: CreateOvertimeInput): Promise<OvertimeRequest> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as OvertimeRequest;
}

export async function updateById(
  id: string,
  input: UpdateOvertimeInput
): Promise<OvertimeRequest> {
  const supabase = createSupabaseAdmin();

  const updatePayload: Record<string, unknown> = { ...input };
  if (input.status === 'approved' || input.status === 'rejected') {
    updatePayload.approved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as OvertimeRequest;
}

export async function deleteById(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
