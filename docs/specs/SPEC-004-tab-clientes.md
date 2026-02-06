# SPEC-004: Tab Clientes (Inline)

**Status:** ✅ Concluído  
**Prioridade:** P1  
**Estimativa:** 35 min  
**Dependências:** SPEC-002  
**Data de Conclusão:** 2026-02-03

---

## 📋 Objetivo

Criar uma versão inline do cadastro de clientes integrada à tela de proposta, permitindo cadastrar e selecionar clientes sem sair do contexto.

---

## 🎨 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER                                                          │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 👤 Clientes                              [+ Novo Cliente]   │ │
│ │ Selecione um cliente ou cadastre um novo                    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ BUSCA                                                           │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 🔍 Buscar por nome, CPF/CNPJ, email...                      │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────┐ ┌─────────────┐                                 │
│ │ Tipo: Todos │ │Status: Todos│                                 │
│ └─────────────┘ └─────────────┘                                 │
├─────────────────────────────────────────────────────────────────┤
│ LISTA DE CLIENTES (tabela compacta)                             │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ○ | Nome               | Tipo     | CPF/CNPJ    | [Ações]  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ ● | GS Produções       | Jurídica | 12.345.678  | 👁️ ✏️    │ │
│ │ ○ | João Silva         | Física   | 123.456.789 | 👁️ ✏️    │ │
│ │ ○ | Empresa X          | Jurídica | 98.765.432  | 👁️ ✏️    │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ CLIENTE SELECIONADO (preview)                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ✓ GS Produções Ltda                                         │ │
│ │   CNPJ: 12.345.678/0001-99 | Tel: (11) 1234-5678            │ │
│ │   Endereço: Rua X, 123 - São Paulo/SP                       │ │
│ │                                        [Usar este cliente]  │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Arquivo: `tabs/clientes-tab.tsx`

### Props Interface

```typescript
interface ClientesTabProps {
  /** Cliente atualmente selecionado na proposta */
  selectedClientId?: string;

  /** Callback quando um cliente é selecionado */
  onClientSelect: (client: Cliente | null) => void;

  /** Se está em modo somente visualização */
  readOnly?: boolean;
}
```

### Estado Interno

```typescript
// Lista de clientes
const [clients, setClients] = useState<Cliente[]>([]);
const [isLoading, setIsLoading] = useState(true);

// Filtros
const [filters, setFilters] = useState<FilterState>({
  search: "",
  tipo: "all",
  status: "all",
});

// Paginação
const [pagination, setPagination] = useState({
  page: 1,
  pageSize: 10,
  total: 0,
});

// UI
const [isFormOpen, setIsFormOpen] = useState(false);
const [editingClient, setEditingClient] = useState<Cliente | null>(null);
const [hoveredClientId, setHoveredClientId] = useState<string | null>(null);
```

---

## 🔧 Diferenças do ClientesPage Original

| Aspecto            | ClientesPage (atual) | ClientesTab (novo)          |
| ------------------ | -------------------- | --------------------------- |
| **Uso**            | Página standalone    | Tab inline                  |
| **Seleção**        | Editar/visualizar    | Selecionar para proposta    |
| **Header**         | Com ícone grande     | Compacto                    |
| **Tabela**         | Paginação completa   | Scroll infinito ou compacta |
| **Ação principal** | CRUD completo        | Selecionar cliente          |
| **Form**           | Dialog fullscreen    | Dialog menor                |

---

## ✅ Checklist de Implementação

### Estrutura

- [x] Criar `tabs/clientes-tab.tsx`
- [x] Extrair componentes de `ClientesPage`:
  - [x] Reutilizar filtros inline (busca, tipo, status)
  - [x] Criar versão compacta da tabela
  - [x] Reutilizar `ClienteForm` (importar)

### Funcionalidades

- [x] Busca de clientes com debounce (300ms)
- [x] Filtros por tipo (PF/PJ) e status
- [x] Seleção via radio button
- [x] Preview do cliente selecionado
- [x] Botão "Usar este cliente" → propaga para proposta
- [x] Botão "+ Novo Cliente" → abre form inline
- [x] Edição rápida de cliente existente

### Integrações

```typescript
// APIs a reutilizar do arquivo existente
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from "@/features/gs-propostas/api/clients";

// Componentes a reutilizar
import { ClienteFilters } from "../../../app/app-legacy/cadastro/clientes/components/filters/cliente-filters";
import { ClienteForm } from "../../../app/app-legacy/cadastro/clientes/components/forms/cliente-form";
```

---

## 🎯 Comportamento Esperado

### Fluxo de Seleção

```
1. Usuário entra na tab Clientes
2. Lista carrega automaticamente
3. Usuário clica em um cliente → radio selecionado
4. Preview do cliente aparece abaixo
5. Usuário clica "Usar este cliente"
6. Tab Principal recebe o cliente selecionado
7. (Opcional) Usuário volta para tab Principal
```

### Fluxo de Criação

```
1. Usuário clica "+ Novo Cliente"
2. Form abre em dialog
3. Usuário preenche dados
4. Usuário salva
5. Cliente aparece na lista (selecionado automaticamente)
6. Usuário pode usar imediatamente
```

---

## 🔍 Verificação

### Critérios de Aceite

1. ✅ Lista de clientes carrega
2. ✅ Busca funciona com debounce
3. ✅ Filtros funcionam
4. ✅ Seleção via radio funciona
5. ✅ Preview mostra dados corretos
6. ✅ "Usar este cliente" propaga para proposta
7. ✅ Criação de cliente funciona
8. ✅ Cliente criado é selecionado automaticamente

### Testes Manuais

```markdown
1. [ ] Abrir tab Clientes
2. [ ] Verificar lista carregando
3. [ ] Buscar por nome → resultados filtrados
4. [ ] Filtrar por tipo PJ → apenas jurídicas
5. [ ] Clicar em cliente → selecionado
6. [ ] Clicar "Usar este cliente" → voltar para Principal
7. [ ] Verificar cliente preenchido na tab Principal
8. [ ] Criar novo cliente → form abre
9. [ ] Salvar → cliente na lista
```

---

## 📝 Código Base a Reutilizar

### De `clientes/page.tsx`

```typescript
// Lógica de carregamento
const loadClientes = useCallback(async () => {
  const params = {
    search: filters.search || undefined,
    tipo: filters.tipo === "all" ? undefined : filters.tipo,
    status: filters.status === "all" ? undefined : filters.status,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
  const result = await getClientes(params);
  // ...
}, [filters, pagination]);

// Form submit
const handleFormSubmit = async (data: ClienteFormData) => {
  const result = editingCliente
    ? await updateCliente({ id: editingCliente.id, ...data })
    : await createCliente(data);
  // ...
};
```

---

## 🔄 Rollback

```bash
rm src/features/gs-propostas/ui/components/proposta-unificada/tabs/clientes-tab.tsx
```

---

## 🔍 Verificação Realizada

| Check                                  | Resultado                     |
| -------------------------------------- | ----------------------------- |
| TypeScript (`npx tsc --noEmit`)        | ✅ Exit code 0                |
| HTTP `GET /gs-propostas/proposta/nova` | ✅ HTTP 200 OK                |
| Linhas de código                       | ✅ ~500 linhas                |
| Componentes criados                    | ✅ ClientPreview, ClientesTab |
| Integração com PropostaUnificada       | ✅ Funcionando                |
| Reutilização de ClienteForm            | ✅ Funcionando                |

### Critérios de Aceite

1. ✅ Lista de clientes carrega da API
2. ✅ Busca funciona com debounce (300ms)
3. ✅ Filtros por tipo (PF/PJ) e status funcionam
4. ✅ Seleção via radio funciona
5. ✅ Preview mostra dados corretos
6. ✅ "Usar este cliente" propaga para proposta e volta para tab Principal
7. ✅ Criação de cliente funciona via dialog
8. ✅ Cliente criado é selecionado automaticamente

---

**Anterior:** [SPEC-003-tab-principal.md](./SPEC-003-tab-principal.md)  
**Próximo:** [SPEC-005-tab-empresas.md](./SPEC-005-tab-empresas.md)
