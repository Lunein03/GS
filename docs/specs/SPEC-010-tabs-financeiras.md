# SPEC-010: Tabs Financeiras

**Status:** ⬜ Pendente
**Prioridade:** P2
**Estimativa:** 25 min
**Dependências:** SPEC-002

---

## 📋 Objetivo

Implementar as abas relacionadas a configurações financeiras e legais da proposta: **Pagamentos** (condições e parcelas) e **Assinaturas** (definição de responsáveis e testemunhas).

## 📊 Requisitos Funcionais

### 1. Tab Pagamentos

- Seleção de **Modo de Pagamento** (Boleto, PIX, Cartão, Transferência).
- Definição de **Condições** (À vista, 30 dias, 50% entrada + 50%).
- Listagem de parcelas previstas (Data, Valor, Status).
- Sincronização com o campo `paymentMode` do formulário principal.

### 2. Tab Assinaturas

- Definição de quem assina pela **Contratada** (GS Produções).
- Definição de quem assina pela **Contratante** (Cliente).
- Campos para testemunhas (opcional).
- _Integração:_ Pode buscar contatos do cliente selecionado.

## 🎨 Layout e UX

### Pagamentos

- Cards selecionáveis para métodos de pagamento.
- Formulário simples para condições.

### Assinaturas

- Grid de cards para cada assinante.
- Botão "Adicionar Assinante".

## 📁 Estrutura de Arquivos

### 1. Criar Componentes

- `src/features/gs-propostas/ui/components/proposta-unificada/tabs/pagamentos-tab.tsx`
- `src/features/gs-propostas/ui/components/proposta-unificada/tabs/assinaturas-tab.tsx`

### 2. Integrar no Principal

Atualizar `proposta-unificada.tsx`:

- Importar novos componentes
- Substituir placeholders

## ✅ Checklist de Implementação

- [ ] Criar `tabs/pagamentos-tab.tsx`
- [ ] Integrar seleção de modo de pagamento
- [ ] Criar `tabs/assinaturas-tab.tsx`
- [ ] Implementar campos de assinantes
- [ ] Integrar no `PropostaUnificada`

## 🔍 Verificação

| Check            | Resultado Esperado           |
| ---------------- | ---------------------------- |
| Mudar Pagamento  | Form state atualiza          |
| Editar Assinante | Dados persistem na navegação |
