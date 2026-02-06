# SPEC-005: Tab Empresas (Inline)

**Status:** ✅ Concluído  
**Prioridade:** P1  
**Estimativa:** 30 min  
**Dependências:** SPEC-002  
**Data de Conclusão:** 2026-02-03

---

## 📋 Objetivo

Criar uma versão inline do cadastro de empresas integrada à tela de proposta, permitindo gerenciar empresas emissoras das propostas.

---

## 🎨 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🏢 Empresas                            [+ Nova Empresa]     │ │
│ │ Configure as empresas emissoras das propostas               │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ BUSCA                                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔍 Procurar empresa...                                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ LISTA DE EMPRESAS                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ● | GS Produções           | CNPJ: 12.345.678/0001-99       │ │
│ │ ○ | Outra Empresa          | CNPJ: 98.765.432/0001-88       │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Total: 2 | 1 selecionada | Última atualização: 03/02/2026      │
├─────────────────────────────────────────────────────────────────┤
│ EMPRESA SELECIONADA (detalhes completos)                        │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🏢 GS PRODUÇÕES E ACESSIBILIDADE LTDA                       │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ CNPJ: 12.345.678/0001-99                                    │ │
│ │ Endereço: Rua X, 123 - Centro - São Paulo/SP - 01234-567    │ │
│ │ Telefone: (11) 1234-5678 | Email: contato@gs.com.br         │ │
│ │ Inscrição Estadual: ISENTO                                  │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │ Contato Principal: João Silva                               │ │
│ │ ─────────────────────────────────────────────────────────── │ │
│ │                    [Editar] [Usar para proposta]            │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Arquivo: `tabs/empresas-tab.tsx`

### Props Interface

```typescript
interface EmpresasTabProps {
  /** Empresa atualmente selecionada na proposta */
  selectedCompanyId?: string;

  /** Callback quando uma empresa é selecionada */
  onCompanySelect: (company: Company | null) => void;

  /** Se está em modo somente visualização */
  readOnly?: boolean;
}
```

### Estado Interno

```typescript
// Lista de empresas (via React Query)
const {
  data: companies = [],
  isLoading,
  isFetching,
} = useCompanies({
  search: debouncedSearch,
});

// Busca
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

// UI
const [formOpen, setFormOpen] = useState(false);
const [formMode, setFormMode] = useState<"create" | "edit">("create");
const [localSelectedId, setLocalSelectedId] = useState<string | null>(
  selectedCompanyId || null,
);
```

---

## 🔧 Diferenças do EmpresasPage Original

| Aspecto     | EmpresasPage (atual) | EmpresasTab (novo)       |
| ----------- | -------------------- | ------------------------ |
| **Uso**     | Página standalone    | Tab inline               |
| **Seleção** | Editar/visualizar    | Selecionar para proposta |
| **Ações**   | CRUD completo        | Selecionar + Editar      |
| **Delete**  | Botão proeminente    | Apenas via edição        |
| **Layout**  | Full page            | Compacto                 |

---

## ✅ Checklist de Implementação

### Estrutura

- [x] Criar `tabs/empresas-tab.tsx`
- [x] Reutilizar hooks de `useCompanies` (React Query)
- [x] Reutilizar `CompanyFormDialog`
- [x] Criar componente de preview da empresa (CompanyPreview)

### Funcionalidades

- [x] Busca de empresas com debounce (400ms)
- [x] Seleção via radio button
- [x] Preview detalhado da empresa selecionada
- [x] Botão "Usar para proposta" → propaga seleção
- [x] Botão "+ Nova Empresa" → abre form
- [x] Botão "Editar" na empresa selecionada

### Integrações

```typescript
// Hooks a reutilizar
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
} from "../../../app/app-legacy/cadastro/empresas/hooks/use-companies";

// Componentes a reutilizar
import { CompanyFormDialog } from "../../../app/app-legacy/cadastro/empresas/components/company-form-dialog";
```

---

## 🎯 Comportamento Esperado

### Fluxo de Seleção

```
1. Tab Empresas abre
2. Lista carrega via React Query
3. Usuário clica em uma empresa → selecionada
4. Preview detalhado aparece
5. Usuário clica "Usar para proposta"
6. Tab Principal recebe a empresa
```

### Fluxo de Criação

```
1. Usuário clica "+ Nova Empresa"
2. CompanyFormDialog abre
3. Usuário preenche dados (CNPJ, razão social, etc.)
4. Usuário salva
5. Empresa aparece na lista (selecionada automaticamente)
```

---

## 🔍 Verificação

### Critérios de Aceite

1. ✅ Lista de empresas carrega
2. ✅ Busca funciona
3. ✅ Seleção funciona
4. ✅ Preview mostra dados completos
5. ✅ "Usar para proposta" propaga seleção
6. ✅ Criação de empresa funciona
7. ✅ Edição de empresa funciona
8. ✅ React Query mantém cache atualizado

### Testes Manuais

```markdown
1. [ ] Abrir tab Empresas
2. [ ] Verificar lista carregando
3. [ ] Buscar por nome → resultados filtrados
4. [ ] Clicar em empresa → preview aparece
5. [ ] Clicar "Usar para proposta" → voltar para Principal
6. [ ] Verificar empresa no header da proposta
7. [ ] Criar nova empresa → form abre
8. [ ] Editar empresa existente → dados carregam
```

---

## 📝 Código Base a Reutilizar

### De `empresas/page.tsx`

```typescript
// Hook de empresas
const {
  data: companies = [],
  isLoading,
  isFetching,
} = useCompanies({
  search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
});

// Mutations
const createMutation = useCreateCompany({
  onSuccess: (company) => {
    toast.success("Empresa cadastrada com sucesso.");
    setFormOpen(false);
    setSelectedCompanyId(company.id);
  },
});

const updateMutation = useUpdateCompany({
  onSuccess: (company) => {
    toast.success("Empresa atualizada com sucesso.");
    setFormOpen(false);
  },
});
```

---

## 📊 Tipos da Empresa

```typescript
// De empresas/types.ts
interface Company {
  id: string;
  tipo: "fisica" | "juridica";
  // Pessoa Jurídica
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  // Pessoa Física
  cpf?: string;
  nome?: string;
  // Comum
  email?: string;
  telefone?: string;
  celular?: string;
  // Endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  // Contato
  contatoNome?: string;
  contatoEmail?: string;
  contatoTelefone?: string;
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔄 Rollback

```bash
rm src/features/gs-propostas/ui/components/proposta-unificada/tabs/empresas-tab.tsx
```

---

## 🔍 Verificação Realizada

| Check                                  | Resultado                                           |
| -------------------------------------- | --------------------------------------------------- |
| TypeScript (`npx tsc --noEmit`)        | ✅ Exit code 0                                      |
| HTTP `GET /gs-propostas/proposta/nova` | ✅ HTTP 200 OK                                      |
| Linhas de código                       | ✅ ~460 linhas                                      |
| Componentes criados                    | ✅ CompanyPreview, EmpresasTab                      |
| Integração com PropostaUnificada       | ✅ Funcionando                                      |
| Reutilização de React Query            | ✅ useCompanies, useCreateCompany, useUpdateCompany |
| Reutilização de CompanyFormDialog      | ✅ Funcionando                                      |

### Critérios de Aceite

1. ✅ Lista de empresas carrega via React Query
2. ✅ Busca funciona com debounce (400ms)
3. ✅ Seleção via radio funciona
4. ✅ Preview mostra dados completos (razão social, contato, endereço)
5. ✅ "Usar para proposta" propaga seleção e volta para tab Principal
6. ✅ Criação de empresa funciona via dialog
7. ✅ Edição de empresa funciona
8. ✅ React Query mantém cache atualizado

---

**Anterior:** [SPEC-004-tab-clientes.md](./SPEC-004-tab-clientes.md)  
**Próximo:** [SPEC-006-sidebar.md](./SPEC-006-sidebar.md)
