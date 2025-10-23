# GS Propostas - Plataforma Comercial

Plataforma SaaS integrada para gestão completa do ciclo de vendas, desde oportunidades até relatórios de BI.

## 🚀 Funcionalidades Implementadas

### ✅ Módulo 1: Dashboard de Oportunidades (Kanban)
- Pipeline visual com drag-and-drop usando dnd-kit
- 4 colunas: Aberto, Em Andamento, Ganha, Perdida
- Cards com informações detalhadas (valor, cliente, probabilidade, próximos passos)
- Sumarização automática de valores por coluna
- Atualização em tempo real com React Query
- Toasts de feedback para ações do usuário

### ✅ Infraestrutura
- Schema completo do banco de dados (Drizzle ORM + PostgreSQL)
- Server Actions com validação Zod
- Services layer para lógica de negócio
- React Query para gerenciamento de estado
- Providers configurados
- API routes para comunicação cliente-servidor

## 📋 Próximos Passos

### Módulo 2: Propostas Comerciais
- [ ] Listagem de propostas com filtros
- [ ] Editor com preview de PDF em tempo real
- [ ] Abas: Principal, Itens, Atividades, Documentos, Notas, Histórico, Layout
- [ ] Geração de PDF
- [ ] Controle de status (Draft → Open → Sent → Won/Lost)

### Módulo 3: Acompanhamento
- [ ] Lista de atividades com filtros
- [ ] Calendário integrado (mensal/semanal/diário)
- [ ] Drag-and-drop no calendário
- [ ] Lembretes automáticos
- [ ] Indicadores de SLA

### Módulo 4: Relatórios e BI
- [ ] Dashboard de Faturamento
- [ ] Dashboard de Itens (Análise ABC)
- [ ] Dashboard de Atividades
- [ ] Exportação para CSV
- [ ] Gráficos interativos com Recharts

### Módulo 5: Cadastros
- [ ] CRUD de Clientes
- [ ] CRUD de Itens (Produtos/Serviços)
- [ ] CRUD de Categorias
- [ ] Gestão de Usuários e Permissões
- [ ] Importação em massa (CSV)

## 🛠️ Setup do Banco de Dados

1. Configure a variável de ambiente:
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

## 📁 Estrutura de Arquivos

\`\`\`
app/gs-propostas/
├── actions/                    # Server Actions
│   └── opportunity-actions.ts
├── dashboard/                  # Dashboard Kanban
│   └── page.tsx
├── oportunidades/
│   └── nova/                   # Criar oportunidade
│       └── page.tsx
├── types/                      # TypeScript types
│   └── index.ts
├── layout.tsx                  # Layout com providers
├── page.tsx                    # Redirect para dashboard
├── providers.tsx               # React Query provider
└── README.md

components/gs-propostas/
├── create-opportunity-form.tsx # Formulário de criação
├── kanban-column.tsx           # Coluna do Kanban
├── opportunity-card.tsx        # Card de oportunidade
└── opportunity-kanban-board.tsx # Board principal

lib/
├── db/
│   ├── client.ts               # Cliente Drizzle
│   └── schema.ts               # Schema completo
└── services/
    └── opportunity-service.ts  # Lógica de negócio

app/api/gs-propostas/
└── opportunities/
    └── route.ts                # API endpoint
\`\`\`

## 🎨 Componentes UI Utilizados

- shadcn/ui: Button, Card, Input, Label, Textarea
- dnd-kit: Drag and drop
- React Query: Estado do servidor
- Sonner: Toasts
- Framer Motion: Animações (na home)
- Lucide React: Ícones

## 🔄 Fluxo de Dados

1. **Server Component** (page.tsx) carrega dados iniciais via service
2. **Client Component** (kanban-board.tsx) recebe initialData
3. **React Query** gerencia cache e refetch
4. **Drag & Drop** atualiza UI otimisticamente
5. **Server Action** persiste mudanças no banco
6. **Toast** confirma sucesso/erro
7. **Revalidation** atualiza cache do Next.js

## 🚦 Como Testar

1. Acesse: http://localhost:3000/gs-propostas/dashboard
2. Clique em "Nova Oportunidade"
3. Preencha o formulário e crie
4. Arraste os cards entre as colunas
5. Observe os toasts de feedback

## 💡 Melhorias Futuras

- Filtros avançados no dashboard
- Busca de oportunidades
- Detalhes da oportunidade (modal ou página)
- Edição inline de valores
- Histórico de atividades por oportunidade
- Notificações em tempo real
- Integração com email
- Assistente de IA para sugestões
