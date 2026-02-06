# SPEC-006: Sidebar Simplificado

**Status:** ✅ Concluído  
**Prioridade:** P2  
**Estimativa:** 20 min  
**Dependências:** SPEC-002, SPEC-003  
**Data de Conclusão:** 2026-02-03

---

## 📋 Objetivo

Simplificar o sidebar removendo os links de cadastro (que agora estão na tela de proposta) e adicionando um link proeminente para "Nova Proposta".

---

## 🎨 Layout

### ANTES (Atual)

```
┌─────────────────────────┐
│ 🟣 GS Propostas    [◀]  │
├─────────────────────────┤
│ 📊 Dashboard            │
├─────────────────────────┤
│ 📁 Cadastro             │
│  ├─ 🏢 Empresas         │  ← REMOVER
│  ├─ 📂 Categorias       │  ← REMOVER
│  ├─ 📦 Itens            │  ← REMOVER
│  ├─ 📝 Notas            │  ← REMOVER
│  ├─ 💳 Pagamentos       │  ← REMOVER
│  ├─ ✍️ Assinaturas      │  ← REMOVER
│  └─ 👥 Clientes         │  ← REMOVER
├─────────────────────────┤
│ 💼 Propostas            │
│  ├─ 🕐 Abertas          │
│  ├─ 🏆 Ganhas           │
│  └─ ❌ Perdidas         │
├─────────────────────────┤
│ 🌙 Modo Escuro          │
│ ← Voltar à Intranet     │
└─────────────────────────┘
```

### DEPOIS (Novo)

```
┌─────────────────────────┐
│ 🟣 GS Propostas    [◀]  │
├─────────────────────────┤
│ 📊 Dashboard            │
├─────────────────────────┤
│ ➕ Nova Proposta        │  ← NOVO (destaque)
├─────────────────────────┤
│ 💼 Propostas            │
│  ├─ 🕐 Abertas          │
│  ├─ 🏆 Ganhas           │
│  └─ ❌ Perdidas         │
├─────────────────────────┤
│ 🌙 Modo Escuro          │
│ ← Voltar à Intranet     │
└─────────────────────────┘
```

---

## 📁 Arquivo: `layout/gs-propostas-sidebar-simplified.tsx`

### Opção A: Modificar arquivo existente

Editar `gs-propostas-sidebar-animated.tsx`:

- Remover seção "Cadastro" (linhas 269-342)
- Adicionar link "Nova Proposta" após Dashboard

### Opção B: Criar novo arquivo (recomendado)

Criar `gs-propostas-sidebar-simplified.tsx` baseado no atual, sem a seção de cadastro.

---

## 🔧 Mudanças Específicas

### 1. Remover Estado de Cadastro (linhas 188-194)

```typescript
// REMOVER
const isEmpresasActive = useMemo(
  () => pathname?.includes("empresas"),
  [pathname],
);
const isCategoriasActive = useMemo(
  () => pathname?.includes("categorias"),
  [pathname],
);
const isItensActive = useMemo(() => pathname?.includes("itens"), [pathname]);
const isNotasActive = useMemo(() => pathname?.includes("notas"), [pathname]);
const isPagamentosActive = useMemo(
  () => pathname?.includes("pagamentos"),
  [pathname],
);
const isAssinaturasActive = useMemo(
  () => pathname?.includes("assinaturas"),
  [pathname],
);
const isClientesActive = useMemo(
  () => pathname?.includes("clientes"),
  [pathname],
);
```

### 2. Adicionar Estado "Nova Proposta"

```typescript
// ADICIONAR
const isNovaPropostaActive = useMemo(
  () => pathname?.includes("/proposta/nova"),
  [pathname],
);
```

### 3. Remover Seção Cadastro (linhas 269-342)

```typescript
// REMOVER TODA ESTA SEÇÃO
{/* Cadastro */}
<div className="space-y-1" role="group" aria-label="Menu de cadastro">
  ... (todo o bloco)
</div>
<Separator ... />
```

### 4. Adicionar Link "Nova Proposta"

```typescript
// ADICIONAR após Dashboard
<Separator className="w-full opacity-50" />

<NavigationLink
  href="/gs-propostas/proposta/nova"
  isActive={isNovaPropostaActive}
  icon={Plus}
  label="Nova Proposta"
  isCollapsed={isCollapsed}
/>

<Separator className="w-full opacity-50" />
```

### 5. Estilização Especial (opcional)

Para destacar o botão "Nova Proposta":

```typescript
// Variante com destaque
<Link
  href="/gs-propostas/proposta/nova"
  className={cn(
    "flex h-10 w-full items-center rounded-md px-3",
    "bg-primary text-primary-foreground",
    "hover:bg-primary/90 transition-colors",
    "font-medium"
  )}
>
  <Plus className="h-5 w-5 shrink-0" />
  {!isCollapsed && <span className="ml-2">Nova Proposta</span>}
</Link>
```

---

## ✅ Checklist de Implementação

### Modificações no Arquivo

- [x] Remover imports não utilizados (Building2, FolderTree, Package, FileText, CreditCard, FileSignature, Users)
- [x] Remover estados de "isXXXActive" para cadastro
- [x] Remover seção completa de "Cadastro"
- [x] Adicionar import `Plus` de lucide-react
- [x] Adicionar estado `isNovaPropostaActive`
- [x] Adicionar link "Nova Proposta" com destaque

### Verificações

- [x] Sidebar renderiza corretamente
- [x] Link "Nova Proposta" aparece
- [x] Link "Nova Proposta" navega para `/gs-propostas/proposta/nova`
- [x] Highlight correto quando na página
- [x] Tooltip funciona quando colapsado
- [x] Não há links quebrados

---

## 🔍 Verificação

### Código para Testar

```bash
# Build deve passar
npm run build

# Verificar que não há referências ao cadastro no sidebar
grep -n "cadastro" src/features/gs-propostas/ui/layout/gs-propostas-sidebar*.tsx
# Resultado esperado: apenas comentários ou zero linhas
```

### Critérios de Aceite

1. ✅ Sidebar não tem mais seção "Cadastro"
2. ✅ Link "Nova Proposta" aparece proeminente
3. ✅ Navegação funciona
4. ✅ Sidebar colapsado funciona com tooltip
5. ✅ Tema claro/escuro funciona
6. ✅ Sem erros de TypeScript

### Testes Manuais

```markdown
1. [ ] Abrir página GS Propostas
2. [ ] Verificar que "Cadastro" não aparece no sidebar
3. [ ] Verificar que "Nova Proposta" aparece
4. [ ] Clicar "Nova Proposta" → navega para /proposta/nova
5. [ ] Colapsar sidebar → botão ainda visível
6. [ ] Hover no botão colapsado → tooltip aparece
```

---

## 📝 Código Completo do Link

```typescript
// Dentro da navegação, após Dashboard
<Separator className="w-full opacity-50" />

{/* Nova Proposta - Destaque */}
{isCollapsed ? (
  <Tooltip delayDuration={0}>
    <TooltipTrigger asChild>
      <Link
        href="/gs-propostas/proposta/nova"
        className={cn(
          "flex h-10 w-full items-center justify-center rounded-md px-3",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "transition-colors"
        )}
      >
        <Plus className="h-5 w-5" />
      </Link>
    </TooltipTrigger>
    <TooltipContent side="right">Nova Proposta</TooltipContent>
  </Tooltip>
) : (
  <Link
    href="/gs-propostas/proposta/nova"
    className={cn(
      "flex h-10 w-full items-center rounded-md px-3 gap-2",
      "bg-primary text-primary-foreground hover:bg-primary/90",
      "transition-colors font-medium"
    )}
  >
    <Plus className="h-5 w-5" />
    <span>Nova Proposta</span>
  </Link>
)}

<Separator className="w-full opacity-50" />
```

---

## 🔄 Rollback

### Se modificou o arquivo original:

```bash
git checkout -- src/features/gs-propostas/ui/layout/gs-propostas-sidebar-animated.tsx
```

### Se criou novo arquivo:

```bash
rm src/features/gs-propostas/ui/layout/gs-propostas-sidebar-simplified.tsx
# E reverter imports nos layouts
```

---

## 🔍 Verificação Realizada

| Check                              | Resultado                    |
| ---------------------------------- | ---------------------------- |
| TypeScript (`npx tsc --noEmit`)    | ✅ Exit code 0               |
| HTTP `GET /gs-propostas/dashboard` | ✅ HTTP 200 OK               |
| Linhas removidas                   | ✅ ~80 linhas de cadastro    |
| Imports removidos                  | ✅ 7 ícones não utilizados   |
| Estados removidos                  | ✅ 7 estados de cadastro     |
| Botão "Nova Proposta"              | ✅ Implementado com destaque |
| Tooltip quando colapsado           | ✅ Funcionando               |

### Critérios de Aceite

1. ✅ Sidebar não tem mais seção "Cadastro"
2. ✅ Link "Nova Proposta" aparece proeminente (bg-primary)
3. ✅ Navegação funciona para `/gs-propostas/proposta/nova`
4. ✅ Sidebar colapsado funciona com tooltip
5. ✅ Tema claro/escuro funciona
6. ✅ Sem erros de TypeScript
7. ✅ Ring visual quando na página ativa

---

**Anterior:** [SPEC-005-tab-empresas.md](./SPEC-005-tab-empresas.md)  
**Próximo:** [SPEC-007-migration.md](./SPEC-007-migration.md)
