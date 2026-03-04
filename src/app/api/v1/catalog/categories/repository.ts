import { createSupabaseAdmin } from '../../_lib/supabase-server';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from './types';

const TABLE = 'categories';

export async function findAll(): Promise<Category[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Category[];
}

export async function findById(id: string): Promise<Category | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as Category | null;
}

export async function findByName(name: string): Promise<Category | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .ilike('name', name)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as Category | null;
}

export async function insert(input: CreateCategoryInput): Promise<Category> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

export async function updateById(id: string, input: UpdateCategoryInput): Promise<Category> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
}

export async function softDelete(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}
