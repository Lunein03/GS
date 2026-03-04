import { createSupabaseAdmin } from '../../_lib/supabase-server';
import type { ExpenseReport, CreateExpenseInput, UpdateExpenseInput } from './types';

const TABLE = 'expense_reports';

export async function findAll(): Promise<ExpenseReport[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ExpenseReport[];
}

export async function findById(id: string): Promise<ExpenseReport | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as ExpenseReport | null;
}

export async function insert(input: CreateExpenseInput): Promise<ExpenseReport> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as ExpenseReport;
}

export async function updateById(
  id: string,
  input: UpdateExpenseInput
): Promise<ExpenseReport> {
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
  return data as ExpenseReport;
}

export async function deleteById(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
