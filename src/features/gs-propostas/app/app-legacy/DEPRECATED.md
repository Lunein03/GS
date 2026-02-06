# ⚠️ DEPRECATED

Esta pasta contém código legado do GS Propostas.

## Status

- **Data de Deprecação:** 2026-02-03
- **Razão:** Migração para Centro de Propostas Unificado
- **Remoção Prevista:** 2026-03-01

## Migração

Os componentes desta pasta foram migrados para novas tabs inline no Centro de Propostas Unificado:

- `src/features/gs-propostas/ui/components/proposta-unificada/`

### Componentes Migrados

| Original                | Novo Local                                 | Status      |
| ----------------------- | ------------------------------------------ | ----------- |
| `cadastro/clientes/`    | `proposta-unificada/tabs/clientes-tab.tsx` | ✅ Migrado  |
| `cadastro/empresas/`    | `proposta-unificada/tabs/empresas-tab.tsx` | ✅ Migrado  |
| `cadastro/categorias/`  | Inline na tab Principal                    | ⏳ Pendente |
| `cadastro/itens/`       | Inline na tab Itens                        | ⏳ Pendente |
| `cadastro/notas/`       | Inline na tab Documentos                   | ⏳ Pendente |
| `cadastro/pagamentos/`  | Inline na tab Pagamentos                   | ⏳ Pendente |
| `cadastro/assinaturas/` | Inline na tab Assinaturas                  | ⏳ Pendente |

## Rota Principal

O novo fluxo de criação de propostas está em:

```
/gs-propostas/proposta/nova
```

Essa rota abre o **Centro de Propostas Unificado** (`PropostaUnificada`), que contém:

- ✅ Tab Principal (dados da proposta, cliente, empresa)
- ✅ Tab Clientes (cadastro inline)
- ✅ Tab Empresas (cadastro inline)
- ⏳ Tab Itens
- ⏳ Tab Documentos
- ⏳ Tab Pagamentos

## Não Modificar

❌ **Não faça modificações nesta pasta.**  
✅ Faça modificações nos novos componentes em `proposta-unificada/`.

## Arquivos que Devem Ser Removidos

Quando a migração estiver 100% completa (previsão: 2026-03-01):

1. `src/features/gs-propostas/ui/components/new-opportunity-modal.tsx`
2. Esta pasta inteira (`app-legacy/`)

## Referências

- Specs de migração: `/docs/specs/`
- Index das specs: `/docs/specs/SPECS-INDEX.md`
- Plano de reorganização: `/gs-propostas-reorganization.md`
