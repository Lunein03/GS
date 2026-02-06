# SPEC-008: Tab Itens

**Status:** ✅ Concluído
**Prioridade:** P1
**Estimativa:** 30 min
**Dependências:** SPEC-002
**Data de Conclusão:** 2026-02-03

---

## 📋 Objetivo

Implementar a aba "Itens" no Centro de Propostas Unificado, permitindo a gestão completa dos produtos/serviços da proposta com interface de tabela editável (similar a uma planilha).

## 📊 Requisitos Funcionais

1. **Listagem de Itens**
   - Tabela com colunas: #, Descrição, Quantidade, Valor Unitário, Total, Ações.
   - Cálculo automático de totais por linha (Qty \* Unit).
   - Cálculo automático do total geral da proposta.

2. **Edição Inline**
   - Campos input diretos na tabela para edição rápida.
   - Validação de tipos (número para valores, texto para descrição).

3. **Gestão de Linhas**
   - Botão "Adicionar Item" que insere nova linha vazia.
   - Botão de exclusão (lixeira) em cada linha (aparece no hover).
   - Mensagem de estado vazio quando não há itens.

4. **Integração**
   - Sincronização em tempo real com o formulário principal (`useFormContext`).
   - Atualização automática do Preview PDF ao editar itens.

## 🎨 Layout e UX

### Tabela

- **Header:** Sticky top, fundo levemente destacado.
- **Linhas:** Hover effect para melhor legibilidade.
- **Inputs:** Estilo "ghost" (sem borda até focar) para visual limpo.
- **Formatação:** Valores monetários em BRL (R$ 1.200,00).

### Exemplo Visual

```
+---+----------------------------+-----+-------------+-------------+---+
| # | Descrição                  | Qtd | Valor Unit. | Total       |   |
+---+----------------------------+-----+-------------+-------------+---+
| 1 | Serviço de Intérprete...   | [2] | [R$ 1200]   | R$ 2.400,00 | 🗑️|
| 2 | Taxa de deslocamento       | [1] | [R$ 150]    | R$ 150,00   | 🗑️|
+---+----------------------------+-----+-------------+-------------+---+
                                         TOTAL GERAL: R$ 2.550,00
```

## 📁 Estrutura de Arquivos

### 1. Criar Componente

`src/features/gs-propostas/ui/components/proposta-unificada/tabs/itens-tab.tsx`

```tsx
import { useFormContext, useFieldArray } from "react-hook-form";
// ... imports
// Tabela e lógica de cálculo
```

### 2. Integrar no Principal

Atualizar `proposta-unificada.tsx`:

- Importar `ItensTab`
- Substituir placeholder na `TabsContent value="itens"`

## ✅ Checklist de Implementação

- [x] Criar arquivo `tabs/itens-tab.tsx`
- [x] Implementar `useFieldArray` para array de items
- [x] Criar layout de tabela responsivo
- [x] Adicionar inputs controlados pelo React Hook Form
- [x] Implementar cálculos de total por linha
- [x] Implementar cálculo de total geral no footer da tabela
- [x] Adicionar formatação de moeda (BRL)
- [x] Integrar no componente `PropostaUnificada`
- [x] Testar adição e remoção de linhas
- [x] Verificar atualização no Preview PDF

## 🔍 Verificação Realizada

| Check          | Resultado                            |
| -------------- | ------------------------------------ |
| TypeScript     | ✅ Exit code 0                       |
| Layout Tabela  | ✅ Headers destacados, sticky top    |
| Adicionar Item | ✅ Linha aparece, valores default OK |
| Editar Valor   | ✅ Qty \* Unit calcula corretamente  |
| Remover Item   | ✅ Remove e recalcula total geral    |
| Formatação     | ✅ BRL (R$) e inputs numéricos       |
| Sincronização  | ✅ Formulário principal recebe dados |

---

**Anterior:** [SPEC-007-migration.md](./SPEC-007-migration.md)  
**Próximo:** [SPEC-009-tabs-apoio.md](./SPEC-009-tabs-apoio.md)
