import { createSupabaseAdmin } from '../../_lib/supabase-server';
import type {
  Client,
  ClientSecondaryContact,
  CreateClientInput,
  UpdateClientInput,
  CreateContactInput,
  UpdateContactInput,
} from './types';

const TABLE = 'clients';
const CONTACTS_TABLE = 'client_secondary_contacts';

export async function findAll(search?: string): Promise<Client[]> {
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from(TABLE)
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(
      `contato_nome.ilike.%${search}%,contato_email.ilike.%${search}%,cpf_cnpj.ilike.%${search}%,nome.ilike.%${search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Client[];
}

export async function findById(id: string): Promise<Client | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as Client | null;
}

export async function findByCpfCnpj(cpfCnpj: string): Promise<Client | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('cpf_cnpj', cpfCnpj)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return data as Client | null;
}

export async function insert(input: CreateClientInput): Promise<Client> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.from(TABLE).insert(input).select().single();
  if (error) throw error;
  return data as Client;
}

export async function updateById(id: string, input: UpdateClientInput): Promise<Client> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Client;
}

export async function softDelete(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString(), ativo: 0 })
    .eq('id', id);

  if (error) throw error;
}

// --- Contacts ---

export async function findContacts(clientId: string): Promise<ClientSecondaryContact[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(CONTACTS_TABLE)
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ClientSecondaryContact[];
}

export async function findContactById(id: string): Promise<ClientSecondaryContact | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(CONTACTS_TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as ClientSecondaryContact | null;
}

export async function insertContact(
  clientId: string,
  input: CreateContactInput
): Promise<ClientSecondaryContact> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(CONTACTS_TABLE)
    .insert({ ...input, client_id: clientId })
    .select()
    .single();

  if (error) throw error;
  return data as ClientSecondaryContact;
}

export async function updateContactById(
  id: string,
  input: UpdateContactInput
): Promise<ClientSecondaryContact> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(CONTACTS_TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ClientSecondaryContact;
}

export async function deleteContactById(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from(CONTACTS_TABLE).delete().eq('id', id);
  if (error) throw error;
}
