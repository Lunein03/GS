import { createSupabaseAdmin } from '../../_lib/supabase-server';
import type { Company, CreateCompanyInput, UpdateCompanyInput } from './types';

const TABLE = 'empresas';

export async function findAll(search?: string): Promise<Company[]> {
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from(TABLE)
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(
      `contato_nome.ilike.%${search}%,nome_fantasia.ilike.%${search}%,razao_social.ilike.%${search}%,cpf_cnpj.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Company[];
}

export async function findById(id: string): Promise<Company | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as Company | null;
}

export async function findByCpfCnpj(cpfCnpj: string): Promise<Company | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('cpf_cnpj', cpfCnpj)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as Company | null;
}

export async function insert(input: CreateCompanyInput): Promise<Company> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from(TABLE).insert(input).select().single();
  if (error) throw error;
  return data as Company;
}

export async function updateById(id: string, input: UpdateCompanyInput): Promise<Company> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Company;
}

export async function softDelete(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString(), ativo: 0 })
    .eq('id', id);

  if (error) throw error;
}
