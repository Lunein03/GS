# Visão Geral do Projeto
- Intranet corporativa da GS Produções com frontend em Next.js 15 (App Router) + Tailwind + shadcn/ui Radix, integrada a backend FastAPI com PostgreSQL.
- Estrutura organizada por grupos de rotas `src/app/(core|public|intranet|workspace)` e módulos de domínio em `src/features/*` com subpastas `app`, `domain`, `hooks`, `server`, `ui`.
- Backend vive em `backend/app` seguindo padrão FastAPI + SQLAlchemy + Alembic; execução preferencial via Docker Compose (`docker/docker-compose.dev.yml`).
- Arquivos compartilhados em `src/shared` provêm componentes, estilos, providers e utils reutilizáveis.
- Layout raiz `src/app/(core)/layout/root-layout.tsx` aplica ThemeProvider (dark default), QueryProvider e Parallax background global.