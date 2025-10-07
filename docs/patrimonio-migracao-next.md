# Migração da aplicação Patrimônio (Vite) para Next.js

## 1. Visão geral da implementação atual

A aplicação Patrimônio localizada em `app/(intranet)/Patrimonio/` foi criada com Vite + React Router e utiliza Tailwind + shadcn/ui. Os principais blocos são:

- **Páginas (React Router)** em `src/pages`: `Dashboard`, `EquipmentList`, `AddEquipment`, `Events`, `NotFound`.
- **Layout** compartilhado em `src/components/Layout.tsx` com navegação primária.
- **Contexto global** `EquipmentContext` que persiste equipamentos/eventos em `localStorage` via helpers de `src/lib/equipment-storage.ts`.
- **Componentes de UI shadcn** dentro de `src/components/ui/` (botões, cards, selects, dialogs etc.).
- **Hooks utilitários** (`use-toast`, `use-mobile`).
- **Dependências**: React 18, React Router, React Hook Form, TanStack Query (não utilizada hoje), Tailwind, Radix, lucide-react, zod etc.

A aplicação roda isolada via `BrowserRouter`, renderizada a partir de `main.tsx`. Todo o estado de domínio está em memória + localStorage.

## 2. Objetivo da migração

Reimplementar o Patrimônio como parte nativa da intranet em Next.js para obter:

- Navegação unificada (App Router, sem iframes HashRouter).
- Compartilhamento de providers (tema, layout, autenticação futura).
- Build e deploy únicos.
- Acesso a recursos de Server Components/Actions quando necessário.
- Manutenção simplificada de UI (reaproveito do design system existente).

## 3. Estrutura alvo no projeto Next.js

A proposta é criar um sub-app em `app/patrimonio/` seguindo o padrão do App Router:

```
app/
  patrimonio/
    layout.tsx             # Wrapper com navbar lateral/topo, providers e metadados
    page.tsx               # Dashboard
    equipamentos/
      page.tsx             # Lista de equipamentos
    cadastrar/
      page.tsx             # Formulário de cadastro
    eventos/
      page.tsx             # Gestão de eventos
    not-found.tsx          # Página 404 específica do módulo
    components/            # Componentes exclusivos (Layout, cards, tabelas...)
    hooks/                 # Hooks específicos do módulo (ex.: useIsMobile)
    context/
      equipment-provider.tsx
    lib/
      equipment-storage.ts
    styles/
      patrimonio.css       # Se precisar de estilos específicos
```

Os componentes que já existem em `components/ui/` no projeto Next devem ser reaproveitados. Para elementos exclusivos do Patrimônio, crie a pasta `app/patrimonio/components`.

## 4. Mapeamento das rotas atuais → Next.js

| Rota atual (React Router) | Nova rota Next.js            | Observações |
| ------------------------- | --------------------------- | ----------- |
| `/`                       | `/patrimonio`               | Dashboard passa a ser `page.tsx` |
| `/equipments`             | `/patrimonio/equipamentos`  | Ajustar breadcrumbs/links |
| `/add`                    | `/patrimonio/cadastrar`     | Formulário de cadastro |
| `/events`                 | `/patrimonio/eventos`       | Listagem + criação de eventos |
| `*` (NotFound)            | `/patrimonio/not-found`     | Usar arquivo `not-found.tsx` |

Atualize os links do layout/menu para refletir as novas rotas.

## 5. Preparação

1. **Remover duplicidade de componentes shadcn**: caso um mesmo componente exista na raiz (`components/ui/...`) e no módulo Patrimônio, padronize para a versão raiz e ajuste imports.
2. **Alinhar dependências**: verifique se todas as libs usadas no Patrimônio já estão instaladas na raiz Next. Adicione ao `package.json` principal apenas o que estiver faltando (ex.: `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-query`).
3. **Copiar utilitários**: mova `src/lib/utils.ts` (cn) apenas se necessário — o projeto Next já possui util equivalente em `@/lib/utils`.
4. **Definir persistência**: inicialmente mantenha `localStorage` para paridade. Planeje futura migração para Supabase/DB.

## 6. Passo a passo da migração

### 6.1. Criar layout do módulo

- Criar `app/patrimonio/layout.tsx` como componente server que:
  - Define metadados (`title`, `description`).
  - Renderiza um wrapper `<section>` com `className="flex w-full flex-col"` (seguir `Rules.instructions.md`).
  - Envolve `children` com providers cliente via `<EquipmentProviders />` importado de um arquivo cliente.
- Extrair o conteúdo de `Layout.tsx` (navbar) para `app/patrimonio/components/patrimonio-layout.tsx` marcado com `'use client'`.
- Encapsular a navegação usando `next/link` no lugar de `react-router-dom/Link`.
- Para destacar rota ativa, use `usePathname()` do `next/navigation` em vez de `useLocation`.

### 6.2. Providers e estado

- Mover `EquipmentContext` para `app/patrimonio/context/equipment-provider.tsx`.
  - Marcar arquivo com `'use client'` (usa estado e localStorage).
  - Ajustar import de tipos para `@/app/patrimonio/types/equipment`.
  - Para evitar `window` em SSR, lazy-load os dados: dentro de `useEffect`, use `typeof window !== 'undefined'` antes de acessar `localStorage`.
  - Expor hook `useEquipment()` semelhante ao atual.
- Criar componente `EquipmentProviders` (cliente) que agrupa `EquipmentProvider`, `TooltipProvider`, `ThemeProvider` (se aplicável) e `Toaster/Sonner`.

### 6.3. Portar bibliotecas utilitárias

- Criar `app/patrimonio/lib/equipment-storage.ts` com as funções atuais ajustadas para SSR (usar `if (typeof localStorage === 'undefined') return []`).
- Mover tipos para `app/patrimonio/types/equipment.ts` (ou reaproveitar `@/types/...` caso sejam compartilhados).

### 6.4. Portar páginas

1. **Dashboard** (`page.tsx`):
   - Marcar com `'use client'` (usa contexto e efeitos).
   - Reutilizar componentes shadcn da raiz (`@/components/ui/card`, etc.).
   - Substituir `Link` por `next/link` apontando às novas rotas.

2. **Equipamentos** (`equipamentos/page.tsx`):
   - `'use client'` no topo.
   - Ajustar modal de confirmação (`AlertDialog`) importando de `@/components/ui/alert-dialog`.
   - Atualizar `toast` para usar `useToast` que será exportado a partir de `app/patrimonio/hooks/use-toast` ou reaproveitar `@/components/ui/use-toast` se existir.

3. **Cadastro** (`cadastrar/page.tsx`):
   - `'use client'`.
   - Substituir `useNavigate` por `useRouter` (`router.push('/patrimonio/equipamentos')`).
   - Garantir que `toast` utiliza provider configurado.

4. **Eventos** (`eventos/page.tsx`):
   - `'use client'`.
   - Ajustar prints e acesso ao `window` com checagem de ambiente (`if (typeof window === 'undefined') return`).
   - Atualizar `Dialog`/`Checkbox` imports.

5. **NotFound** (`not-found.tsx`):
   - Usar componentes/diretrizes do projeto principal (link com `next/link`).

### 6.5. Hooks de suporte

- `useIsMobile`: manter em `app/patrimonio/hooks/use-is-mobile.ts` com `'use client'`.
- `useToast`: verificar se já existe `@/components/ui/use-toast`. Se sim, remapear para evitar duplicidade.

### 6.6. Estilos e assets

- Importar estilos necessários no layout (`import '@/app/patrimonio/styles/patrimonio.css'`).
- Se possível, reutilizar `app/globals.css` e remover `index.css`. Caso precise de tokens exclusivos, mova para CSS scoped ou `tailwind.config` global.

### 6.7. Navegação global

- Adicionar item “Patrimônio” na navbar principal (`components/navbar.tsx`) apontando para `#patrimonio` na home e para `/patrimonio` no menu principal.
- Atualizar `PatrimonioSection` para linkar para a nova rota.

### 6.8. Sanitização pós-migração

- Remover diretório antigo `app/(intranet)/Patrimonio/` após validar a migração.
- Limpar `public/patrimonio` caso não seja mais necessário.
- Ajustar `tsconfig.json` para incluir novos paths caso necessários.

## 7. Dependências a confirmar no projeto Next

```
npm install react-hook-form @hookform/resolvers zod @tanstack/react-query react-day-picker lucide-react sonner react-resizable-panels embla-carousel-react input-otp vaul tailwindcss-animate
```

Verifique antes se alguma já está presente para evitar duplicidade.

## 8. Testes e validação

1. `npm run lint` e `npm run build` para garantir saúde do monorepo.
2. Teste manual das rotas:
   - `/patrimonio`
   - `/patrimonio/equipamentos`
   - `/patrimonio/cadastrar`
   - `/patrimonio/eventos`
3. Validar persistência local (`localStorage`) e mensagens de toast.
4. Conferir responsividade (desktop/tablet/mobile).

## 9. Próximos passos futuros

- Substituir `localStorage` por camada backend (Supabase, Prisma, etc.).
- Implementar autenticação e controle de acesso baseado em perfil.
- Criar testes e2e/regression usando Playwright ou Cypress.
- Automatizar geração de relatórios (download CSV/PDF).
- Internacionalização caso necessário.

---

Seguir este guia garante uma migração controlada, aderente às convenções do repositório e facilita a evolução futura do módulo Patrimônio dentro da intranet Next.js.

## Checklist de execução

- [ ] Criar estrutura `app/patrimonio` com layout, rotas (`page.tsx`, `equipamentos/page.tsx`, `cadastrar/page.tsx`, `eventos/page.tsx`, `not-found.tsx`).
- [ ] Extrair layout do Patrimônio para `app/patrimonio/components/patrimonio-layout.tsx` utilizando `next/link` e `usePathname`.
- [ ] Migrar `EquipmentContext` para `app/patrimonio/context/equipment-provider.tsx` com salvamento seguro em `localStorage`.
- [ ] Criar `app/patrimonio/providers.tsx` reunindo `EquipmentProvider`, `TooltipProvider`, `Toaster` e demais providers necessários.
- [ ] Copiar componentes shadcn necessários (Card, Badge, AlertDialog, Dialog, Checkbox, Label, Toast etc.) para `components/ui/` ou reutilizar existentes.
- [ ] Portar hooks/utilitários (`use-is-mobile`, `use-toast`, `lib/equipment-storage.ts`, `types/equipment.ts`).
- [ ] Atualizar páginas para usar componentes e hooks migrados, substituindo `react-router-dom` por APIs do Next.
- [ ] Ajustar navegação global (`components/navbar.tsx`, `components/patrimonio-section.tsx`) para apontar para `/patrimonio`.
- [ ] Remover aplicação Vite antiga (`app/(intranet)/Patrimonio/`) e artefatos estáticos (`public/patrimonio`).
- [ ] Executar `npm run lint` e `npm run build` garantindo que o projeto permanece íntegro.

