# GS Propostas - Plataforma Comercial

Plataforma SaaS integrada para gestÃ£o completa do ciclo de vendas, desde oportunidades atÃ© relatÃ³rios de BI.

## ðŸš€ Funcionalidades Implementadas

### âœ… MÃ³dulo 1: Dashboard de Oportunidades (Kanban)
- Pipeline visual com drag-and-drop usando dnd-kit
- 4 colunas: Aberto, Em Andamento, Ganha, Perdida
- Cards com informaÃ§Ãµes detalhadas (valor, cliente, probabilidade, prÃ³ximos passos)
- SumarizaÃ§Ã£o automÃ¡tica de valores por coluna
- AtualizaÃ§Ã£o em tempo real com React Query
- Toasts de feedback para aÃ§Ãµes do usuÃ¡rio

### âœ… MÃ³dulo 2: Centro de Propostas Unificado
- Nova rota `/gs-propostas/proposta/nova` (e `/proposta/[id]`) usando `PropostaUnificada`
- Abas implementadas atÃ© SPEC-009: Principal, Itens, Documentos (mock), Clientes inline, Empresas inline, Cad. Notas, HistÃ³rico
- Preview de documento com toggle e export PDF (placeholder)
- Sidebar simplificada com botÃ£o â€œNova Propostaâ€
- Modal antigo `new-opportunity-modal` mantido apenas como wrapper de compatibilidade (deprecated)

### âœ… Infraestrutura
- Schema completo do banco de dados (Drizzle ORM + PostgreSQL)
- Server Actions com validaÃ§Ã£o Zod
- Services layer para lÃ³gica de negÃ³cio
- React Query para gerenciamento de estado
- Providers configurados
- API routes para comunicaÃ§Ã£o cliente-servidor

## ðŸ“‹ PrÃ³ximos Passos

### MÃ³dulo 2: Propostas Comerciais
- [x] Editor full-screen com tabs (SPEC-001 a SPEC-009)
- [ ] IntegraÃ§Ã£o API oportunidades / persistÃªncia
- [ ] Abas pendentes: Financeiras (SPEC-010), Categorias (SPEC-011)
- [ ] GeraÃ§Ã£o de PDF final / IA Assistant
- [ ] Listagem de propostas com filtros

### MÃ³dulo 3: Acompanhamento
- [ ] Lista de atividades com filtros
- [ ] CalendÃ¡rio integrado (mensal/semanal/diÃ¡rio)
- [ ] Drag-and-drop no calendÃ¡rio
- [ ] Lembretes automÃ¡ticos
- [ ] Indicadores de SLA

### MÃ³dulo 4: RelatÃ³rios e BI
- [ ] Dashboard de Faturamento
- [ ] Dashboard de Itens (AnÃ¡lise ABC)
- [ ] Dashboard de Atividades
- [ ] ExportaÃ§Ã£o para CSV
- [ ] GrÃ¡ficos interativos com Recharts

### MÃ³dulo 5: Cadastros
- [x] Clientes inline na PropostaUnificada (seleÃ§Ã£o + CRUD)
- [x] Empresas inline na PropostaUnificada (seleÃ§Ã£o + CRUD)
- [ ] Categorias / Pagamentos / Assinaturas (inline) â€” em progresso
- [ ] GestÃ£o de UsuÃ¡rios e PermissÃµes
- [ ] ImportaÃ§Ã£o em massa (CSV)

## ðŸ› ï¸ Setup do Banco de Dados

1. Configure a variÃ¡vel de ambiente:
\`\`\`bash
DATABASE_URL=postgresql://user:password@localhost:5432/gsproducoes_intranet
\`\`\`

2. Gere as migrations:
\`\`\`bash
npm run db:generate
\`\`\`

3. Execute as migrations:
\`\`\`bash
npm run db:migrate
\`\`\`

Ou use push para desenvolvimento:
\`\`\`bash
npm run db:push
\`\`\`

## ðŸ“ Estrutura de Arquivos

\`\`\`
app/gs-propostas/
â”œâ”€â”€ actions/                    # Server Actions
â”‚   â””â”€â”€ opportunity-actions.ts
â”œâ”€â”€ dashboard/                  # Dashboard Kanban
â”‚   â””â”€â”€ page.tsx
â”œâ”€â”€ oportunidades/
â”‚   â””â”€â”€ nova/                   # Criar oportunidade
â”‚       â””â”€â”€ page.tsx
â”œâ”€â”€ types/                      # TypeScript types
â”‚   â””â”€â”€ index.ts
â”œâ”€â”€ layout.tsx                  # Layout com providers
â”œâ”€â”€ page.tsx                    # Redirect para dashboard
â”œâ”€â”€ providers.tsx               # React Query provider
â””â”€â”€ README.md

components/gs-propostas/
â”œâ”€â”€ create-opportunity-form.tsx # FormulÃ¡rio de criaÃ§Ã£o
â”œâ”€â”€ kanban-column.tsx           # Coluna do Kanban
â”œâ”€â”€ opportunity-card.tsx        # Card de oportunidade
â””â”€â”€ opportunity-kanban-board.tsx # Board principal

lib/
â”œâ”€â”€ db/
â”‚   â”œâ”€â”€ client.ts               # Cliente Drizzle
â”‚   â””â”€â”€ schema.ts               # Schema completo
â””â”€â”€ services/
    â””â”€â”€ opportunity-service.ts  # LÃ³gica de negÃ³cio

app/api/gs-propostas/
â””â”€â”€ opportunities/
    â””â”€â”€ route.ts                # API endpoint
\`\`\`
> ℹ️ As rotas de cadastro antigas em src/app/(workspace)/gs-propostas/cadastro/* estão **deprecated** e servem apenas como fallback temporário. Prefira as tabs inline da PropostaUnificada.


## ðŸŽ¨ Componentes UI Utilizados

- shadcn/ui: Button, Card, Input, Label, Textarea
- dnd-kit: Drag and drop
- React Query: Estado do servidor
- Sonner: Toasts
- Framer Motion: AnimaÃ§Ãµes (na home)
- Lucide React: Ãcones

## ðŸ”„ Fluxo de Dados

1. **Server Component** (page.tsx) carrega dados iniciais via service
2. **Client Component** (kanban-board.tsx) recebe initialData
3. **React Query** gerencia cache e refetch
4. **Drag & Drop** atualiza UI otimisticamente
5. **Server Action** persiste mudanÃ§as no banco
6. **Toast** confirma sucesso/erro
7. **Revalidation** atualiza cache do Next.js

## ðŸš¦ Como Testar

1. Acesse: http://localhost:3000/gs-propostas/dashboard
2. Clique em "Nova Oportunidade"
3. Preencha o formulÃ¡rio e crie
4. Arraste os cards entre as colunas
5. Observe os toasts de feedback

## ðŸ’¡ Melhorias Futuras

- Filtros avanÃ§ados no dashboard
- Busca de oportunidades
- Detalhes da oportunidade (modal ou pÃ¡gina)
- EdiÃ§Ã£o inline de valores
- HistÃ³rico de atividades por oportunidade
- NotificaÃ§Ãµes em tempo real
- IntegraÃ§Ã£o com email
- Assistente de IA para sugestÃµes
