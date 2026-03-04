# Análise de Duplicidade de Rotas — Intranet GS Produções

> **Data**: 04/03/2026  
> **Escopo**: Busca completa por lógica duplicada de rotas e caminhos hardcoded em `src/`  
> **Motivação**: Bug recorrente de "gap da navbar" causado por listas de rotas mantidas manualmente em múltiplos arquivos

---

## 1. O Problema Raiz

O projeto tem **rotas definidas como strings literais espalhadas por múltiplos arquivos**. Quando uma nova rota é criada ou renomeada, é necessário atualizar N locais manualmente — e basta esquecer 1 para criar um bug silencioso.

### Bug que motivou esta análise

| Arquivo | Tinha a rota `/login`? |
|---------|----------------------|
| `conditional-navbar.tsx` | ✅ Sim (esconde navbar) |
| `conditional-footer.tsx` | ✅ Sim (esconde footer) |
| `main-content.tsx` | ❌ **NÃO** (mantinha `pt-16` → gap visível) |

**Resultado**: Navbar invisível + 64px de espaço vazio no topo da página de login.

---

## 2. Inventário Completo — Onde Rotas São Definidas

### 2.1 Arquivos de Configuração (fontes de verdade)

| Arquivo | Constante | Rotas | Propósito |
|---------|-----------|-------|-----------|
| `src/features/auth/config/auth-config.ts` | `PUBLIC_ROUTES` | `/login`, `/register`, `/acesso-restrito` | Rotas que não exigem auth |
| `src/features/auth/config/auth-config.ts` | `IGNORED_ROUTES` | `/_next`, `/api`, `/favicon.ico`, `/images`, `/fonts`, `/manifest.json`, `/robots.txt`, `/sitemap.xml` | Rotas ignoradas pelo middleware |
| `src/features/auth/config/auth-config.ts` | `PROTECTED_ROUTES` | `/gs-propostas`, `/patrimonio`, `/drive-qr`, `/formularios`, `/admin` | Rotas com controle de role |
| `src/features/auth/config/auth-config.ts` | `HOME_MODULES` | `gs-propostas`, `patrimonio`, `drive-qr`, `formularios` | Roles por módulo na home |
| `src/app/(core)/layout/route-config.ts` | `HIDDEN_LAYOUT_ROUTES` | `/patrimonio`, `/drive-qr`, `/gs-propostas`, `/login`, `/register`, `/acesso-restrito`, `/bg-teste` | Esconde navbar/footer/padding |
| `src/middleware.ts` | `config.matcher` | Regex negativa: `_next/static`, `_next/image`, `favicon.ico`, `images`, `fonts`, `manifest.json`, `robots.txt`, `sitemap.xml` | Matcher do middleware Next.js |

### 2.2 Rotas Hardcoded em Componentes (links de navegação)

| Arquivo | Rotas hardcoded | Tipo |
|---------|----------------|------|
| `src/shared/components/navbar.tsx` | `/patrimonio`, `/formularios`, `/formularios/horas-extras`, `/formularios/prestacao-contas` | `navItems` + `formularioItems` |
| `src/shared/components/footer.tsx` | `/formularios` | Link no footer |
| `src/shared/components/hero-section.tsx` | `/login` | CTA "Acessar Plataforma" |
| `src/shared/components/patrimonio-section.tsx` | `/patrimonio` | Link "Ver mais" |
| `src/shared/components/gs-propostas-section.tsx` | `/gs-propostas/dashboard` | Link "Acessar" |
| `src/shared/components/drive-qr-section.tsx` | `/drive-qr` | Link "Acessar" |

### 2.3 Rotas Hardcoded em Features (navegação interna)

| Arquivo | Rotas | Tipo |
|---------|-------|------|
| `auth/hooks/auth-provider.tsx` | `/login` | `router.push` no signOut |
| `auth/ui/components/login-form.tsx` | `/register`, `/` | Link + redirect pós-login |
| `auth/ui/components/register-form.tsx` | `/login` | Link para login |
| `auth/ui/components/pending-approval-card.tsx` | `/login` | Link "Voltar ao login" |
| `patrimonio/ui/components/patrimonio-sidebar.tsx` | `/patrimonio`, `/patrimonio/equipamentos`, `/patrimonio/eventos` | Links sidebar |
| `patrimonio/ui/components/equipment-list-content.tsx` | `/patrimonio/cadastrar` | `router.push` |
| `patrimonio/ui/components/add-equipment-form.tsx` | `/patrimonio/equipamentos` | `router.push` pós-submit |
| `patrimonio/ui/components/dashboard-content.tsx` | `/patrimonio/equipamentos`, `/patrimonio/eventos` | Links "Ver todos" |
| `patrimonio/app/app-legacy/not-found.tsx` | `/patrimonio` | Link voltar |
| `drive-qr/ui/components/drive-qr-sidebar.tsx` | `/drive-qr`, `/drive-qr#upload`, `/drive-qr#resumo`, `/drive-qr#resultados` | Links sidebar |
| `drive-qr/app/app-legacy/not-found.tsx` | `/drive-qr` | Link voltar |
| `gs-propostas/ui/layout/gs-propostas-sidebar-animated.tsx` | `/gs-propostas/dashboard`, `/gs-propostas/proposta/nova`, `/gs-propostas/oportunidades/*` | Links sidebar |
| `gs-propostas/ui/components/proposta-unificada.tsx` | `/gs-propostas/dashboard` | `router.push` |
| `gs-propostas/ui/components/new-opportunity-modal.tsx` | `/gs-propostas/proposta/nova` | `router.push` |
| `gs-propostas/ui/components/create-opportunity-form.tsx` | `/gs-propostas/dashboard` | `router.push` |

### 2.4 Middleware — Dupla Filtragem de Assets (DUPLICIDADE)

O middleware tem **dois mecanismos** para ignorar assets estáticos:

```
1. config.matcher (regex):
   /((?!_next/static|_next/image|favicon.ico|images|fonts|manifest.json|robots.txt|sitemap.xml).*)

2. IGNORED_ROUTES (auth-config.ts):
   /_next, /api, /favicon.ico, /images, /fonts, /manifest.json, /robots.txt, /sitemap.xml
```

**Inconsistência**: `matcher` não inclui `/api`, mas `IGNORED_ROUTES` sim. A inversa: `matcher` filtra `_next/static` e `_next/image` separadamente, enquanto `IGNORED_ROUTES` filtra `/_next` inteiro. Funciona, mas a redundância é fonte de confusão.

---

## 3. Mapa de Duplicidades Críticas

### 🔴 CRÍTICO — Duplicidade que causa bugs

| Duplicidade | Fontes conflitantes | Risco |
|------------|---------------------|-------|
| **Rotas de layout (navbar/footer/padding)** | ~~`conditional-navbar.tsx` + `conditional-footer.tsx` + `main-content.tsx`~~ → **RESOLVIDO** via `route-config.ts` | ~~ALTO~~ ✅ Corrigido |
| **Rotas de layout vs. Rotas de auth** | `route-config.ts` (HIDDEN_LAYOUT) vs. `auth-config.ts` (PUBLIC + PROTECTED) | ALTO — ao adicionar nova rota protegida, precisa lembrar de atualizar `route-config.ts` também |

### 🟡 MÉDIO — Potencial inconsistência

| Duplicidade | Detalhe | Risco |
|------------|---------|-------|
| **Middleware matcher vs. IGNORED_ROUTES** | Duas listas separadas filtrando assets estáticos | Se uma listar é atualizada sem a outra, assets podem chegar ao middleware desnecessariamente |
| **PROTECTED_ROUTES vs. HOME_MODULES** | Mesmos módulos definidos de duas formas: `{path, allowedRoles}[]` vs. `Record<string, roles[]>` | Ao add novo módulo precisa atualizar ambos — se roles divergirem, home page mostra módulo que middleware bloqueia |
| **`/formularios` ausente em HIDDEN_LAYOUT_ROUTES** | `formularios` está em PROTECTED_ROUTES e HOME_MODULES mas **não** em HIDDEN_LAYOUT | Se `/formularios` deveria esconder navbar (como os outros módulos), terá o mesmo bug do gap |

### 🟢 BAIXO — Strings hardcoded aceitáveis

| Tipo | Qtd | Risco |
|------|-----|-------|
| Links de navegação interna em sidebars (patrimonio, drive-qr, gs-propostas) | ~15 | Baixo — rotas internas de cada feature, mudam raramente |
| Links de `router.push` pós-ação (submit form, etc.) | ~7 | Baixo — navegação contextual dentro da feature |
| Links em componentes de seção (hero, sections) | ~4 | Baixo — acoplamento natural com a rota principal do módulo |

---

## 4. Análise Arquitetural

### 4.1 Situação Atual (Pós-Fix)

```
┌─────────────────────────────────────────────────────┐
│                  Fontes de Verdade                   │
├──────────────────────┬──────────────────────────────┤
│   auth-config.ts     │     route-config.ts          │
│                      │                              │
│  PUBLIC_ROUTES       │  HIDDEN_LAYOUT_ROUTES        │
│  IGNORED_ROUTES      │                              │
│  PROTECTED_ROUTES    │  ← Derivável de              │
│  HOME_MODULES        │     PUBLIC + PROTECTED?      │
│                      │                              │
│  Consumidores:       │  Consumidores:               │
│  ├ middleware.ts      │  ├ conditional-navbar.tsx     │
│  ├ protected-section  │  ├ conditional-footer.tsx     │
│  └ page.tsx (home)   │  └ main-content.tsx           │
└──────────────────────┴──────────────────────────────┘
          ↕ NÃO SE COMUNICAM ↕
```

### 4.2 O Problema Fundamental

`HIDDEN_LAYOUT_ROUTES` é essencialmente a **união** de `PUBLIC_ROUTES` + paths de `PROTECTED_ROUTES` + `/bg-teste`. Mas está definido manualmente como lista separada, sem derivação automática.

**Quando alguém adiciona uma rota protegida em `auth-config.ts`, precisa lembrar de:**
1. ✅ Adicionar em `PROTECTED_ROUTES` (para middleware)
2. ✅ Adicionar em `HOME_MODULES` (para seções na home)
3. ❌ Adicionar em `HIDDEN_LAYOUT_ROUTES` (para esconder navbar/footer) — **ESQUECÍVEL**

### 4.3 Solução Recomendada

Derivar `HIDDEN_LAYOUT_ROUTES` automaticamente de `auth-config.ts`:

```typescript
// route-config.ts — proposta
import { PUBLIC_ROUTES, PROTECTED_ROUTES } from '@/features/auth/config/auth-config';

const EXTRA_HIDDEN_ROUTES = ['/bg-teste'] as const;

const HIDDEN_LAYOUT_ROUTES = [
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES.map((r) => r.path),
  ...EXTRA_HIDDEN_ROUTES,
] as const;
```

**Benefício**: Ao cadastrar nova rota em `auth-config.ts`, o layout se adapta automaticamente.

---

## 5. Inconsistências Encontradas

### 5.1 `/formularios` — Possível bug latente

| Configuração | Tem `/formularios`? |
|-------------|-------------------|
| `PROTECTED_ROUTES` | ✅ `{ path: '/formularios', allowedRoles: [...] }` |
| `HOME_MODULES` | ✅ `'formularios': [...]` |
| `HIDDEN_LAYOUT_ROUTES` | ❌ **AUSENTE** |
| `ConditionalNavbar` | ❌ **Mostra navbar** |
| `ConditionalFooter` | ❌ **Mostra footer** |
| `MainContent` | ❌ **Aplica `pt-16`** |

⚠️ Se `/formularios` é um módulo full-screen como os outros (patrimonio, drive-qr, gs-propostas), **terá navbar + footer + gap** como o bug de login. Investigar se `/formularios` tem seu próprio layout ou se reutiliza a navbar da home.

### 5.2 `/admin` — Rota fantasma

`PROTECTED_ROUTES` inclui `{ path: '/admin', allowedRoles: ['dono', 'admin'] }`, mas:
- Não existe em `HIDDEN_LAYOUT_ROUTES`
- Não existe em nenhum componente/link encontrado
- Não investigamos se a rota `/admin` existe em `src/app/`

### 5.3 `/bg-teste` — Rota exclusiva do layout

Presente apenas em `HIDDEN_LAYOUT_ROUTES` (esconde navbar/footer) mas **não** em `PROTECTED_ROUTES` nem `PUBLIC_ROUTES`. Presumivelmente é uma rota de desenvolvimento/teste.

### 5.4 HOME_MODULES vs PROTECTED_ROUTES — Estrutura paralela

Mesma informação em dois formatos:

```typescript
// PROTECTED_ROUTES:
{ path: '/gs-propostas', allowedRoles: ['dono', 'admin'] }
{ path: '/patrimonio', allowedRoles: ['dono', 'admin', 'rh'] }

// HOME_MODULES:
'gs-propostas': ['dono', 'admin']
'patrimonio': ['dono', 'admin', 'rh']
```

Se as roles divergirem (ex: alguém atualiza só uma), o middleware e a home page terão definições conflitantes — módulo aparece na home mas middleware bloqueia, ou vice-versa.

---

## 6. Contagem de Duplicidades

| Métrica | Valor |
|---------|-------|
| Arquivos com listas de rotas hardcoded | **6** (2 configs + middleware + 3 layout) |
| Total de strings de rota literais no projeto | **~65** |
| Rotas que aparecem em 3+ locais distintos | `/login` (6x), `/patrimonio` (6x), `/gs-propostas` (5x), `/drive-qr` (5x), `/formularios` (5x) |
| Duplicidades no nível de configuração (listas paralelas) | **4** (PUBLIC, PROTECTED, HOME_MODULES, HIDDEN_LAYOUT) |
| Duplicidades de filtragem de assets | **2** (matcher regex + IGNORED_ROUTES) |

---

## 7. Plano de Ação — Prioridades

### 🔴 ALTA — Prevenir bugs recorrentes

| # | Ação | Impacto |
|---|------|---------|
| 1 | **Derivar HIDDEN_LAYOUT_ROUTES de auth-config** | Elimina necessidade de sincronizar `route-config.ts` manualmente |
| 2 | **Verificar `/formularios`** | Pode ter o mesmo bug do gap se for full-screen |
| 3 | **Derivar HOME_MODULES de PROTECTED_ROUTES** | Garante roles sempre sincronizados entre middleware e home |

### 🟡 MÉDIA — Simplificação

| # | Ação | Impacto |
|---|------|---------|
| 4 | **Remover IGNORED_ROUTES** | `config.matcher` já filtra os mesmos assets; manter só 1 mecanismo |
| 5 | **Verificar rota `/admin`** | Existe ou é placeholder? Se não existe, remover de PROTECTED_ROUTES |

### 🟢 BAIXA — Nice to have

| # | Ação | Impacto |
|---|------|---------|
| 6 | Criar constantes para rotas-base de features (`ROUTES.AUTH.LOGIN`, `ROUTES.PATRIMONIO.ROOT`) | Autocomplete + refactoring seguro |
| 7 | Agrupar links de sidebar em config por feature | Manutenção mais fácil |

---

## 8. Conclusão

O bug da navbar não era um caso isolado — é **sintoma de um padrão arquitetural**: rotas definidas como strings literais em múltiplos arquivos sem fonte única de verdade.

A correção pontual (centralizar em `route-config.ts`) resolveu a duplicação entre os 3 componentes de layout, mas **ainda existe uma duplicação de nível superior** entre `route-config.ts` e `auth-config.ts` que pode gerar o mesmo tipo de bug ao adicionar novos módulos.

A solução definitiva é **derivar** as listas em vez de repeti-las: `HIDDEN_LAYOUT_ROUTES` deve ser calculada automaticamente a partir de `PUBLIC_ROUTES` + `PROTECTED_ROUTES`, e `HOME_MODULES` deve ser derivada de `PROTECTED_ROUTES`.

**Nota final**: Das ~65 strings de rota encontradas, ~45 são links de navegação dentro de features (sidebars, botões, redirects pós-ação). Essas são **duplicidades aceitáveis** — centralizar links de sidebar em configs é uma otimização de baixa prioridade. O foco deve ser nas **4 listas de configuração** que controlam comportamento do sistema.
