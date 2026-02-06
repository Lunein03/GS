# GS Propostas - Reorganização da Arquitetura

**Tipo de Projeto:** WEB (Next.js)  
**Data:** 2026-02-03  
**Status:** 🟡 ANALYSIS (Aguardando aprovação)

---

## 📋 Overview

### Problema Identificado

O sistema GS Propostas apresenta **duplicidade de funcionalidades** que causa confusão na UX:

1. **Sidebar** contém links para: Empresas, Categorias, Itens, Notas, Pagamentos, Assinaturas, Clientes
2. **Modal de Nova Proposta** contém abas idênticas: Clientes, Empresas, Categorias, Pagamentos, Assinaturas, Cad. Notas

**Impacto:**

- Usuário não sabe onde gerenciar cadastros
- Fluxo quebrado ao criar proposta (precisa sair do modal para cadastrar)
- Manutenção duplicada de código

### Solução Proposta: Centro de Propostas Unificado

Transformar o modal em uma **página full-screen dedicada** que centraliza:

- Criação/edição de propostas
- Gestão de cadastros relacionados (clientes, empresas, etc.)
- Histórico e relacionamentos

---

## ✅ Success Criteria

| Critério                      | Métrica                                               | Verificação       |
| ----------------------------- | ----------------------------------------------------- | ----------------- |
| **Eliminação de duplicidade** | Zero funcionalidades duplicadas entre sidebar e modal | Revisão de código |
| **Fluxo contínuo**            | Cadastrar cliente sem perder rascunho da proposta     | Teste manual      |
| **Performance**               | Navegação entre abas < 100ms                          | Lighthouse        |
| **Acessibilidade**            | WCAG AA em todos componentes                          | Audit script      |
| **Manutenibilidade**          | Único ponto de entrada para cadastros                 | Code review       |

---

## 🔍 Análise do Estado Atual

### Arquitetura Atual (PROBLEMÁTICA)

```
📂 src/app/(workspace)/gs-propostas/
├── dashboard/                    ← Dashboard principal
├── cadastro/                     ← 7 páginas de cadastro (DUPLICADAS)
│   ├── empresas/
│   ├── categorias/
│   ├── clientes/
│   ├── itens/
│   ├── notas/
│   ├── pagamentos/
│   └── assinaturas/
├── oportunidades/                ← Lista de propostas
└── layout.tsx

📂 src/features/gs-propostas/
├── ui/
│   ├── components/
│   │   └── new-opportunity-modal.tsx  ← MODAL com 10 abas (CONFUSO)
│   └── layout/
│       └── gs-propostas-sidebar-animated.tsx  ← SIDEBAR com 7+ links
├── app/
│   └── app-legacy/
│       └── cadastro/             ← Componentes legacy importados no modal
└── pages/
```

### Problemas Específicos

| Arquivo                             | Problema                                         | Impacto            |
| ----------------------------------- | ------------------------------------------------ | ------------------ |
| `new-opportunity-modal.tsx`         | 581 linhas, 10 abas, importa 6 páginas completas | Pesado, confuso    |
| `gs-propostas-sidebar-animated.tsx` | Links duplicados para cadastros                  | Navegação confusa  |
| `app-legacy/cadastro/*`             | Código legacy misturado com novo                 | Manutenção difícil |

---

## 🏗️ Arquitetura Proposta (OPÇÃO B)

### Nova Estrutura de Arquivos

```
📂 src/app/(workspace)/gs-propostas/
├── dashboard/
│   └── page.tsx                  ← Dashboard com métricas
├── proposta/
│   ├── [id]/
│   │   └── page.tsx              ← Tela unificada (edição)
│   └── nova/
│       └── page.tsx              ← Tela unificada (criação)
├── oportunidades/
│   ├── abertas/page.tsx
│   ├── ganhas/page.tsx
│   └── perdidas/page.tsx
├── layout.tsx
└── page.tsx                      ← Redirect para dashboard

📂 src/features/gs-propostas/
├── ui/
│   ├── components/
│   │   ├── proposta-unificada/   ← NOVO: Componente full-screen
│   │   │   ├── index.tsx
│   │   │   ├── tabs/
│   │   │   │   ├── principal-tab.tsx
│   │   │   │   ├── itens-tab.tsx
│   │   │   │   ├── documentos-tab.tsx
│   │   │   │   ├── clientes-tab.tsx       ← Cadastro inline
│   │   │   │   ├── empresas-tab.tsx       ← Cadastro inline
│   │   │   │   ├── categorias-tab.tsx
│   │   │   │   ├── pagamentos-tab.tsx
│   │   │   │   ├── assinaturas-tab.tsx
│   │   │   │   └── historico-tab.tsx      ← NOVO: Histórico do cliente
│   │   │   └── header.tsx
│   │   └── [remover: new-opportunity-modal.tsx]
│   └── layout/
│       └── gs-propostas-sidebar-simplified.tsx  ← Sidebar simplificado
└── app/
    └── [remover: app-legacy/]            ← Migrar para novo padrão
```

### Sidebar Simplificado

**ANTES (7+ itens sob Cadastro):**

```
├── Dashboard
├── Cadastro
│   ├── Empresas
│   ├── Categorias
│   ├── Itens
│   ├── Notas
│   ├── Pagamentos
│   ├── Assinaturas
│   └── Clientes
└── Propostas
    ├── Abertas
    ├── Ganhas
    └── Perdidas
```

**DEPOIS (limpo e focado):**

```
├── Dashboard
├── ➕ Nova Proposta         ← Link direto para /proposta/nova
└── Propostas
    ├── Abertas
    ├── Ganhas
    └── Perdidas
```

---

## 📊 Tech Stack

| Tecnologia    | Uso             | Justificativa                  |
| ------------- | --------------- | ------------------------------ |
| Next.js 15+   | App Router      | Já em uso, mantém consistência |
| React 19      | UI Components   | Já em uso                      |
| shadcn/ui     | Componentes     | Já em uso                      |
| React Query   | Estado servidor | Já em uso                      |
| Framer Motion | Animações       | Já em uso                      |
| Drizzle ORM   | Database        | Já em uso                      |

**Nenhuma nova dependência necessária.**

---

## 📋 Task Breakdown

### FASE 1: Preparação (P0)

#### Task 1.1: Criar estrutura de pastas

- **Agent:** `frontend-specialist`
- **Skills:** `clean-code`, `nextjs-react-expert`
- **Priority:** P0 (Bloqueador)
- **Dependencies:** Nenhuma
- **Estimativa:** 5 min

**INPUT:**

- Estrutura atual do projeto

**OUTPUT:**

- Novas pastas criadas:
  - `src/features/gs-propostas/ui/components/proposta-unificada/`
  - `src/features/gs-propostas/ui/components/proposta-unificada/tabs/`
  - `src/app/(workspace)/gs-propostas/proposta/`
  - `src/app/(workspace)/gs-propostas/proposta/nova/`
  - `src/app/(workspace)/gs-propostas/proposta/[id]/`

**VERIFY:**

```bash
ls -la src/features/gs-propostas/ui/components/proposta-unificada/
# → Pasta existe
```

---

#### Task 1.2: Criar componente base PropostaUnificada

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`, `nextjs-react-expert`
- **Priority:** P0 (Bloqueador)
- **Dependencies:** Task 1.1
- **Estimativa:** 30 min

**INPUT:**

- Análise do modal atual (`new-opportunity-modal.tsx`)
- Padrões de design existentes

**OUTPUT:**

- `proposta-unificada/index.tsx` → Componente container com tabs
- `proposta-unificada/header.tsx` → Header com ações

**VERIFY:**

- Componente renderiza sem erros
- TypeScript sem erros
- Tabs navegáveis

---

### FASE 2: Migração de Tabs (P1)

#### Task 2.1: Migrar tab Principal

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **Estimativa:** 20 min

**INPUT:**

- Código atual da tab Principal no modal (linhas 236-379)

**OUTPUT:**

- `tabs/principal-tab.tsx` → Componente isolado

**VERIFY:**

- Formulário funcional
- Seletor de cliente funcional
- Validação Zod funcional

---

#### Task 2.2: Migrar tab Itens

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **Estimativa:** 20 min

**INPUT:**

- Código atual da tab Itens no modal (linhas 382-478)

**OUTPUT:**

- `tabs/itens-tab.tsx` → Componente isolado com tabela editável

**VERIFY:**

- Adicionar/remover itens funciona
- Cálculo de totais funciona

---

#### Task 2.3: Migrar tab Clientes (inline)

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`, `clean-code`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **Estimativa:** 30 min

**INPUT:**

- `ClientesPage` do app-legacy
- API de clientes existente

**OUTPUT:**

- `tabs/clientes-tab.tsx` → Versão simplificada inline
  - Lista de clientes com busca
  - Formulário de novo cliente colapsável
  - Botão "Selecionar" para vincular à proposta

**VERIFY:**

- CRUD funcional
- Ao selecionar cliente, tab Principal atualiza

---

#### Task 2.4: Migrar tab Empresas (inline)

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`, `clean-code`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **Estimativa:** 30 min

**INPUT:**

- `EmpresasPage` do app-legacy
- API de empresas existente

**OUTPUT:**

- `tabs/empresas-tab.tsx` → Versão simplificada inline

**VERIFY:**

- CRUD funcional
- Integrado com contexto da proposta

---

#### Task 2.5: Migrar tabs restantes

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **Estimativa:** 45 min

**INPUT:**

- Tabs: Categorias, Pagamentos, Assinaturas, Notas, Documentos

**OUTPUT:**

- `tabs/categorias-tab.tsx`
- `tabs/pagamentos-tab.tsx`
- `tabs/assinaturas-tab.tsx`
- `tabs/notas-tab.tsx`
- `tabs/documentos-tab.tsx`

**VERIFY:**

- Todas as tabs renderizam
- Funcionalidades preservadas

---

### FASE 3: Integração (P2)

#### Task 3.1: Criar página /proposta/nova

- **Agent:** `frontend-specialist`
- **Skills:** `nextjs-react-expert`
- **Priority:** P2
- **Dependencies:** Tasks 2.1-2.5
- **Estimativa:** 15 min

**INPUT:**

- Componente PropostaUnificada

**OUTPUT:**

- `src/app/(workspace)/gs-propostas/proposta/nova/page.tsx`

**VERIFY:**

- URL `/gs-propostas/proposta/nova` funciona
- Formulário vazio para nova proposta

---

#### Task 3.2: Criar página /proposta/[id]

- **Agent:** `frontend-specialist`
- **Skills:** `nextjs-react-expert`
- **Priority:** P2
- **Dependencies:** Task 3.1
- **Estimativa:** 20 min

**INPUT:**

- Componente PropostaUnificada
- API de oportunidades

**OUTPUT:**

- `src/app/(workspace)/gs-propostas/proposta/[id]/page.tsx`

**VERIFY:**

- URL `/gs-propostas/proposta/123` carrega dados
- Edição funcional

---

#### Task 3.3: Simplificar Sidebar

- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`, `clean-code`
- **Priority:** P2
- **Dependencies:** Task 3.1
- **Estimativa:** 20 min

**INPUT:**

- `gs-propostas-sidebar-animated.tsx` atual (442 linhas)

**OUTPUT:**

- Sidebar simplificado removendo:
  - Seção "Cadastro" inteira (7 links)
  - Adicionando link "Nova Proposta" proeminente

**VERIFY:**

- Sidebar renderiza corretamente
- Link "Nova Proposta" leva para `/proposta/nova`
- Links removidos não quebram nada

---

### FASE 4: Limpeza (P3)

#### Task 4.1: Remover modal antigo

- **Agent:** `frontend-specialist`
- **Skills:** `clean-code`
- **Priority:** P3
- **Dependencies:** Tasks 3.1-3.3
- **Estimativa:** 10 min

**INPUT:**

- Referências ao `NewOpportunityModal`

**OUTPUT:**

- Arquivo `new-opportunity-modal.tsx` removido
- Todas as importações atualizadas

**VERIFY:**

```bash
grep -r "NewOpportunityModal" src/
# → Nenhum resultado
```

---

#### Task 4.2: Marcar app-legacy como deprecated

- **Agent:** `frontend-specialist`
- **Skills:** `documentation-templates`
- **Priority:** P3
- **Dependencies:** Task 4.1
- **Estimativa:** 5 min

**INPUT:**

- Pasta `app-legacy`

**OUTPUT:**

- Arquivo `DEPRECATED.md` na pasta
- Comentários nos arquivos

**VERIFY:**

- Documentação clara sobre migração

---

### FASE X: Verificação Final

#### Checklist de Qualidade

- [ ] **Lint:** `npm run lint` passa
- [ ] **TypeScript:** `npx tsc --noEmit` sem erros
- [ ] **Build:** `npm run build` sucesso
- [ ] **Funcional:** Criar proposta end-to-end funciona
- [ ] **Cadastros:** CRUD de clientes inline funciona
- [ ] **Performance:** Navegação entre tabs < 100ms
- [ ] **Responsivo:** Funciona em mobile

#### Scripts de Auditoria

```bash
# Executar verificação completa
python .agent/scripts/verify_all.py . --url http://localhost:3000

# Ou individualmente:
npm run lint && npx tsc --noEmit
npm run build
python .agent/skills/frontend-design/scripts/ux_audit.py .
```

---

## ⚠️ Riscos Identificados

| Risco                      | Probabilidade | Impacto | Mitigação                     |
| -------------------------- | ------------- | ------- | ----------------------------- |
| Regressão em formulários   | Média         | Alto    | Testes manuais após cada task |
| Perda de dados em rascunho | Baixa         | Alto    | Implementar auto-save         |
| Sidebar quebrado           | Baixa         | Médio   | Backup antes de modificar     |
| Performance tabs pesadas   | Média         | Médio   | Lazy loading das tabs         |

---

## 📊 Estimativa Total

| Fase                | Tempo Estimado |
| ------------------- | -------------- |
| Fase 1: Preparação  | 35 min         |
| Fase 2: Migração    | 2h 25min       |
| Fase 3: Integração  | 55 min         |
| Fase 4: Limpeza     | 15 min         |
| Fase X: Verificação | 30 min         |
| **TOTAL**           | **~4-5 horas** |

---

## 🔄 Rollback Strategy

Se a migração falhar:

1. Git: `git checkout -- .` para reverter mudanças
2. Modal antigo permanece funcional durante toda a migração
3. Só remover modal após validação completa

---

## 📌 Próximos Passos

1. **APROVAÇÃO:** Usuário deve aprovar este plano
2. **SOLUTIONING:** Criar design detalhado das tabs
3. **IMPLEMENTATION:** Executar tasks em ordem
4. **VERIFICATION:** Rodar Phase X checklist

---

> 🟡 **STATUS:** Aguardando aprovação do usuário para prosseguir com SOLUTIONING.
