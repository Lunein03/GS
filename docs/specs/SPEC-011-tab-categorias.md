# SPEC-011: Tab Categorias

**Status:** ⬜ Pendente
**Prioridade:** P3
**Estimativa:** 15 min
**Dependências:** SPEC-002

---

## 📋 Objetivo

Implementar a aba **Categorias** para classificação e organização das propostas. Permite cadastrar e vincular tags/categorias à proposta atual.

## 📊 Requisitos Funcionais

1. **Gestão de Categorias**
   - CRUD simplificado de categorias (Nome, Cor, Descrição).
   - _Nota:_ Similar às tabs Clientes e Empresas, mas mais simples.

2. **Seleção Múltipla**
   - Interface (Checkboxes ou Multi-select) para vincular categorias à proposta.
   - Ex: "Acessibilidade", "Interpretação", "Legenda".

## 🎨 Layout e UX

- Layout de duas colunas:
  - Esquerda: Categorias disponíveis (selecionáveis).
  - Direita: Formulário para nova categoria.

## 📁 Estrutura de Arquivos

### 1. Criar Componente

`src/features/gs-propostas/ui/components/proposta-unificada/tabs/categorias-tab.tsx`

### 2. Integrar no Principal

Atualizar `proposta-unificada.tsx`.

## ✅ Checklist de Implementação

- [ ] Criar `tabs/categorias-tab.tsx`
- [ ] Implementar listagem e criação de categorias (mock ou API existente)
- [ ] Integrar seleção no formulário da proposta
- [ ] Integrar no `PropostaUnificada`

## 🔍 Verificação

| Check           | Resultado Esperado             |
| --------------- | ------------------------------ |
| Criar Categoria | Aparece na lista imediatamente |
| Selecionar      | Vincula ao form state          |
