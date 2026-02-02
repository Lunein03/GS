# 🧹 Plano de Limpeza e Organização do Código

**Data de Criação:** 2026-01-14
**Status:** ✅ CONCLUÍDO

---

## 1. Deletar Código Morto

- [x] Deletar `backup/homepage-design/` - Pasta de backup obsoleta
- [x] Deletar `components/ui/demo.tsx` - Arquivo de demonstração não utilizado
- [x] Deletar `src/shared/ui/background-noise-effect.tsx` - Componente antigo substituído
- [x] Deletar `src/shared/components/brand-carousel.tsx` - Componente não importado

## 2. Consolidar Estrutura de UI

- [x] Mover componentes de `components/ui/` para `src/shared/ui/`
  - [x] Deletar `components/ui/button.tsx` (duplicado)
  - [x] Deletar `components/ui/card.tsx` (duplicado)
  - [x] Deletar `components/ui/input.tsx` (duplicado)
  - [x] Deletar `components/ui/label.tsx` (duplicado)
  - [x] Deletar `components/ui/tabs.tsx` (duplicado)
  - [x] Deletar `components/ui/radio-group.tsx` (duplicado)
  - [x] Deletar `components/ui/dropdown-menu.tsx` (duplicado)
  - [x] Manter `components/ui/theme.tsx` - Em uso pelo ModeToggle (imports atualizados)
  - [x] Manter `components/ui/theme-button.tsx` - Dependência do theme.tsx

## 3. Consolidar Utilitários (lib)

- [x] Mover `lib/currency.ts` para `src/shared/lib/currency.ts`
- [x] Deletar `lib/utils.ts` (era apenas re-export)
- [x] Deletar pasta `lib/` completamente
- [x] Atualizar imports que usavam `@/lib/currency`:
  - [x] `src/features/patrimonio/ui/components/equipment-list-content.tsx`
  - [x] `src/features/patrimonio/ui/components/add-equipment-form.tsx`
  - [x] `src/features/patrimonio/api/equipment.ts`
- [x] Atualizar `components/ui/theme.tsx` para usar `@/shared/lib/utils`
- [x] Remover path `@/lib/*` do `tsconfig.json`

## 4. Organizar Types

- [x] Mover `types/qrcode.d.ts` para `src/features/drive-qr/types/qrcode.d.ts`
- [x] Deletar pasta `types/` da raiz
- [x] Deletar pasta `backup/` vazia

## 5. Limpeza Final

- [x] Verificar se aplicação ainda compila
  - ⚠️ Erros pré-existentes de tipagem em API routes dinâmicas (não relacionados à limpeza)
- [x] Atualizar tsconfig.json

---

## Resumo das Mudanças

### Arquivos Deletados

- `backup/homepage-design/` (7 arquivos)
- `components/ui/demo.tsx`
- `components/ui/button.tsx`
- `components/ui/card.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components/ui/tabs.tsx`
- `components/ui/radio-group.tsx`
- `components/ui/dropdown-menu.tsx`
- `src/shared/ui/background-noise-effect.tsx`
- `src/shared/components/brand-carousel.tsx`
- `lib/` (pasta inteira)
- `types/` (pasta inteira)
- `backup/` (pasta vazia)

### Arquivos Movidos/Criados

- `lib/currency.ts` → `src/shared/lib/currency.ts`
- `types/qrcode.d.ts` → `src/features/drive-qr/types/qrcode.d.ts`

### Arquivos Atualizados

- `components/ui/theme.tsx` - Imports atualizados para `@/shared/*`
- `src/features/patrimonio/ui/components/equipment-list-content.tsx`
- `src/features/patrimonio/ui/components/add-equipment-form.tsx`
- `src/features/patrimonio/api/equipment.ts`
- `tsconfig.json` - Removido path `@/lib/*`

---

## Notas

- A pasta `app-legacy` dentro de features foi **mantida** pois está em uso ativo
- Os componentes em `components/ui/theme*.tsx` foram mantidos pois são usados pelo navbar
- Erros de tipagem em `.next/types/validator.ts` são pré-existentes (não da limpeza)
