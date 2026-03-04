# 📋 Desenvolvimento — Sistema de Login e RBAC (Feature Componentizada)

> Specs técnicas e to-dos por parte. O sistema de auth é uma **feature componentizada** em `src/features/auth/`, seguindo o mesmo padrão arquitetural de `gs-propostas/`, `patrimonio/` e `drive-qr/`.

---

## PARTE 1: Banco de Dados (Supabase)

### 1.1 — Tabela `user_profiles`

**Objetivo:** Armazenar perfil e role de cada usuário com FK para `auth.users`.

```sql
-- sql/007_user_profiles.sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'colaborador'
    CHECK (role IN ('dono', 'admin', 'rh', 'colaborador')),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_approved ON public.user_profiles(is_approved);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

**To-dos:**

- [ ] Executar SQL no Supabase Dashboard → SQL Editor
- [ ] Verificar tabela criada em Table Editor
- [ ] Inserir registro manual de teste para o DONO (primeiro usuário)

---

### 1.2 — Row Level Security (RLS)

**Objetivo:** Garantir que dados de perfis sejam acessíveis apenas conforme as regras.

```sql
-- sql/008_rls_policies.sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Usuário autenticado pode LER seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admin e Dono podem LER todos os perfis
CREATE POLICY "Admin can view all profiles"
  ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'dono')
    )
  );

-- Admin e Dono podem ATUALIZAR qualquer perfil
CREATE POLICY "Admin can update profiles"
  ON public.user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'dono')
    )
  );

-- Ninguém deleta perfis (soft delete ou nunca)
-- INSERT é feito apenas pelo trigger (service_role)
CREATE POLICY "Service role can insert profiles"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (true);
```

**To-dos:**

- [ ] Executar SQL no Supabase Dashboard
- [ ] Testar com `anon` key → não vê perfis de outros
- [ ] Testar com usuário admin → vê todos os perfis
- [ ] Verificar que INSERT via trigger funciona

---

### 1.3 — Trigger de Auto-Criação de Perfil + RPCs Admin

**Objetivo:** Quando alguém faz signup no Supabase Auth, um perfil é criado automaticamente com `role: 'colaborador'` e `is_approved: false`.

```sql
-- sql/009_admin_functions.sql

-- Função chamada automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, email, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    'colaborador',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger no auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função RPC para admin aprovar usuário
CREATE OR REPLACE FUNCTION public.approve_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'dono')
  ) THEN
    RAISE EXCEPTION 'Permission denied: only admin or dono can approve users';
  END IF;

  UPDATE public.user_profiles
  SET is_approved = true, updated_at = now()
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função RPC para admin mudar role
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'dono')
  ) THEN
    RAISE EXCEPTION 'Permission denied: only admin or dono can change roles';
  END IF;

  IF new_role NOT IN ('dono', 'admin', 'rh', 'colaborador') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  UPDATE public.user_profiles
  SET role = new_role, updated_at = now()
  WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função RPC para rejeitar usuário
CREATE OR REPLACE FUNCTION public.reject_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'dono')
  ) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  DELETE FROM public.user_profiles WHERE user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**To-dos:**

- [ ] Executar SQL no Supabase Dashboard
- [ ] Testar signup → verificar se `user_profiles` tem novo registro
- [ ] Testar RPC `approve_user` como admin
- [ ] Testar RPC `update_user_role` como admin
- [ ] Criar primeiro usuário DONO manualmente no SQL Editor:
  ```sql
  UPDATE public.user_profiles
  SET role = 'dono', is_approved = true
  WHERE email = 'SEU_EMAIL_AQUI';
  ```

---

## PARTE 2: Domain Layer — `src/features/auth/domain/`

> **Padrão seguido:** `gs-propostas/domain/types/index.ts` e `patrimonio/domain/validators.ts`

### 2.1 — Tipos de Domínio `domain/types/index.ts`

**Localização:** `src/features/auth/domain/types/index.ts`

**Spec:**

```typescript
// Roles do sistema
export type UserRole = 'dono' | 'admin' | 'rh' | 'colaborador';

// Perfil do usuário (mapeado de user_profiles)
export interface UserProfile {
  id: string;
  userId: string;       // camelCase (convertido de user_id)
  fullName: string;     // camelCase (convertido de full_name)
  email: string;
  role: UserRole;
  isApproved: boolean;  // camelCase (convertido de is_approved)
  createdAt: string;    // camelCase (convertido de created_at)
  updatedAt: string;    // camelCase (convertido de updated_at)
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
}

// Estado do auth context
export interface AuthState {
  user: import('@supabase/supabase-js').User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isApproved: boolean;
}
```

> **Nota:** Seguimos o padrão do projeto de ter `ApiType` (snake_case) + mapper → `DomainType` (camelCase), exatamente como `gs-propostas/api/opportunities.ts` e `patrimonio/api/equipment.ts`.

**To-dos:**

- [ ] Criar arquivo `src/features/auth/domain/types/index.ts`
- [ ] Verificar TypeScript compila sem erro

---

### 2.2 — Schemas de Validação `domain/validators.ts`

**Localização:** `src/features/auth/domain/validators.ts`

**Spec:** (mesmo padrão de `patrimonio/domain/validators.ts`)

```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirme a senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
```

**To-dos:**

- [ ] Criar arquivo `src/features/auth/domain/validators.ts`
- [ ] Verificar TypeScript compila sem erro

---

### 2.3 — Query Keys `domain/query-keys.ts`

**Localização:** `src/features/auth/domain/query-keys.ts`

**Spec:** (mesmo padrão de `gs-propostas/domain/query-keys.ts`)

```typescript
export const authKeys = {
  all: ['auth'] as const,
  profile: (userId: string) => ['auth', 'profile', userId] as const,
  users: () => ['auth', 'users'] as const,
  pendingUsers: () => ['auth', 'users', 'pending'] as const,
};
```

**To-dos:**

- [ ] Criar arquivo `src/features/auth/domain/query-keys.ts`

---

## PARTE 3: Config — `src/features/auth/config/`

### 3.1 — Configuração RBAC `config/auth-config.ts`

**Localização:** `src/features/auth/config/auth-config.ts`

**Spec:** (mesmo padrão de `gs-propostas/config/constants.ts`)

```typescript
import type { UserRole, RoutePermission } from '../domain/types';

// Rotas públicas (não precisam de auth)
export const PUBLIC_ROUTES = ['/login', '/register', '/acesso-restrito'];

// Rotas que devem ser ignoradas pelo middleware
export const IGNORED_ROUTES = [
  '/_next',
  '/images',
  '/fonts',
  '/api/v1',
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml',
];

// Rotas protegidas com roles
export const PROTECTED_ROUTES: RoutePermission[] = [
  { path: '/gs-propostas', allowedRoles: ['dono', 'admin'] },
  { path: '/patrimonio', allowedRoles: ['dono', 'admin', 'rh'] },
  { path: '/drive-qr', allowedRoles: ['dono', 'admin', 'rh', 'colaborador'] },
  { path: '/formularios', allowedRoles: ['dono', 'admin', 'rh', 'colaborador'] },
  { path: '/admin', allowedRoles: ['dono', 'admin'] },
];

// Módulos da home page com roles (para ProtectedSection)
export const HOME_MODULES = {
  'gs-propostas': ['dono', 'admin'] as UserRole[],
  'patrimonio': ['dono', 'admin', 'rh'] as UserRole[],
  'drive-qr': ['dono', 'admin', 'rh', 'colaborador'] as UserRole[],
  'formularios': ['dono', 'admin', 'rh', 'colaborador'] as UserRole[],
} as const;

// Helper para verificar permissão
export function hasAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

// Helper para encontrar permissão de rota
export function getRoutePermission(pathname: string): RoutePermission | undefined {
  return PROTECTED_ROUTES.find((route) => pathname.startsWith(route.path));
}

// Helper para verificar se é rota pública
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

// Helper para verificar se deve ser ignorada pelo middleware
export function isIgnoredRoute(pathname: string): boolean {
  return IGNORED_ROUTES.some((route) => pathname.startsWith(route));
}
```

**To-dos:**

- [ ] Criar arquivo `src/features/auth/config/auth-config.ts`
- [ ] Verificar TypeScript compila sem erro
- [ ] Unit test: `hasAccess('colaborador', ['dono', 'admin'])` → `false`
- [ ] Unit test: `hasAccess('admin', ['dono', 'admin'])` → `true`

---

## PARTE 4: Server Layer — `src/features/auth/server/`

### 4.1 — Supabase Server Client `server/supabase-server.ts`

**Localização:** `src/features/auth/server/supabase-server.ts`

**Spec:**

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll pode falhar em Server Components (read-only)
            // É seguro ignorar em Server Components — funciona em Middleware e Route Handlers
          }
        },
      },
    }
  );
}
```

> **Dependência:** `@supabase/ssr` (✅ já instalado no package.json)

**To-dos:**

- [ ] Criar arquivo `src/features/auth/server/supabase-server.ts`
- [ ] Verificar import em Server Component funciona
- [ ] Verificar import em `middleware.ts` funciona

---

## PARTE 5: API Layer — `src/features/auth/api/`

> **Padrão seguido:** `gs-propostas/api/proposals.ts` (Supabase direto, sem fetchApi)

### 5.1 — API de Autenticação `api/auth.ts`

**Localização:** `src/features/auth/api/auth.ts`

**Spec:**

```typescript
import { supabase } from '@/shared/lib/supabase-client';
import type { LoginFormData, RegisterFormData } from '../domain/validators';

// Sign in com email e senha
export async function signInWithEmail({ email, password }: LoginFormData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign up com email, senha e metadata
export async function signUpWithEmail({ fullName, email, password }: Omit<RegisterFormData, 'confirmPassword'>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}
```

**To-dos:**

- [ ] Criar arquivo `src/features/auth/api/auth.ts`
- [ ] Testar: `signInWithEmail` com credenciais válidas
- [ ] Testar: `signUpWithEmail` cria conta + profile

---

### 5.2 — API de Perfis `api/profiles.ts`

**Localização:** `src/features/auth/api/profiles.ts`

**Spec:**

```typescript
import { supabase } from '@/shared/lib/supabase-client';
import type { UserProfile, ApiUserProfile } from '../domain/types';

// Mapper: snake_case (API) → camelCase (Domain)
// Padrão seguido: gs-propostas/api/opportunities.ts (mapOpportunity)
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

// Buscar perfil do usuário atual
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return mapProfile(data as ApiUserProfile);
}

// Listar todos os perfis (admin only — RLS garante)
export async function getAllProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ApiUserProfile[]).map(mapProfile);
}

// Aprovar usuário (via Supabase RPC)
export async function approveUser(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('approve_user', {
    target_user_id: targetUserId,
  });
  if (error) throw error;
}

// Rejeitar usuário (via Supabase RPC)
export async function rejectUser(targetUserId: string): Promise<void> {
  const { error } = await supabase.rpc('reject_user', {
    target_user_id: targetUserId,
  });
  if (error) throw error;
}

// Alterar role (via Supabase RPC)
export async function updateUserRole(targetUserId: string, newRole: string): Promise<void> {
  const { error } = await supabase.rpc('update_user_role', {
    target_user_id: targetUserId,
    new_role: newRole,
  });
  if (error) throw error;
}
```

**To-dos:**

- [ ] Criar arquivo `src/features/auth/api/profiles.ts`
- [ ] Testar: `getUserProfile` retorna perfil do usuário logado
- [ ] Testar: `getAllProfiles` retorna todos (como admin)
- [ ] Testar: `approveUser` via RPC funciona

---

## PARTE 6: Hooks — `src/features/auth/hooks/`

> **Padrão seguido:** `drive-qr/hooks/drive-qr-provider.tsx` (Context ativo) + `patrimonio/hooks/use-equipment.ts` (React Query)

### 6.1 — Auth Provider `hooks/auth-provider.tsx`

**Localização:** `src/features/auth/hooks/auth-provider.tsx`

**Spec:**

```typescript
'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { supabase } from '@/shared/lib/supabase-client';
import { getUserProfile } from '../api/profiles';
import type { UserProfile, UserRole } from '../domain/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isApproved: boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch profile quando user muda
  useEffect(() => {
    const fetchProfile = async (userId: string) => {
      try {
        const userProfile = await getUserProfile(userId);
        setProfile(userProfile);
      } catch {
        setProfile(null);
      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    router.push('/login');
  }, [router]);

  // useMemo para evitar re-renders desnecessários (PARTE 8 — performance)
  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      isLoading,
      isApproved: profile?.isApproved ?? false,
      signOut: handleSignOut,
    }),
    [user, profile, isLoading, handleSignOut]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
```

**To-dos:**

- [ ] Criar `src/features/auth/hooks/auth-provider.tsx`
- [ ] Integrar no `root-layout.tsx` (wrap children com `<AuthProvider>`)
- [ ] Testar: `useAuth()` disponível em qualquer componente client
- [ ] Testar: Logout funciona e redireciona para `/login`

---

### 6.2 — Hook `hooks/use-auth.ts`

**Localização:** `src/features/auth/hooks/use-auth.ts`

**Spec:** (mesmo padrão de `drive-qr/hooks/use-drive-qr-context.ts`)

```typescript
'use client';

import { useContext } from 'react';
import { AuthContext } from './auth-provider';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
```

**To-dos:**

- [ ] Criar `src/features/auth/hooks/use-auth.ts`

---

## PARTE 7: UI Components — `src/features/auth/ui/`

> **Padrão seguido:** `gs-propostas/ui/components/` e `gs-propostas/ui/layout/`

### 7.1 — Layout Auth `ui/layout/auth-layout.tsx`

**Localização:** `src/features/auth/ui/layout/auth-layout.tsx`

**Spec:**

- Background escuro com noise (reutilizar `BackgroundNoiseOverlay`)
- Logo GS Produções centralizada no topo
- Sem navbar, sem footer
- Conteúdo centralizado vertical e horizontalmente
- Responsivo (mobile-first)

**Componentes reutilizáveis do projeto:**

- `BackgroundNoiseOverlay` de `@/shared/ui/background-snippets-noise-effect11`
- Imagens: `/images/gs-logo.svg` e `/images/gs-logo-2.svg`

**To-dos:**

- [ ] Criar `src/features/auth/ui/layout/auth-layout.tsx`
- [ ] Verificar visual no navegador (dark + light mode)
- [ ] Confirmar: sem navbar, sem footer

---

### 7.2 — Login Form `ui/components/login-form.tsx`

**Localização:** `src/features/auth/ui/components/login-form.tsx`

**Spec:**

- Campos: **Email** (type email) + **Senha** (type password, toggle visibility)
- Botão "Entrar" → chama `signInWithEmail()` de `../api/auth`
- Link "Não tem conta? Cadastre-se" → `/register`
- Validação com `loginSchema` de `../domain/validators`
- Loading state no botão durante submit
- Toast de erro/sucesso via `sonner`

**Fluxo:**

1. Submit → `signInWithEmail()`
2. Se erro → toast com mensagem
3. Se sucesso → buscar profile via `getUserProfile()`
4. Se NÃO aprovado → signOut + mostrar `PendingApprovalCard`
5. Se aprovado → `router.push('/')`

**Componentes reutilizáveis:**

- `Button` de `@/shared/ui/button`
- `Input` de `@/shared/ui/input`
- `Label` de `@/shared/ui/label`
- `toast` de `sonner`

**To-dos:**

- [ ] Criar `src/features/auth/ui/components/login-form.tsx`
- [ ] Integrar com Zod + react-hook-form
- [ ] Testar login válido → redirect para home
- [ ] Testar login inválido → mensagem de erro
- [ ] Testar conta não aprovada → mensagem "aguardando aprovação"
- [ ] Testar responsividade em mobile
- [ ] Verificar tab navigation (acessibilidade)

---

### 7.3 — Register Form `ui/components/register-form.tsx`

**Localização:** `src/features/auth/ui/components/register-form.tsx`

**Spec:**

- Campos: **Nome Completo**, **Email**, **Senha**, **Confirmar Senha**
- Botão "Criar Conta" → chama `signUpWithEmail()` de `../api/auth`
- Link "Já tem conta? Faça login" → `/login`
- Validação com `registerSchema` de `../domain/validators`
- Após cadastro → mostrar `PendingApprovalCard`

**To-dos:**

- [ ] Criar `src/features/auth/ui/components/register-form.tsx`
- [ ] Integrar com Zod + react-hook-form
- [ ] Testar cadastro → perfil criado com `is_approved=false`
- [ ] Testar validação de campos
- [ ] Testar email duplicado → mensagem de erro

---

### 7.4 — Protected Section `ui/components/protected-section.tsx`

**Localização:** `src/features/auth/ui/components/protected-section.tsx`

**Spec:**

```typescript
'use client';

import type { ReactNode } from 'react';
import type { UserRole } from '../../domain/types';
import { useAuth } from '../../hooks/use-auth';

interface ProtectedSectionProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedSection({ allowedRoles, children, fallback = null }: ProtectedSectionProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) return null;
  if (!role || !allowedRoles.includes(role)) return <>{fallback}</>;

  return <>{children}</>;
}
```

**To-dos:**

- [ ] Criar componente `ProtectedSection`
- [ ] Testar: `colaborador` NÃO vê `GsPropostasSection`
- [ ] Testar: `admin` vê TODOS os módulos

---

### 7.5 — Access Denied `ui/components/access-denied.tsx`

**Localização:** `src/features/auth/ui/components/access-denied.tsx`

**Spec:**

- Ícone `ShieldAlert` de `lucide-react`
- Título: "Acesso Restrito"
- Mensagem: "Você não tem permissão para acessar esta área."
- Botão "Voltar para início" → Link para `/`
- Componentes: `Card`, `Button` de `@/shared/ui/`

**To-dos:**

- [ ] Criar componente `AccessDenied`

---

### 7.6 — User Dropdown `ui/components/user-dropdown.tsx`

**Localização:** `src/features/auth/ui/components/user-dropdown.tsx`

**Spec:**

- Avatar com iniciais do nome
- `DropdownMenu` com: Nome completo, Role badge, Separador, "Sair"
- `useAuth()` → `profile`, `signOut`
- Componentes: `DropdownMenu` de `@/shared/ui/dropdown-menu`, `Button` de `@/shared/ui/button`

**To-dos:**

- [ ] Criar `user-dropdown.tsx`
- [ ] Testar: Dropdown aparece com nome + role + logout
- [ ] Testar: Logout funcional

---

### 7.7 — Pending Approval Card `ui/components/pending-approval-card.tsx`

**Localização:** `src/features/auth/ui/components/pending-approval-card.tsx`

**Spec:**

- Card informativo: "Conta criada! Aguardando aprovação do administrador."
- Ícone `Clock` de `lucide-react`
- Botão "Voltar ao login" → `/login`

**To-dos:**

- [ ] Criar `pending-approval-card.tsx`

---

### 7.8 — Componentes Admin `ui/components/admin/`

**Localização:** `src/features/auth/ui/components/admin/`

**Arquivos:**

- `users-table.tsx` — Tabela de usuários: Nome | Email | Role | Status | Ações
- `approve-reject-actions.tsx` — Botões aprovar ✅ / rejeitar ❌ com `AlertDialog` de confirmação
- `role-select.tsx` — Select dropdown com roles (`dono`, `admin`, `rh`, `colaborador`)

**Componentes reutilizáveis:**

- `supabase.rpc('approve_user', ...)` e `supabase.rpc('update_user_role', ...)`
- `AlertDialog` de `@/shared/ui/alert-dialog`
- `Select` de `@/shared/ui/select`
- `toast` de `sonner`
- Badges com Tailwind para status: "Aprovado" (verde) / "Pendente" (amarelo)

**To-dos:**

- [ ] Criar `users-table.tsx`
- [ ] Criar `approve-reject-actions.tsx` com confirmação via AlertDialog
- [ ] Criar `role-select.tsx`
- [ ] Testar: Aprovar usuário pendente → status muda
- [ ] Testar: Mudar role → acesso do usuário muda
- [ ] Testar: Responsividade da tabela

---

## PARTE 8: Pages — `src/features/auth/pages/`

> **Padrão seguido:** `gs-propostas/pages/dashboard/dashboard-page.tsx`

### 8.1 — Login Page `pages/login-page.tsx`

**Composição:** AuthLayout wrapping + LoginForm

### 8.2 — Register Page `pages/register-page.tsx`

**Composição:** AuthLayout wrapping + RegisterForm

### 8.3 — Access Denied Page `pages/access-denied-page.tsx`

**Composição:** AccessDenied card + layout

### 8.4 — Admin Users Page `pages/admin/admin-users-page.tsx`

**Composição:** UsersTable + ApproveRejectActions + RoleSelect

**To-dos:**

- [ ] Criar `pages/login-page.tsx`
- [ ] Criar `pages/register-page.tsx`
- [ ] Criar `pages/access-denied-page.tsx`
- [ ] Criar `pages/admin/admin-users-page.tsx`

---

## PARTE 9: Barrel Exports — `src/features/auth/app/index.ts`

> **Padrão seguido:** `gs-propostas/app/index.ts`, `patrimonio/app/index.ts`

**Localização:** `src/features/auth/app/index.ts`

```typescript
// Layout
export { AuthLayout } from '../ui/layout/auth-layout';

// Pages
export { LoginPage } from '../pages/login-page';
export { RegisterPage } from '../pages/register-page';
export { AccessDeniedPage } from '../pages/access-denied-page';
export { AdminUsersPage } from '../pages/admin/admin-users-page';

// Components (re-export para uso externo)
export { ProtectedSection } from '../ui/components/protected-section';
export { UserDropdown } from '../ui/components/user-dropdown';
export { AccessDenied } from '../ui/components/access-denied';

// Hooks (re-export para uso externo)
export { AuthProvider } from '../hooks/auth-provider';
export { useAuth } from '../hooks/use-auth';

// Config (re-export para uso externo)
export { HOME_MODULES, hasAccess } from '../config/auth-config';

// Types (re-export para uso externo)
export type { UserRole, UserProfile, AuthState } from '../domain/types';
```

**To-dos:**

- [ ] Criar `src/features/auth/app/index.ts`
- [ ] Verificar que todos os exports resolvem sem erro

---

## PARTE 10: Integração App Router (Thin Wrappers)

> **Padrão seguido:** Re-exports de 1 linha, como todos os outros módulos do workspace

### 10.1 — Auth Route Group Pages

```tsx
// src/app/(auth)/layout.tsx
export { AuthLayout as default } from '@/features/auth/app';

// src/app/(auth)/login/page.tsx
export { LoginPage as default } from '@/features/auth/app';

// src/app/(auth)/register/page.tsx
export { RegisterPage as default } from '@/features/auth/app';

// src/app/(auth)/acesso-restrito/page.tsx
export { AccessDeniedPage as default } from '@/features/auth/app';
```

### 10.2 — Admin Route Pages

```tsx
// src/app/(workspace)/admin/layout.tsx
// Layout simples ou re-export de layout workspace

// src/app/(workspace)/admin/users/page.tsx
export { AdminUsersPage as default } from '@/features/auth/app';
```

**To-dos:**

- [ ] Criar `src/app/(auth)/layout.tsx` (1 linha)
- [ ] Criar `src/app/(auth)/login/page.tsx` (1 linha)
- [ ] Criar `src/app/(auth)/register/page.tsx` (1 linha)
- [ ] Criar `src/app/(auth)/acesso-restrito/page.tsx` (1 linha)
- [ ] Criar `src/app/(workspace)/admin/layout.tsx`
- [ ] Criar `src/app/(workspace)/admin/users/page.tsx` (1 linha)

---

### 10.3 — Middleware `src/middleware.ts`

**Localização:** `src/middleware.ts` (⚠️ requerimento Next.js — não pode ficar dentro da feature)

**Spec:**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import {
  isPublicRoute,
  isIgnoredRoute,
  getRoutePermission,
  hasAccess,
} from '@/features/auth/config/auth-config';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Ignorar assets estáticos e API routes
  if (isIgnoredRoute(pathname)) {
    return NextResponse.next();
  }

  // 2. Criar Supabase client para middleware
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  // 4. Se rota é pública
  if (isPublicRoute(pathname)) {
    // Se logado e tenta acessar /login → redirect para /
    if (user && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // 5. Se não tem session → redirect /login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 6. Buscar profile para verificar role e aprovação
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, is_approved')
    .eq('user_id', user.id)
    .single();

  // 7. Se não aprovado → redirect /acesso-restrito
  if (!profile?.is_approved) {
    if (pathname !== '/acesso-restrito') {
      return NextResponse.redirect(new URL('/acesso-restrito', request.url));
    }
    return response;
  }

  // 8. Verificar permissão de rota
  const routePermission = getRoutePermission(pathname);
  if (routePermission && !hasAccess(profile.role, routePermission.allowedRoles)) {
    return NextResponse.redirect(new URL('/acesso-restrito', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|fonts|api/v1|manifest.json).*)',
  ],
};
```

**To-dos:**

- [ ] Criar `src/middleware.ts`
- [ ] Testar: Acesso a `/gs-propostas` sem login → redirect `/login`
- [ ] Testar: Colaborador acessando `/gs-propostas` → redirect `/acesso-restrito`
- [ ] Testar: Admin acessando `/gs-propostas` → OK
- [ ] Testar: Usuário logado acessando `/login` → redirect `/`
- [ ] Testar: Assets estáticos continuam carregando normalmente
- [ ] Testar: API rewrites `/api/v1/*` continuam funcionando

---

### 10.4 — Atualizar `root-layout.tsx`

**Alteração:** Adicionar `AuthProvider` de `@/features/auth/hooks/auth-provider`

```diff
+ import { AuthProvider } from '@/features/auth/hooks/auth-provider';

  <QueryProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
+     <AuthProvider>
        <ParallaxBackground />
        <div className="flex min-h-screen flex-col overflow-x-hidden">
          <ConditionalNavbar />
          <MainContent>{children}</MainContent>
          <ConditionalFooter />
        </div>
+     </AuthProvider>
    </ThemeProvider>
  </QueryProvider>
```

**To-dos:**

- [ ] Atualizar `root-layout.tsx` com AuthProvider

---

### 10.5 — Atualizar `conditional-navbar.tsx`

**Alteração:** Adicionar rotas de auth ao `hideNavbarOnModules`

```diff
- const hideNavbarOnModules = ['/patrimonio', '/drive-qr', '/gs-propostas']
+ const hideNavbarOnModules = ['/patrimonio', '/drive-qr', '/gs-propostas', '/login', '/register', '/acesso-restrito']
```

**To-dos:**

- [ ] Atualizar `conditional-navbar.tsx`

---

### 10.6 — Atualizar `page.tsx` (Home)

**Alteração:** Wrap seções com `ProtectedSection`

```tsx
'use client';

import { ProtectedSection, HOME_MODULES } from '@/features/auth/app';
import { DriveQrSection } from '@/shared/components/drive-qr-section';
import { HeroSection } from '@/shared/components/hero-section';
import { PatrimonioSection } from '@/shared/components/patrimonio-section';
import { GsPropostasSection } from '@/shared/components/gs-propostas-section';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProtectedSection allowedRoles={HOME_MODULES['drive-qr']}>
        <DriveQrSection />
      </ProtectedSection>
      <ProtectedSection allowedRoles={HOME_MODULES['gs-propostas']}>
        <GsPropostasSection />
      </ProtectedSection>
      <ProtectedSection allowedRoles={HOME_MODULES['patrimonio']}>
        <PatrimonioSection />
      </ProtectedSection>
    </>
  );
}
```

**To-dos:**

- [ ] Atualizar `page.tsx` com ProtectedSection
- [ ] Testar: Login como colaborador → vê apenas Drive QR + Formulários
- [ ] Testar: Login como dono → vê tudo

---

### 10.7 — Atualizar `navbar.tsx`

**Alteração:** Adicionar `UserDropdown` de `@/features/auth/ui/components/user-dropdown`

**To-dos:**

- [ ] Atualizar `navbar.tsx` com `UserDropdown`
- [ ] Testar: Nome do usuário aparece na navbar
- [ ] Testar: Logout funcional via dropdown

---

## PARTE 11: Variáveis de Ambiente

### 11.1 — `.env.local` (dev)

```env
# Supabase (já existem)
NEXT_PUBLIC_SUPABASE_URL=https://ohlyygukvmqbsfmwxbaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

> **Nota:** A `anon key` é pública e segura para usar no client-side. A segurança vem do RLS.  
> **NUNCA** usar `service_role` key no frontend.

**To-dos:**

- [ ] Verificar que `.env.local` tem `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Verificar `.env_vercel` para produção
- [ ] Confirmar que **nenhum segredo** está commitado no Git

---

## PARTE 12: Otimização e Verificação Final

### 12.1 — Verificar Barrel Exports

- [ ] Todos os imports externos da feature usam `@/features/auth/app` ou paths diretos
- [ ] Não há imports circulares

### 12.2 — Verificar Middleware

- [ ] Middleware importa apenas `@supabase/ssr` e config da feature
- [ ] Middleware NÃO importa React, hooks, ou libs client-side

### 12.3 — Verificar Performance

- [ ] `useMemo` no context value do AuthProvider ✅
- [ ] `useCallback` no signOut ✅
- [ ] `npm run build` sem erros
- [ ] Bundle size similar ao atual

### 12.4 — Verificação Final

- [ ] Lint: `npm run lint` sem erros
- [ ] Build: `npm run build` sem erros
- [ ] Security: Sem credenciais hardcoded; RLS ativo
- [ ] UX: Fluxo login → home → módulo fluido e responsivo
- [ ] Responsividade: Login e cadastro funcionam em mobile
- [ ] Acessibilidade: Labels em inputs, tab navigation

---

## ✅ Checklist de Entrega por Fase

| Fase                        | Status | Critério de Aceite                                    |
| --------------------------- | ------ | ----------------------------------------------------- |
| PARTE 1 - DB                | ⬜     | Tabela + RLS + Trigger criados e testados             |
| PARTE 2 - Domain            | ⬜     | types + validators + query-keys                       |
| PARTE 3 - Config            | ⬜     | auth-config.ts com RBAC funcional                     |
| PARTE 4 - Server            | ⬜     | supabase-server.ts (SSR client)                       |
| PARTE 5 - API               | ⬜     | auth.ts + profiles.ts com Supabase direto             |
| PARTE 6 - Hooks             | ⬜     | AuthProvider + useAuth hook funcionais                |
| PARTE 7 - UI Components     | ⬜     | Forms, ProtectedSection, AccessDenied, UserDropdown   |
| PARTE 8 - Pages             | ⬜     | Login, Register, AccessDenied, Admin pages            |
| PARTE 9 - Barrel            | ⬜     | app/index.ts com todos os exports                     |
| PARTE 10 - Integração       | ⬜     | App Router wrappers + Middleware + root-layout         |
| PARTE 11 - Env              | ⬜     | Variáveis configuradas corretamente                   |
| PARTE 12 - Performance      | ⬜     | Bundle otimizado, sem re-renders                      |

---

## 🧭 Ordem de Execução Recomendada

```
 1. PARTE 11 (Env)           →  5 min  — Garantir keys corretas
 2. PARTE 1  (DB)            → 15 min  — SQL no Supabase Dashboard
 3. PARTE 2  (Domain)        → 10 min  — Types, validators, query-keys
 4. PARTE 3  (Config)        →  5 min  — auth-config.ts
 5. PARTE 4  (Server)        →  5 min  — supabase-server.ts
 6. PARTE 5  (API)           → 10 min  — auth.ts + profiles.ts
 7. PARTE 6  (Hooks)         → 15 min  — AuthProvider + useAuth
 8. PARTE 7  (UI Components) → 30 min  — Forms, cards, components
 9. PARTE 8  (Pages)         → 10 min  — Composição de pages
10. PARTE 9  (Barrel)        →  5 min  — app/index.ts
11. PARTE 10 (Integração)    → 25 min  — App Router + Middleware + root-layout
12. PARTE 12 (Performance)   → 10 min  — Otimização final
```

**Tempo total estimado: ~2h25min**

---

## Mapa Visual da Feature

```
src/features/auth/
│
├── api/                          ← Supabase direto (padrão proposals.ts)
│   ├── auth.ts                      signIn, signUp, signOut
│   └── profiles.ts                  getUserProfile, getAllProfiles, RPCs
│
├── app/                          ← Barrel exports (padrão do projeto)
│   └── index.ts                     re-exports de tudo
│
├── config/                       ← Constantes RBAC
│   └── auth-config.ts               PROTECTED_ROUTES, HOME_MODULES, hasAccess()
│
├── domain/                       ← Tipos puros, schemas Zod, query keys
│   ├── types/index.ts               UserRole, UserProfile, RoutePermission
│   ├── validators.ts                loginSchema, registerSchema
│   └── query-keys.ts               authKeys
│
├── hooks/                        ← Context + hooks
│   ├── auth-provider.tsx            AuthProvider (Context)
│   └── use-auth.ts                  useAuth()
│
├── pages/                        ← Composição de pages
│   ├── login-page.tsx
│   ├── register-page.tsx
│   ├── access-denied-page.tsx
│   └── admin/
│       └── admin-users-page.tsx
│
├── server/                       ← SSR helpers
│   └── supabase-server.ts          createSupabaseServerClient()
│
└── ui/                           ← Componentes visuais
    ├── components/
    │   ├── login-form.tsx
    │   ├── register-form.tsx
    │   ├── access-denied.tsx
    │   ├── protected-section.tsx
    │   ├── user-dropdown.tsx
    │   ├── pending-approval-card.tsx
    │   └── admin/
    │       ├── users-table.tsx
    │       ├── approve-reject-actions.tsx
    │       └── role-select.tsx
    └── layout/
        └── auth-layout.tsx
```
