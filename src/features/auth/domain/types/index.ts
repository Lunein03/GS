// Roles do sistema
export type UserRole = 'dono' | 'admin' | 'rh' | 'colaborador';

// Perfil do usuário (camelCase — domínio frontend)
export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipo da API (snake_case do Supabase) — uso interno no api/
export interface ApiUserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

// Permissão de rota
export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  /** Rota tem layout próprio (esconde navbar/footer). Default: false */
  fullScreen?: boolean;
  /** Módulo aparece como seção na home page. Default: false */
  showOnHome?: boolean;
}

// Estado do auth context
export interface AuthState {
  user: import('@supabase/supabase-js').User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isApproved: boolean;
}
