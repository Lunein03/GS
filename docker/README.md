# Docker - Ambiente de Desenvolvimento

Este diretório contém as configurações Docker para o ambiente de desenvolvimento da GS Produções Intranet.

## 🚀 Quick Start

### Iniciar o ambiente completo (Frontend + Backend + Database)

```bash
make dev-up
```

Ou usando docker compose diretamente:

```bash
docker compose -f docker/docker-compose.dev.yml up -d
```

### Acessar os serviços

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:9000
- **API Docs (Swagger)**: http://localhost:9000/docs
- **Database**: localhost:5433

## 📋 Comandos Disponíveis

### Gerenciamento de Containers

```bash
make dev-up          # Inicia todos os containers
make dev-down        # Para todos os containers
make dev-restart     # Reinicia todos os containers
make status          # Mostra status dos containers
```

### Logs

```bash
make dev-logs              # Logs de todos os containers
make dev-logs-frontend     # Logs apenas do frontend
make dev-logs-api          # Logs apenas do backend
make dev-logs-db           # Logs apenas do banco
```

### Acesso aos Containers

```bash
make shell-frontend    # Acessa shell do container frontend
make shell-api         # Acessa shell do container backend
make shell-db          # Acessa PostgreSQL
```

### Banco de Dados

```bash
make db-migrate    # Executa migrations
make db-seed       # Popula com dados de exemplo
make db-reset      # Reseta o banco (CUIDADO!)
```

### Utilitários

```bash
make install       # Instala dependências do frontend
make lint          # Executa linter
make verify        # Verifica se todos os serviços estão OK
```

## 🔧 Estrutura dos Containers

### Frontend (Next.js)
- **Container**: `gsproducoes-frontend-dev`
- **Porta**: 3000
- **Hot Reload**: ✅ Ativado
- **Volume**: Código fonte montado em `/app`

### Backend (FastAPI)
- **Container**: `gsproducoes-api-dev`
- **Porta**: 9000
- **Hot Reload**: ✅ Ativado (uvicorn --reload)
- **Volume**: Código fonte montado em `/app`

### Database (PostgreSQL)
- **Container**: `gsproducoes-db-dev`
- **Porta**: 5433 (host) → 5432 (container)
- **Usuário**: gsproducoes
- **Senha**: dev123
- **Database**: gsproducoes_intranet_dev

## 🔄 Hot Reload

Ambos os containers (frontend e backend) estão configurados com hot-reload:

- **Frontend**: Next.js detecta mudanças automaticamente via `npm run dev`
- **Backend**: Uvicorn detecta mudanças via flag `--reload`

Você pode editar os arquivos localmente e as mudanças serão refletidas automaticamente nos containers sem necessidade de rebuild.

## 🐛 Troubleshooting

### Container não inicia

```bash
# Verificar logs
make dev-logs

# Reconstruir imagens
make dev-build
make dev-up
```

### Porta já em uso

Se as portas 3000 ou 9000 já estiverem em uso, você pode:

1. Parar o processo que está usando a porta
2. Ou modificar as portas no `docker-compose.dev.yml`

### Problemas com node_modules

```bash
# Reinstalar dependências dentro do container
make shell-frontend
npm install
```

### Banco de dados corrompido

```bash
# Resetar o banco (apaga todos os dados)
make db-reset
```

## 📦 Volumes

- `postgres_data_dev`: Dados persistentes do PostgreSQL
- `/app/node_modules`: Node modules do frontend (não sincronizado com host)
- `/app/.next`: Build cache do Next.js (não sincronizado com host)

## 🔐 Variáveis de Ambiente

As variáveis de ambiente são configuradas em:

- **Frontend**: Definidas no `docker-compose.dev.yml`
- **Backend**: Arquivo `backend/.env.backend`
- **Database**: Definidas no `docker-compose.dev.yml`

## 🌐 Network

Todos os containers estão na mesma rede Docker (`gsproducoes-dev-network`), permitindo comunicação entre eles:

- Frontend pode acessar backend via `http://api:9000`
- Backend pode acessar database via `postgresql://gsproducoes:dev123@db:5432/gsproducoes_intranet_dev`

## 📝 Notas

- O frontend usa `WATCHPACK_POLLING=true` para garantir que o hot-reload funcione em todos os sistemas operacionais
- Os volumes são montados para permitir edição em tempo real
- O container do frontend depende do backend, que depende do banco de dados
