# ============================================
# Makefile - GS Produções Intranet
# Comandos para gerenciar ambiente Docker
# ============================================

.PHONY: help dev-up dev-down dev-restart dev-logs dev-build dev-clean status shell-api shell-frontend shell-db

# Cores para output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Mostra esta mensagem de ajuda
	@echo "$(BLUE)GS Produções Intranet - Comandos Docker$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# ============================================
# Comandos de Desenvolvimento
# ============================================

dev-up: ## Inicia todos os containers de desenvolvimento (frontend + backend + db)
	@echo "$(BLUE)🚀 Iniciando ambiente de desenvolvimento...$(NC)"
	docker compose -f docker/docker-compose.dev.yml up -d
	@echo "$(GREEN)✅ Ambiente iniciado com sucesso!$(NC)"
	@echo ""
	@echo "$(YELLOW)📍 Serviços disponíveis:$(NC)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:9000"
	@echo "  API Docs: http://localhost:9000/docs"
	@echo "  Database: localhost:5433"
	@echo ""
	@echo "$(YELLOW)📝 Use 'make dev-logs' para ver os logs$(NC)"

dev-down: ## Para todos os containers de desenvolvimento
	@echo "$(BLUE)🛑 Parando ambiente de desenvolvimento...$(NC)"
	docker compose -f docker/docker-compose.dev.yml down
	@echo "$(GREEN)✅ Ambiente parado com sucesso!$(NC)"

dev-restart: ## Reinicia todos os containers de desenvolvimento
	@echo "$(BLUE)🔄 Reiniciando ambiente de desenvolvimento...$(NC)"
	docker compose -f docker/docker-compose.dev.yml restart
	@echo "$(GREEN)✅ Ambiente reiniciado com sucesso!$(NC)"

dev-logs: ## Mostra logs de todos os containers
	docker compose -f docker/docker-compose.dev.yml logs -f

dev-logs-frontend: ## Mostra logs apenas do frontend
	docker compose -f docker/docker-compose.dev.yml logs -f frontend

dev-logs-api: ## Mostra logs apenas do backend
	docker compose -f docker/docker-compose.dev.yml logs -f api

dev-logs-db: ## Mostra logs apenas do banco de dados
	docker compose -f docker/docker-compose.dev.yml logs -f db

dev-build: ## Reconstrói as imagens Docker
	@echo "$(BLUE)🔨 Reconstruindo imagens Docker...$(NC)"
	docker compose -f docker/docker-compose.dev.yml build --no-cache
	@echo "$(GREEN)✅ Imagens reconstruídas com sucesso!$(NC)"

dev-clean: ## Remove containers, volumes e imagens (CUIDADO: apaga dados do banco)
	@echo "$(RED)⚠️  ATENÇÃO: Isso irá remover todos os dados do banco!$(NC)"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose -f docker/docker-compose.dev.yml down -v; \
		docker rmi gsproducoes-frontend-dev gsproducoes-api-dev 2>/dev/null || true; \
		echo "$(GREEN)✅ Ambiente limpo com sucesso!$(NC)"; \
	fi

# ============================================
# Status e Monitoramento
# ============================================

status: ## Mostra status dos containers
	@echo "$(BLUE)📊 Status dos containers:$(NC)"
	@docker compose -f docker/docker-compose.dev.yml ps

ps: status ## Alias para 'status'

# ============================================
# Acesso aos Containers
# ============================================

shell-frontend: ## Acessa shell do container frontend
	@echo "$(BLUE)🐚 Acessando shell do frontend...$(NC)"
	docker exec -it gsproducoes-frontend-dev sh

shell-api: ## Acessa shell do container backend
	@echo "$(BLUE)🐚 Acessando shell do backend...$(NC)"
	docker exec -it gsproducoes-api-dev sh

shell-db: ## Acessa shell do PostgreSQL
	@echo "$(BLUE)🐚 Acessando PostgreSQL...$(NC)"
	docker exec -it gsproducoes-db-dev psql -U gsproducoes -d gsproducoes_intranet_dev

# ============================================
# Banco de Dados
# ============================================

db-migrate: ## Executa migrations do banco de dados
	@echo "$(BLUE)🗄️  Executando migrations...$(NC)"
	docker exec -it gsproducoes-api-dev alembic upgrade head
	@echo "$(GREEN)✅ Migrations executadas com sucesso!$(NC)"

db-reset: ## Reseta o banco de dados (CUIDADO: apaga todos os dados)
	@echo "$(RED)⚠️  ATENÇÃO: Isso irá apagar todos os dados do banco!$(NC)"
	@read -p "Tem certeza? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose -f docker/docker-compose.dev.yml down db; \
		docker volume rm gsproducoes-postgres-data-dev 2>/dev/null || true; \
		docker compose -f docker/docker-compose.dev.yml up -d db; \
		sleep 5; \
		docker exec -it gsproducoes-api-dev alembic upgrade head; \
		echo "$(GREEN)✅ Banco resetado com sucesso!$(NC)"; \
	fi

db-seed: ## Popula o banco com dados de exemplo
	@echo "$(BLUE)🌱 Populando banco com dados de exemplo...$(NC)"
	docker exec -it gsproducoes-api-dev python scripts/seed_sample_data.py
	@echo "$(GREEN)✅ Dados inseridos com sucesso!$(NC)"

# ============================================
# Utilitários
# ============================================

install: ## Instala dependências do frontend no container
	@echo "$(BLUE)📦 Instalando dependências do frontend...$(NC)"
	docker exec -it gsproducoes-frontend-dev npm install
	@echo "$(GREEN)✅ Dependências instaladas com sucesso!$(NC)"

lint: ## Executa linter no frontend
	@echo "$(BLUE)🔍 Executando linter...$(NC)"
	docker exec -it gsproducoes-frontend-dev npm run lint

test-api: ## Executa testes do backend
	@echo "$(BLUE)🧪 Executando testes do backend...$(NC)"
	docker exec -it gsproducoes-api-dev pytest

verify: ## Verifica se todos os serviços estão funcionando
	@echo "$(BLUE)🔍 Verificando serviços...$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend (http://localhost:3000):$(NC)"
	@curl -s -o /dev/null -w "  Status: %{http_code}\n" http://localhost:3000 || echo "  $(RED)❌ Não disponível$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend Health (http://localhost:9000/health):$(NC)"
	@curl -s http://localhost:9000/health | grep -q "ok" && echo "  $(GREEN)✅ OK$(NC)" || echo "  $(RED)❌ Falhou$(NC)"
	@echo ""
	@echo "$(YELLOW)Database:$(NC)"
	@docker exec gsproducoes-db-dev pg_isready -U gsproducoes -d gsproducoes_intranet_dev > /dev/null 2>&1 && echo "  $(GREEN)✅ OK$(NC)" || echo "  $(RED)❌ Falhou$(NC)"
