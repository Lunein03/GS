# 🔐 Sistema de Autenticação e Controle de Acesso — Intranet GS Produções

## Overview

Implementar sistema completo de **login via Supabase Auth** + **controle de permissões baseado em roles (RBAC)** para a intranet GS Produções. Cada módulo da home page terá visibilidade e acesso controlado por role do usuário.

O sistema é implementado como uma **feature componentizada** (`src/features/auth/`), seguindo exatamente o mesmo padrão arquitetural das features existentes (`gs-propostas`, `patrimonio`, `drive-qr`).

- **Tipo de Projeto:** WEB (Next.js 16 + Supabase)
- **Autenticação:** 100% Supabase Auth (email + senha)
- **Autorização:** Role-based com tabela `user_profiles` no Supabase
- **Arquitetura:** Feature-based componentizada (`src/features/auth/`)

---

## Critérios de Sucesso

- [ ] Feature `auth` componentizada seguindo o padrão `api/ app/ config/ domain/ hooks/ server/ ui/`
- [ ] Página de login com design premium (seguindo identidade visual GS Produções)
- [ ] Página de cadastro com aprovação pendente do ADMIN
- [ ] Autenticação funcional via Supabase Auth (email + senha)
- [ ] Tabela `user_profiles` com roles: `dono`, `admin`, `rh`, `colaborador`
- [ ] Middleware Next.js protegendo rotas por role
- [ ] Home page exibe apenas módulos permitidos ao role do usuário
- [ ] Tentativa de acesso direto via URL → tela "Acesso Restrito"
- [ ] Painel Admin para gerenciar usuários e aprovar cadastros
- [ ] Session persistence (usuário mantém login ao recarregar)
- [ ] Logout funcional

---

## Tech Stack

| Camada          | Tecnologia                                   | Justificativa                                                |
| --------------- | -------------------------------------------- | ------------------------------------------------------------ |
| **Auth**        | Supabase Auth                                | Já integrado no projeto, seguro, RLS nativo                  |
| **DB Profiles** | Supabase (PostgreSQL)                        | Tabela `user_profiles` com FK ao `auth.users`                |
| **Frontend**    | Next.js 16 + React 18                        | Stack atual do projeto                                       |
| **Middleware**  | Next.js Middleware                           | Proteção de rotas no edge, sem latência extra                |
| **State**       | React Context + Supabase `onAuthStateChange` | Reativo, leve, sem lib extra                                 |
| **UI**          | Tailwind + shadcn/ui + Radix + Framer Motion | Componentes reutilizáveis de `@/shared/ui/`                  |
| **API Layer**   | Supabase Client (direto)                     | Mesmo padrão de `gs-propostas/api/proposals.ts` (Supabase)   |
| **SSR**         | `@supabase/ssr` (já instalado)               | Client server-side para Middleware e Server Components        |
| **Validação**   | Zod + react-hook-form                        | Já no projeto, schemas em `domain/validators.ts`             |

---

## Arquitetura de Roles (RBAC)

```
┌─────────────────────────────────────────────────────────┐
│                    MÓDULOS DA INTRANET                   │
├──────────────────────┬──────────────────────────────────┤
│       Módulo         │         Roles com Acesso         │
├──────────────────────┼──────────────────────────────────┤
│ GS Propostas         │ dono, admin                      │
│ Controle Patrimônio  │ dono, admin, rh                  │
│ Drive QR Scanner     │ dono, admin, rh, colaborador     │
│ Formulários (index)  │ dono, admin, rh, colaborador     │
│ · Horas Extras       │ dono, admin, rh, colaborador     │
│ · Prestação Contas   │ dono, admin, rh, colaborador     │
│ Admin Panel          │ dono, admin                      │
└──────────────────────┴──────────────────────────────────┘
```

### Hierarquia de Permissões

```
dono (Owner)
 └── admin
      └── rh
           └── colaborador (base)
```

---

## Estrutura de Arquivos — Feature `auth` Componentizada

> Segue o mesmo padrão de `gs-propostas/`, `patrimonio/` e `drive-qr/`:
> `api/` → `app/` → `config/` → `domain/` → `hooks/` → `pages/` → `server/` → `ui/`

```
src/features/auth/                        # 🆕 Feature de autenticação
├── api/                                  # Camada de integração Supabase
│   ├── auth.ts                           # signIn, signUp, signOut, getSession
│   └── profiles.ts                       # CRUD user_profiles (select, update, RPC calls)
├── app/                                  # Barrel exports (padrão do projeto)
│   └── index.ts                          # Exporta: AuthLayout, LoginPage, RegisterPage, AdminUsersPage, etc.
├── config/                               # Constantes e configuração
│   ├── auth-config.ts                    # ROUTE_PERMISSIONS, HOME_MODULES, PUBLIC_ROUTES
│   └── constants.ts                      # Mensagens, timeouts, etc.
├── domain/                               # Tipos e lógica de domínio
│   ├── types/
│   │   └── index.ts                      # UserRole, UserProfile, RoutePermission, AuthState
│   ├── validators.ts                     # Schemas Zod (loginSchema, registerSchema)
│   └── query-keys.ts                     # Query keys: ['auth', 'profile'], ['auth', 'users']
├── hooks/                                # Hooks e context
│   ├── auth-provider.tsx                 # AuthProvider (Context + onAuthStateChange)
│   └── use-auth.ts                       # useAuth() hook reutilizável
├── pages/                                # Componentes de página completos
│   ├── login-page.tsx                    # Página de login completa
│   ├── register-page.tsx                 # Página de cadastro completa
│   ├── access-denied-page.tsx            # Página "Acesso Restrito"
│   └── admin/
│       └── admin-users-page.tsx          # Página de gestão de usuários
├── server/                               # Lógica server-side
│   └── supabase-server.ts                # createSupabaseServerClient (SSR + Middleware)
└── ui/                                   # Componentes visuais
    ├── components/
    │   ├── login-form.tsx                # Form de login (Zod + react-hook-form)
    │   ├── register-form.tsx             # Form de cadastro
    │   ├── access-denied.tsx             # Card "Acesso Restrito" (reutilizável)
    │   ├── protected-section.tsx         # Wrapper condicional por role
    │   ├── user-dropdown.tsx             # Avatar + dropdown com nome/role/logout
    │   ├── pending-approval-card.tsx     # Card "Aguardando aprovação"
    │   └── admin/
    │       ├── users-table.tsx           # Tabela de usuários
    │       ├── approve-reject-actions.tsx # Botões aprovar/rejeitar
    │       └── role-select.tsx           # Select para mudar role
    └── layout/
        └── auth-layout.tsx               # Layout limpo (sem navbar/footer)
```

### App Router — Thin Wrappers (padrão do projeto)

```
src/app/
├── (auth)/                               # 🆕 Route group para login/register
│   ├── layout.tsx                        # → re-export AuthLayout da feature
│   ├── login/
│   │   └── page.tsx                      # → re-export LoginPage da feature
│   ├── register/
│   │   └── page.tsx                      # → re-export RegisterPage da feature
│   └── acesso-restrito/
│       └── page.tsx                      # → re-export AccessDeniedPage da feature
├── (core)/layout/
│   ├── conditional-navbar.tsx            # ✏️ Adicionar /login, /register ao hide list
│   └── root-layout.tsx                  # ✏️ Wrap com AuthProvider da feature
├── (workspace)/
│   └── admin/                            # 🆕 Painel admin
│       ├── layout.tsx                    # → thin wrapper
│       └── users/
│           └── page.tsx                  # → re-export AdminUsersPage da feature
├── middleware.ts                          # ⚠️ DEVE ficar em src/ (requerimento Next.js)
└── page.tsx                              # ✏️ Wrap seções com ProtectedSection da feature
```

### Padrão de Thin Wrapper (mesmo das outras features)

```tsx
// src/app/(auth)/layout.tsx
export { AuthLayout as default } from '@/features/auth/app';

// src/app/(auth)/login/page.tsx
export { LoginPage as default } from '@/features/auth/app';

// src/app/(workspace)/admin/users/page.tsx
export { AdminUsersPage as default } from '@/features/auth/app';
```

### SQL (Supabase)

```
sql/
├── 007_user_profiles.sql                 # 🆕 Tabela user_profiles + indexes + trigger updated_at
├── 008_rls_policies.sql                  # 🆕 Row Level Security para user_profiles
└── 009_admin_functions.sql               # 🆕 Trigger auto-perfil + RPCs (approve, update_role, reject)
```

### Middleware (requerimento Next.js — não pode ficar dentro da feature)

```
src/middleware.ts                          # 🆕 Importa config de @/features/auth/config/auth-config
```

---

## Task Breakdown

### FASE 1: Fundação — Banco de Dados + Supabase Auth

- [ ] **T1.1** — Criar tabela `user_profiles` no Supabase
  - INPUT: `sql/007_user_profiles.sql`
  - OUTPUT: Tabela com colunas: `id`, `user_id` (FK auth.users), `full_name`, `email`, `role`, `is_approved`, `created_at`, `updated_at`
  - VERIFY: `SELECT * FROM user_profiles` funciona no Supabase Dashboard

- [ ] **T1.2** — Configurar RLS (Row Level Security) para `user_profiles`
  - INPUT: `sql/008_rls_policies.sql`
  - OUTPUT: Usuário só lê seu próprio perfil; admin/dono leem todos
  - VERIFY: Testar com diferentes roles no SQL Editor

- [ ] **T1.3** — Criar trigger para auto-inserir perfil ao signup + RPCs admin
  - INPUT: `sql/009_admin_functions.sql`
  - OUTPUT: Ao criar conta → perfil com role `colaborador` + `is_approved=false`; RPCs: `approve_user`, `update_user_role`, `reject_user`
  - VERIFY: Criar usuário teste → perfil aparece automaticamente

---

### FASE 2: Feature `auth` — Domain + Config + Server

> Criar o esqueleto da feature seguindo o padrão do projeto.

- [ ] **T2.1** — Criar `domain/types/index.ts` (tipos de domínio)
  - PASTA: `src/features/auth/domain/types/index.ts`
  - OUTPUT: Interfaces `UserRole`, `UserProfile`, `RoutePermission`, `AuthState`
  - PADRÃO: Mesmo de `gs-propostas/domain/types/index.ts`

- [ ] **T2.2** — Criar `domain/validators.ts` (schemas Zod)
  - PASTA: `src/features/auth/domain/validators.ts`
  - OUTPUT: `loginSchema`, `registerSchema` com validações
  - PADRÃO: Mesmo de `patrimonio/domain/validators.ts`

- [ ] **T2.3** — Criar `domain/query-keys.ts` (React Query keys)
  - PASTA: `src/features/auth/domain/query-keys.ts`
  - OUTPUT: `authKeys.profile(userId)`, `authKeys.users()`
  - PADRÃO: Mesmo de `gs-propostas/domain/query-keys.ts`

- [ ] **T2.4** — Criar `config/auth-config.ts` (mapa RBAC)
  - PASTA: `src/features/auth/config/auth-config.ts`
  - OUTPUT: `PROTECTED_ROUTES`, `PUBLIC_ROUTES`, `HOME_MODULES`, `hasAccess()`, `getRoutePermission()`
  - PADRÃO: Mesmo de `gs-propostas/config/constants.ts`

- [ ] **T2.5** — Criar `server/supabase-server.ts` (SSR client)
  - PASTA: `src/features/auth/server/supabase-server.ts`
  - OUTPUT: `createSupabaseServerClient()` para Server Components e Middleware
  - DEPENDÊNCIA: `@supabase/ssr` (já instalado)

---

### FASE 3: Feature `auth` — API Layer + Hooks

> Camada de dados e estado, seguindo padrão Supabase direto.

- [ ] **T3.1** — Criar `api/auth.ts` (autenticação)
  - PASTA: `src/features/auth/api/auth.ts`
  - OUTPUT: `signInWithEmail()`, `signUpWithEmail()`, `signOut()`, `getSession()`
  - PADRÃO: Supabase direto (mesmo de `gs-propostas/api/proposals.ts`)

- [ ] **T3.2** — Criar `api/profiles.ts` (perfis de usuário)
  - PASTA: `src/features/auth/api/profiles.ts`
  - OUTPUT: `getUserProfile()`, `getAllProfiles()`, `approveUser()`, `rejectUser()`, `updateUserRole()`
  - PADRÃO: Supabase RPC + queries

- [ ] **T3.3** — Criar `hooks/auth-provider.tsx` (AuthProvider)
  - PASTA: `src/features/auth/hooks/auth-provider.tsx`
  - OUTPUT: Context com `user`, `profile`, `role`, `isLoading`, `isApproved`, `signOut`
  - PADRÃO: Mesmo de `drive-qr/hooks/drive-qr-provider.tsx` (Context ativo)
  - OTIMIZAÇÃO: `useMemo` no context value, `useCallback` no signOut

- [ ] **T3.4** — Criar `hooks/use-auth.ts` (hook reutilizável)
  - PASTA: `src/features/auth/hooks/use-auth.ts`
  - OUTPUT: `useAuth()` que consome o AuthProvider
  - PADRÃO: Mesmo de `drive-qr/hooks/use-drive-qr-context.ts`

---

### FASE 4: Feature `auth` — UI Components

> Componentes visuais reutilizáveis da feature.

- [ ] **T4.1** — Criar `ui/layout/auth-layout.tsx` (layout auth)
  - OUTPUT: Layout limpo, sem navbar/footer, background identidade visual
  - REUTILIZA: `BackgroundNoiseOverlay`, `ThemeProvider`

- [ ] **T4.2** — Criar `ui/components/login-form.tsx` (form de login)
  - OUTPUT: Form email + senha com Zod + react-hook-form
  - REUTILIZA: `Button`, `Input`, `Label` de `@/shared/ui/`; `toast` de `sonner`

- [ ] **T4.3** — Criar `ui/components/register-form.tsx` (form de cadastro)
  - OUTPUT: Form nome + email + senha + confirmar senha
  - REUTILIZA: Mesmos componentes do login

- [ ] **T4.4** — Criar `ui/components/protected-section.tsx` (wrapper por role)
  - OUTPUT: Renderiza children só se role permitido; null se não

- [ ] **T4.5** — Criar `ui/components/access-denied.tsx` (card acesso restrito)
  - OUTPUT: Card com ícone cadeado + mensagem + botão voltar
  - REUTILIZA: `Card`, `Button` de `@/shared/ui/`; `ShieldAlert` de `lucide-react`

- [ ] **T4.6** — Criar `ui/components/user-dropdown.tsx` (menu do usuário)
  - OUTPUT: Avatar (iniciais) + DropdownMenu com nome, role badge, logout
  - REUTILIZA: `DropdownMenu`, `Button` de `@/shared/ui/`

- [ ] **T4.7** — Criar `ui/components/pending-approval-card.tsx`
  - OUTPUT: Card "Aguardando aprovação do administrador"

- [ ] **T4.8** — Criar componentes admin: `users-table.tsx`, `approve-reject-actions.tsx`, `role-select.tsx`
  - PASTA: `src/features/auth/ui/components/admin/`
  - REUTILIZA: `AlertDialog`, `Select`, `toast` de `@/shared/ui/`

---

### FASE 5: Feature `auth` — Pages + Barrel Exports

> Componentes de página completos e barrel exports.

- [ ] **T5.1** — Criar `pages/login-page.tsx`
  - OUTPUT: Composição: AuthLayout + LoginForm
  - PADRÃO: Mesmo de `gs-propostas/pages/dashboard/dashboard-page.tsx`

- [ ] **T5.2** — Criar `pages/register-page.tsx`
  - OUTPUT: Composição: AuthLayout + RegisterForm

- [ ] **T5.3** — Criar `pages/access-denied-page.tsx`
  - OUTPUT: Composição: AccessDenied card com layout

- [ ] **T5.4** — Criar `pages/admin/admin-users-page.tsx`
  - OUTPUT: Composição: UsersTable + ações de gerenciamento

- [ ] **T5.5** — Criar `app/index.ts` (barrel exports)
  - OUTPUT: Exporta `AuthLayout`, `LoginPage`, `RegisterPage`, `AccessDeniedPage`, `AdminUsersPage`
  - PADRÃO: Mesmo de `gs-propostas/app/index.ts`

---

### FASE 6: Integração — App Router + Middleware + Root Layout

> Conectar a feature ao App Router com thin wrappers.

- [ ] **T6.1** — Criar thin wrappers do App Router
  - PASTA: `src/app/(auth)/layout.tsx`, `login/page.tsx`, `register/page.tsx`, `acesso-restrito/page.tsx`
  - PADRÃO: Re-exports de `@/features/auth/app` (1-2 linhas cada)

- [ ] **T6.2** — Criar thin wrappers admin
  - PASTA: `src/app/(workspace)/admin/layout.tsx`, `admin/users/page.tsx`
  - PADRÃO: Re-exports de `@/features/auth/app`

- [ ] **T6.3** — Criar `src/middleware.ts`
  - INPUT: Importa `getRoutePermission`, `PUBLIC_ROUTES` de `@/features/auth/config/auth-config`
  - INPUT: Importa `createSupabaseServerClient` de `@/features/auth/server/supabase-server`
  - OUTPUT: Proteção de rotas com redirect

- [ ] **T6.4** — Atualizar `root-layout.tsx`
  - INPUT: Importar `AuthProvider` de `@/features/auth/hooks/auth-provider`
  - OUTPUT: Wrap children com `<AuthProvider>`

- [ ] **T6.5** — Atualizar `conditional-navbar.tsx`
  - INPUT: Adicionar `/login`, `/register`, `/acesso-restrito` ao `hideNavbarOnModules`

- [ ] **T6.6** — Atualizar `page.tsx` (Home)
  - INPUT: Wrap seções com `ProtectedSection` de `@/features/auth/ui/components/protected-section`
  - INPUT: Importar `HOME_MODULES` de `@/features/auth/config/auth-config`

- [ ] **T6.7** — Atualizar `navbar.tsx`
  - INPUT: Adicionar `UserDropdown` de `@/features/auth/ui/components/user-dropdown`

---

### FASE 7: Otimização e Verificação Final

- [ ] **T7.1** — Verificar barrel exports e imports
  - OUTPUT: Todos os imports da feature usam `@/features/auth/app` ou paths específicos

- [ ] **T7.2** — Verificar que middleware não importa libs client-side
  - OUTPUT: Middleware leve, apenas Supabase SSR + config

- [ ] **T7.3** — Verificar bundle size com `npm run build`

- [ ] **T7.4** — Verificação final
  - Lint: `npm run lint` sem erros
  - Build: `npm run build` sem erros
  - Security: Sem credenciais hardcoded; RLS ativo
  - UX: Fluxo login → home → módulo fluido e responsivo
  - Responsividade: Login e cadastro funcionam em mobile
  - Acessibilidade: Labels em inputs, tab navigation

---

## Diagrama de Dependências

```
FASE 1: SQL (Supabase Dashboard)
T1.1 ─→ T1.2 ─→ T1.3
                    ↓
FASE 2: Domain + Config + Server
T2.1 ── T2.2 ── T2.3 ── T2.4 ── T2.5
                                    ↓
FASE 3: API + Hooks
T3.1 ── T3.2 ─→ T3.3 ─→ T3.4
                            ↓
FASE 4: UI Components
T4.1 ── T4.2 ── T4.3 ── T4.4 ── T4.5 ── T4.6 ── T4.7 ── T4.8
                                                             ↓
FASE 5: Pages + Barrel
T5.1 ── T5.2 ── T5.3 ── T5.4 ── T5.5
                                    ↓
FASE 6: Integração App Router
T6.1 ── T6.2 ── T6.3 ── T6.4 ── T6.5 ── T6.6 ── T6.7
                                                     ↓
FASE 7: Otimização + Verificação
T7.1 ── T7.2 ── T7.3 ── T7.4
```

---

## Fluxo de Dados (padrão do projeto)

```
App Router page.tsx (thin wrapper — 1 linha)
  → re-export from @/features/auth/app/index.ts
    → pages/ components (composição de UI + hooks)
      → hooks/ (auth-provider.tsx, use-auth.ts)
        → api/ layer (Supabase direto)
          → @/shared/lib/supabase-client.ts (client-side)
          → @/features/auth/server/supabase-server.ts (server-side)
            → Supabase Cloud (Auth + PostgreSQL)
```

---

## Notas Importantes

1. **Padrão feature-based**: A feature `auth` segue exatamente o mesmo padrão de `gs-propostas`, `patrimonio` e `drive-qr`. Cada camada tem responsabilidade clara.
2. **Supabase Auth ≠ Supabase Database**: A autenticação é via `supabase.auth.signInWithPassword()`, o perfil/role fica na tabela custom `user_profiles`.
3. **API Layer — Supabase direto**: A feature usa Supabase client diretamente (não `fetchApi`), mesma estratégia de `gs-propostas/api/proposals.ts`.
4. **`@supabase/ssr` já instalado**: O pacote para SSR já está no `package.json`, pronto para usar no server e middleware.
5. **Middleware em `src/middleware.ts`**: Requerimento do Next.js — não pode ficar dentro da feature. Mas importa configs da feature.
6. **Aprovação manual**: Novo cadastro NÃO dá acesso imediato. Admin precisa aprovar.
7. **Reutilização de UI**: Usar componentes shadcn/ui existentes em `@/shared/ui/` (Button, Input, Card, Dialog, DropdownMenu, Select, AlertDialog, etc.).
8. **Thin wrappers**: As páginas do App Router são re-exports de 1 linha, toda a lógica fica na feature.
9. **Futuro RH**: A estrutura de roles já contempla o role `rh` para aprovação de horas extras via email.
