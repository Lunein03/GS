import { createSupabaseAdmin } from '../../_lib/supabase-server';
import type {
  Opportunity,
  OpportunityActivity,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  OpportunityStatus,
} from './types';

const TABLE = 'opportunities';
const ACTIVITIES_TABLE = 'opportunity_activities';

export async function findAll(): Promise<Opportunity[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Opportunity[];
}

export async function findById(id: string): Promise<Opportunity | null> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Opportunity | null;
}

export async function insert(input: CreateOpportunityInput): Promise<Opportunity> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Opportunity;
}

export async function updateById(
  id: string,
  input: UpdateOpportunityInput
): Promise<Opportunity> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Opportunity;
}

export async function deleteById(id: string): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}

export async function insertActivity(input: {
  opportunity_id: string;
  action: string;
  from_status?: OpportunityStatus | null;
  to_status?: OpportunityStatus | null;
  notes?: string | null;
  user_id?: string | null;
}): Promise<OpportunityActivity> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(ACTIVITIES_TABLE)
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as OpportunityActivity;
}

export async function findActivities(
  opportunityId: string
): Promise<OpportunityActivity[]> {
  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase
    .from(ACTIVITIES_TABLE)
    .select('*')
    .eq('opportunity_id', opportunityId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as OpportunityActivity[];
}
