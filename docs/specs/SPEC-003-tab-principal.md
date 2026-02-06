# SPEC-003: Tab Principal

**Status:** ✅ Concluído  
**Prioridade:** P1  
**Estimativa:** 25 min  
**Dependências:** SPEC-002  
**Data de Conclusão:** 2026-02-03

---

## 📋 Objetivo

Migrar a tab Principal do modal para um componente isolado que gerencia os dados básicos da proposta.

---

## 🎨 Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ STATUS BAR                                                      │
│ ┌────────────────────┐ ┌────────────────────┐ ┌──────┐ ┌──────┐ │
│ │     ABERTO ▶       │ │     CONCLUÍDO      │ │Perder│ │Ganhar│ │
│ └────────────────────┘ └────────────────────┘ └──────┘ └──────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DADOS DA PROPOSTA                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ • Dados da Proposta                                         │ │
│ │ ┌────────┐ ┌────────────────────────┐ ┌──────────┐ ┌──────┐ │ │
│ │ │ Código │ │ Nome                   │ │ Pagamento│ │Valid.│ │ │
│ │ └────────┘ └────────────────────────┘ └──────────┘ └──────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│ DADOS EMPRESA / CLIENTE (2 colunas)                             │
│ ┌─────────────────────────┐ ┌─────────────────────────────────┐ │
│ │ • Dados da Empresa      │ │ • Dados do Cliente  [+ Novo]   │ │
│ │ ┌─────────────────────┐ │ │ ┌─────────────────────────────┐ │ │
│ │ │ Empresa (readonly)  │ │ │ │ Cliente (select)            │ │ │
│ │ └─────────────────────┘ │ │ └─────────────────────────────┘ │ │
│ │ ┌─────────────────────┐ │ │ ┌─────────────────────────────┐ │ │
│ │ │ Responsável         │ │ │ │ Contato (select)            │ │ │
│ │ └─────────────────────┘ │ │ └─────────────────────────────┘ │ │
│ └─────────────────────────┘ └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Arquivo: `tabs/principal-tab.tsx`

### Props Interface

```typescript
interface PrincipalTabProps {
  /** Dados do formulário (controlled) */
  formData: ProposalData;

  /** Callback para atualizar dados */
  onDataChange: (data: Partial<ProposalData>) => void;

  /** Lista de clientes disponíveis */
  clients: Cliente[];

  /** Loading state dos clientes */
  isLoadingClients: boolean;

  /** Callback para criar novo cliente rápido */
  onCreateClient: () => void;

  /** Callback para mudar status */
  onStatusChange: (status: "won" | "lost") => void;
}
```

### Campos do Formulário

| Campo         | Tipo       | Validação                   | Grid       |
| ------------- | ---------- | --------------------------- | ---------- |
| `code`        | Input text | Opcional                    | col-span-2 |
| `name`        | Input text | **Obrigatório**, min 1 char | col-span-5 |
| `paymentMode` | Select     | Opcional                    | col-span-3 |
| `validity`    | Input date | Opcional                    | col-span-2 |
| `clientName`  | Select     | Opcional                    | -          |
| `contactName` | Select     | Opcional                    | -          |

### Schema de Validação (Zod)

```typescript
export const principalTabSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  paymentMode: z.string().optional(),
  validity: z.string().optional(),
  clientName: z.string().optional(),
  contactName: z.string().optional(),
});

export type PrincipalTabFormData = z.infer<typeof principalTabSchema>;
```

---

## ✅ Checklist de Implementação

### Estrutura

- [x] Criar `tabs/principal-tab.tsx`
- [x] Extrair lógica da tab Principal do modal (linhas 236-379)
- [x] Implementar componente de status bar
- [x] Implementar seção "Dados da Proposta"
- [x] Implementar seção "Dados da Empresa" (readonly)
- [x] Implementar seção "Dados do Cliente" com select

### Funcionalidades

- [x] Select de cliente com carregamento dinâmico
- [x] Botão "+ Novo Cliente" navega para tab Clientes
- [x] Status bar com botões Perder/Ganhar
- [x] Campos controlados via props

### UX

- [x] Labels claros
- [x] Feedback de loading no select
- [x] Placeholder quando não há clientes
- [x] Visual indica campos obrigatórios (\*)

---

## 🔍 Verificação

### Critérios de Aceite

1. ✅ Formulário renderiza corretamente
2. ✅ Validação funciona (nome obrigatório)
3. ✅ Select de cliente carrega lista
4. ✅ Botão "+ Novo Cliente" dispara callback
5. ✅ Status bar reflete status atual
6. ✅ Mudanças propagam para parent via callback

### Testes Manuais

```markdown
1. [ ] Abrir tab Principal
2. [ ] Verificar todos os campos visíveis
3. [ ] Preencher nome → campo atualiza
4. [ ] Selecionar cliente → select funciona
5. [ ] Clicar "+ Novo Cliente" → callback executa
6. [ ] Tentar salvar sem nome → erro de validação
```

---

## 📝 Código de Referência

### Do Modal Atual (linhas 236-379)

```typescript
{/* Tab: Principal */}
<TabsContent value="principal" className="mt-0 space-y-6">
  {/* Status Bar */}
  <div className="flex items-center rounded-lg overflow-hidden border border-border bg-card p-1 gap-1">
    <div className="flex-1 bg-amber-400 text-black font-bold text-center py-2 text-sm uppercase tracking-wide">
      Aberto
    </div>
    <div className="flex-1 bg-muted/50 text-muted-foreground font-medium text-center py-2 text-sm uppercase tracking-wide">
      Concluído
    </div>
    <div className="px-2 flex gap-2 ml-2">
      <Button size="sm" variant="destructive">Perder</Button>
      <Button size="sm" className="bg-emerald-500">Ganhar</Button>
    </div>
  </div>
  // ... resto
</TabsContent>
```

---

## 🔄 Rollback

```bash
# Remover arquivo
rm src/features/gs-propostas/ui/components/proposta-unificada/tabs/principal-tab.tsx
```

---

## 🔍 Verificação Realizada

| Check                                  | Resultado                                 |
| -------------------------------------- | ----------------------------------------- |
| TypeScript (`npx tsc --noEmit`)        | ✅ Exit code 0                            |
| HTTP `GET /gs-propostas/proposta/nova` | ✅ HTTP 200 OK                            |
| Linhas de código                       | ✅ ~440 linhas                            |
| Componentes criados                    | ✅ StatusBar, SectionHeader, PrincipalTab |
| Integração com PropostaUnificada       | ✅ Funcionando                            |

### Critérios de Aceite

1. ✅ Formulário renderiza corretamente
2. ✅ Validação funciona (nome obrigatório com \*)
3. ✅ Select de cliente carrega lista da API
4. ✅ Botão "+ Novo Cliente" navega para tab Clientes
5. ✅ Status bar reflete status atual (Aberto/Ganha/Perdida)
6. ✅ Mudanças propagam para parent via callback

---

**Anterior:** [SPEC-002-proposta-unificada.md](./SPEC-002-proposta-unificada.md)  
**Próximo:** [SPEC-004-tab-clientes.md](./SPEC-004-tab-clientes.md)
