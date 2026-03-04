import { supabase } from '@/shared/lib/supabase-client';
import type { UserProfile, ApiUserProfile } from '../domain/types';

/**
 * Mapper: snake_case (API/Supabase) → camelCase (Domain)
 * Padrão seguido: gs-propostas/api/opportunities.ts (mapOpportunity)
 */
function mapProfile(api: ApiUserProfile): UserProfile {
  return {
    id: api.id,
    userId: api.user_id,
    fullName: api.full_name,
    email: api.email,
    role: api.role,
    isApproved: api.is_approved,
    createdAt: api.created_at,
    updatedAt: api.updated_at,
  };
}

/** Buscar perfil do usuário pelo user_id */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    // PGRST116 = no rows found (normal para usuário sem perfil ainda)
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return mapProfile(data as ApiUserProfile);
}

/** Listar todos os perfis (admin only — RLS garante) */
export async function getAllProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ApiUserProfile[]).map(mapProfile);
}

/** Listar apenas perfis pendentes de aprovação */
export async function getPendingProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('is_approved', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ApiUserProfile[]).map(mapProfile);
}

/** Aprovar usuário (via Supabase RPC) */
export async function approveUser(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('approve_user', {
    target_user_id: targetUserId,
  });
  if (error) throw error;
}

/** Rejeitar usuário (via Supabase RPC) */
export async function rejectUser(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('reject_user', {
    target_user_id: targetUserId,
  });
  if (error) throw error;
}

/** Alterar role (via Supabase RPC) */
export async function updateUserRole(targetUserId: string, newRole: string): Promise<void> {
  const { error } = await supabase.rpc('update_user_role', {
    target_user_id: targetUserId,
    new_role: newRole,
  });
  if (error) throw error;
}
