import { createSupabaseAdmin } from '../../_lib/supabase-server';
import type { CatalogItem, CreateItemInput, UpdateItemInput } from './types';

const TABLE = 'items';

export async function findAll(): Promise<CatalogItem[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as CatalogItem[];
}

export async function findById(id: string): Promise<CatalogItem | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as CatalogItem | null;
}

export async function insert(input: CreateItemInput): Promise<CatalogItem> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as CatalogItem;
}

export async function updateById(
  id: string,
  input: UpdateItemInput
): Promise<CatalogItem> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CatalogItem;
}

export async function softDelete(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
