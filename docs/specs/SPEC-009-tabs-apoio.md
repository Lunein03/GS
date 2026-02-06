# SPEC-009: Tabs de Apoio

**Status:** ✅ Concluído
**Prioridade:** P2
**Estimativa:** 25 min
**Dependências:** SPEC-002
**Data de Conclusão:** 2026-02-03

---

## 📋 Objetivo

Implementar as abas de apoio que enriquecem a proposta com informações adicionais: **Documentos** (upload de arquivos), **Notas** (observações internas/externas) e **Histórico** (timeline de ações).

## 📊 Requisitos Funcionais

### 1. Tab Documentos

- Interface para upload de arquivos relacionados à proposta.
- Listagem de arquivos anexados (Nome, Tamanho, Data).
- Ações: Visualizar, Baixar, Excluir.
- _Nota:_ Inicialmente mockup funcional, backend de upload virá depois.

### 2. Tab Notas (Cad. Notas)

- Editor de texto (Textarea simples inicialmente) para observações que vão no **rodapé da proposta**.
- Campo separado para **Anotações Internas** (não visíveis ao cliente).
- Integração com o campo `observations` do formulário principal.

### 3. Tab Histórico

- Timeline vertical mostrando eventos da proposta.
- Eventos: Criação, Edição, Mudança de Status, Envio de E-mail.
- _Nota:_ Dados mockados inicialmente, estrutura pronta para receber logs reais.

## 🎨 Layout e UX

### Notas

- Layout dividido ou abas internas: "Obs. da Proposta" vs "Notas Internas".
- Textarea com auto-resize.

### Histórico

- Componente de Timeline (linha vertical com pontos).
- Ícones para diferentes tipos de evento (📝 Editou, 📧 Enviou, ✅ Aprovou).

## 📁 Estrutura de Arquivos

### 1. Criar Componentes

- `src/features/gs-propostas/ui/components/proposta-unificada/tabs/documentos-tab.tsx`
- `src/features/gs-propostas/ui/components/proposta-unificada/tabs/notas-tab.tsx`
- `src/features/gs-propostas/ui/components/proposta-unificada/tabs/historico-tab.tsx`

### 2. Integrar no Principal

Atualizar `proposta-unificada.tsx`:

- Importar novos componentes
- Substituir placeholders correspondentes

## ✅ Checklist de Implementação

- [x] Criar `tabs/notas-tab.tsx` (prioridade alta - usado no PDF)
- [x] Integrar campo `observations` no NotasTab
- [x] Criar `tabs/documentos-tab.tsx` (interface de lista)
- [x] Criar `tabs/historico-tab.tsx` (visual de timeline)
- [x] Integrar todos no `PropostaUnificada`

## 🔍 Verificação Realizada

| Check            | Resultado                                                     |
| ---------------- | ------------------------------------------------------------- |
| Digitar em Notas | ✅ Texto aparece no field observations (PDF preview atualiza) |
| Tab Documentos   | ✅ Lista mockada renderiza corretamente com ícones            |
| Tab Histórico    | ✅ Timeline visual renderiza com ícones coloridos             |
| Navegação        | ✅ Alternar entre tabs não perde o estado                     |
| Performance      | ✅ Lazy loading implementado (dynamic imports)                |
