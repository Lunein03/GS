# Auth Feature — Documento de Teste e Análise de Reutilização

> Data: 04/03/2026  
> Escopo: Análise de design, reutilização de componentes e verificação de integridade da feature `src/features/auth/`

---

## 1. Inventário completo da feature

### 1.1 Arquivos criados (24 arquivos)

| Camada | Arquivo | Responsabilidade |
|--------|---------|-----------------|
| **domain** | `types/index.ts` | `UserRole`, `UserProfile`, `ApiUserProfile`, `RoutePermission`, `AuthState` |
| **domain** | `validators.ts` | `loginSchema`, `registerSchema` (Zod) + tipos inferidos |
| **domain** | `query-keys.ts` | Chaves para React Query |
| **config** | `auth-config.ts` | `PUBLIC_ROUTES`, `PROTECTED_ROUTES`, `HOME_MODULES`, helpers |
| **api** | `auth.ts` | `signInWithEmail`, `signUpWithEmail`, `signOut`, `getSession` |
| **api** | `profiles.ts` | `getUserProfile`, `getAllProfiles`, `getPendingProfiles`, `approveUser`, `rejectUser`, `updateUserRole` + mapper snake→camel |
| **hooks** | `auth-provider.tsx` | `AuthContext` + `AuthProvider` com `onAuthStateChange` |
| **hooks** | `use-auth.ts` | Hook `useAuth()` |
| **server** | `supabase-server.ts` | Client-side Supabase com cookies (SSR) |
| **ui/layout** | `auth-layout.tsx` | Layout compartilhado login/register (noise, logo, gradient) |
| **ui/components** | `login-form.tsx` | Formulário de login com Zod + react-hook-form |
| **ui/components** | `register-form.tsx` | Formulário de registro com validação |
| **ui/components** | `user-dropdown.tsx` | Menu dropdown do usuário logado |
| **ui/components** | `auth-button.tsx` | Botão condicional (Entrar / UserDropdown) |
| **ui/components** | `protected-section.tsx` | Wrapper que mostra/oculta baseado em role |
| **ui/components** | `pending-approval-card.tsx` | Card de "aguardando aprovação" |
| **ui/components** | `access-denied.tsx` | Card de "acesso restrito" |
| **ui/admin** | `users-table.tsx` | Tabela de gestão de usuários |
| **ui/admin** | `approve-reject-actions.tsx` | Ações de aprovar/rejeitar |
| **ui/admin** | `role-select.tsx` | Select para alterar role |
| **pages** | `login-page.tsx` | Composição: AuthLayout + LoginForm |
| **pages** | `register-page.tsx` | Composição: AuthLayout + RegisterForm |
| **pages** | `access-denied-page.tsx` | Composição: AuthLayout + AccessDenied |
| **pages/admin** | `admin-users-page.tsx` | Página de admin |
| **app** | `index.ts` | Barrel exports |

---

## 2. Teste de integridade — TypeScript

| Verificação | Resultado |
|-------------|-----------|
| Erros TypeScript globais | **0 erros** |
| Erros isolados nos 24 arquivos auth | **0 erros** |
| Erros nos arquivos integrados (navbar, hero, page, middleware) | **0 erros** |
| Imports circulares detectados | **Nenhum** |

---

## 3. Análise de reutilização de componentes `shared/ui`

### 3.1 Componentes shadcn/ui disponíveis (35)

```
alert-dialog, avatar, badge, button, calendar, card, checkbox,
date-picker, date-range-picker, dialog, dropdown-menu, form,
input, label, parallax-background, popover, progress, radio-group,
resizable, scroll-area, section-shell, select, separator, sonner,
switch, table, tabs, textarea, theme-provider, time-picker, toast,
toaster, tooltip, wavy-background, background-snippets-noise-effect11
```

### 3.2 Componentes efetivamente usados pela feature auth

| Componente shared/ui | Usado em | Status |
|---------------------|----------|--------|
| `Button` | login-form, register-form, auth-button, user-dropdown, pending-approval-card, access-denied | ✅ Reutilizado |
| `Input` | login-form, register-form | ✅ Reutilizado |
| `Label` | login-form, register-form | ✅ Reutilizado |
| `Card` (+ CardContent, CardHeader, CardFooter, CardTitle, CardDescription) | login-form, register-form, pending-approval-card, access-denied | ✅ Reutilizado |
| `DropdownMenu` (+ Content, Item, Label, Separator, Trigger) | user-dropdown | ✅ Reutilizado |
| `Badge` | user-dropdown | ✅ Reutilizado |
| `BackgroundNoiseOverlay` | auth-layout | ✅ Reutilizado |
| `Table` (+ componentes) | users-table (admin) | ✅ Reutilizado |
| `Select` (+ componentes) | role-select (admin) | ✅ Reutilizado |

### 3.3 Componentes shared/ui NÃO usados (poderiam ser)

| Componente | Oportunidade |
|-----------|-------------|
| `Avatar` | `UserDropdown` usa iniciais em texto. Poderia usar `<Avatar>` com fallback de iniciais — design mais consistente |
| `Separator` | `LoginForm`/`RegisterForm` poderiam usar para dividir seção de social login futuro |
| `Tooltip` | Ações admin (aprovar/rejeitar) poderiam ter tooltips para acessibilidade |
| `Dialog` | Confirmação de ações admin (excluir, rejeitar) — poderia usar `AlertDialog` |
| `Sonner` | Já usado via `toast()` (sonner importado diretamente nos forms) ✅ |
| `Form` (react-hook-form wrapper) | Forms usam `react-hook-form` manual. Poderiam usar o wrapper `Form` do shadcn que integra `FormField`, `FormItem`, `FormLabel`, `FormMessage` automaticamente |

---

## 4. Análise de padrões duplicados

### 4.1 Padrão de campo com toggle de senha (DUPLICADO)

O padrão "input de senha com botão eye/eyeoff" aparece **3 vezes** identicamente:

- `login-form.tsx` → 1 campo de senha
- `register-form.tsx` → 2 campos de senha (senha + confirmar)

**Código duplicado** (cada instância ~20 linhas):
```tsx
<div className="relative">
  <Input type={showPassword ? 'text' : 'password'} ... />
  <button
    type="button"
    tabIndex={0}
    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
    className="absolute right-3 top-1/2 -translate-y-1/2 ..."
    onClick={() => setShowPassword((prev) => !prev)}
    onKeyDown={(e) => { ... }}
  >
    {showPassword ? <EyeOff /> : <Eye />}
  </button>
</div>
```

**Recomendação**: Criar `PasswordInput` em `src/shared/ui/password-input.tsx`:
```tsx
// Props: id, placeholder, autoComplete, disabled, aria-invalid, aria-describedby, register props
// Encapsula o toggle de visibilidade internamente
```

**Impacto**: Elimina ~60 linhas duplicadas, centraliza acessibilidade e comportamento.

### 4.2 Padrão de "Card de status" (DUPLICADO)

`PendingApprovalCard` e `AccessDenied` seguem padrão idêntico:
- Card com border colorida
- Ícone circular centralizado (bg colorido + ícone lucide)
- Título + descrição
- Botão de ação no footer

**Estrutura comum**:
```tsx
<Card className="... border-{color}/20 bg-card/80 backdrop-blur-sm">
  <CardHeader className="text-center">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-{color}/10">
      <Icon className="h-8 w-8 text-{color}" />
    </div>
    <CardTitle>{título}</CardTitle>
  </CardHeader>
  <CardContent><p>{mensagem}</p></CardContent>
  <CardFooter className="justify-center">
    <Button asChild variant="outline"><Link href={href}>{label}</Link></Button>
  </CardFooter>
</Card>
```

**Recomendação**: Criar `StatusCard` em `src/features/auth/ui/components/status-card.tsx`:
```tsx
interface StatusCardProps {
  icon: LucideIcon;
  iconColor: string;      // 'yellow-500' | 'destructive'
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}
```

**Impacto**: Reduz `PendingApprovalCard` e `AccessDenied` para 1 linha cada. Componente reutilizável para status futuros (ex: conta suspensa, manutenção).

### 4.3 Padrão de erro de campo (repetido)

Todas as validações de campo repetem:
```tsx
{errors.fieldName && (
  <p id="fieldName-error" className="text-sm text-destructive">
    {errors.fieldName.message}
  </p>
)}
```

**Recomendação**: Já existe `src/shared/ui/form.tsx` (wrapper do shadcn para react-hook-form) que inclui `FormMessage`. Migrar os formulários para este padrão eliminaria a repetição e padronizaria com outros formulários do projeto.

---

## 5. Análise de design e consistência visual

### 5.1 Auth Layout vs Hero Section

| Aspecto | AuthLayout | HeroSection |
|---------|-----------|-------------|
| Background | `bg-gradient-to-br from-[#0a0f1c] via-[#151c2a] to-[#1a2332]` (sempre dark) | Theme-aware (light/dark) |
| Noise | `BackgroundNoiseOverlay` patternAlpha=8 | `BackgroundNoiseOverlay` patternAlpha=28 |
| Logo | Só dark (`gs-logo-2.svg`) | Dual (dark/light) |
| Animações | Nenhuma (estático) | Framer Motion (floating lights, gradients) |

**Observação**: O AuthLayout é intencionalmente sempre dark para diferenciação visual da tela de login. Isso é uma decisão de design válida, não um problema.

**Recomendação boa-a-ter**: Considerar adicionar ao auth-layout um efeito sutil de motion (como 1-2 blobs gradient animados) para alinhar com a linguagem visual da hero, mantendo a diferenciação.

### 5.2 Consistência de Cards

| Componente | border | bg | backdrop |
|-----------|--------|-----|---------|
| LoginForm Card | `border-border/40` | `bg-card/80` | `backdrop-blur-sm` |
| RegisterForm Card | `border-border/40` | `bg-card/80` | `backdrop-blur-sm` |
| PendingApprovalCard | `border-yellow-500/20` | `bg-card/80` | `backdrop-blur-sm` |
| AccessDenied Card | `border-destructive/20` | `bg-card/80` | `backdrop-blur-sm` |

✅ **Padrão consistente** — todos usam `bg-card/80 backdrop-blur-sm` com bordas semânticas.

### 5.3 Acessibilidade

| Verificação | Status |
|-------------|--------|
| `aria-label` em botões de toggle de senha | ✅ |
| `aria-invalid` em inputs com erro | ✅ |
| `aria-describedby` ligando input → mensagem de erro | ✅ |
| `tabIndex={0}` em links e botões interativos | ✅ |
| `sr-only` para labels visuais | ⚠️ Ausente — considerar em ícones standalone |
| Contraste de cores (text-muted-foreground) | ✅ Design system garante |

---

## 6. Resumo quantitativo

| Métrica | Valor |
|---------|-------|
| Total de arquivos na feature | 24 |
| Componentes `shared/ui` reutilizados | 9 de 35 (26%) |
| Componentes `shared/ui` relevantes não usados | 3 (Avatar, Form, AlertDialog) |
| Padrões duplicados identificados | 3 (PasswordInput, StatusCard, FieldError) |
| Linhas potencialmente elimináveis via reutilização | ~100-120 linhas |
| Erros TypeScript | 0 |
| Imports não utilizados | 0 |
| Imports circulares | 0 |

---

## 7. Roadmap de otimização sugerido

| Prioridade | Ação | Impacto |
|-----------|------|---------|
| **ALTA** | Criar `PasswordInput` (shared/ui) | Elimina ~60 linhas duplicadas, centraliza a11y |
| **MÉDIA** | Criar `StatusCard` (auth/ui) | Elimina duplicação entre PendingApproval e AccessDenied |
| **MÉDIA** | Migrar forms para `Form` wrapper do shadcn | Padroniza com restante do projeto, elimina error messages manuais |
| **BAIXA** | Usar `Avatar` no UserDropdown | Consistência visual, suporte futuro a foto de perfil |
| **BAIXA** | Usar `AlertDialog` em ações admin | UX mais segura para ações destrutivas |

---

## 8. Veredicto final

A feature de autenticação foi implementada seguindo fielmente a arquitetura feature-based do projeto, com separação clara de responsabilidades por camada (domain → api → hooks → ui → pages → app).

**Pontos fortes:**
- 9 componentes `shared/ui` efetivamente reutilizados (Button, Input, Label, Card, DropdownMenu, Badge, BackgroundNoiseOverlay, Table, Select)
- Design system consistente (variantes de button, card patterns, cores semânticas)
- Validação com Zod + react-hook-form (stack padrão do projeto)
- Acessibilidade bem aplicada (aria-*, tabIndex, labels)
- Zero erros TypeScript, imports limpos

**Oportunidades de melhoria:**
- 3 padrões duplicados que podem ser extraídos para componentes reutilizáveis
- O wrapper `Form` do shadcn/ui já existe mas não está sendo usado
- `Avatar` poderia substituir as iniciais em texto do UserDropdown

**Nota geral: 8/10** — Código funcional, bem organizado e com boa reutilização. As melhorias identificadas são de refinamento, não de correção.
