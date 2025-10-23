# ============================================
# Makefile - GS Produções Intranet
# Comandos simplificados para Docker
# ============================================

.PHONY: help build up down restart logs shell db-shell migrate seed clean

# Variáveis
COMPOSE_FILE_PROD = docker/docker-compose.yml
COMPOSE_FILE_DEV = docker/docker-compose.dev.yml
APP_CONTAINER = gsproducoes-app
DB_CONTAINER = gsproducoes-db

# Comando padrão
.DEFAULT_GOAL := help

# ==========================================
# Help
# ==========================================
help: ## Mostrar esta mensagem de ajuda
	@echo "🚀 GS Produções Intranet - Docker Commands"
	@echo ""
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ==========================================
# Produção
# ==========================================
build: ## Build das imagens de produção
	@echo "🔨 Construindo imagens..."
	docker-compose -f $(COMPOSE_FILE_PROD) build

up: ## Iniciar ambiente de produção
	@echo "🚀 Iniciando ambiente de produção..."
	docker-compose -f $(COMPOSE_FILE_PROD) up -d
	@echo "✅ Ambiente iniciado!"
	@echo "📍 Aplicação: http://localhost:3000"
	@echo "📍 Adminer: http://localhost:8080"

down: ## Parar ambiente de produção
	@echo "🛑 Parando ambiente..."
	docker-compose -f $(COMPOSE_FILE_PROD) down

restart: ## Reiniciar ambiente de produção
	@echo "🔄 Reiniciando ambiente..."
	docker-compose -f $(COMPOSE_FILE_PROD) restart

# ==========================================
# Desenvolvimento
# ==========================================
dev-build: ## Build das imagens de desenvolvimento
	@echo "🔨 Construindo imagens de desenvolvimento..."
	docker-compose -f $(COMPOSE_FILE_DEV) build

dev-up: ## Iniciar ambiente de desenvolvimento
	@echo "🚀 Iniciando ambiente de desenvolvimento..."
	docker-compose -f $(COMPOSE_FILE_DEV) up -d
	@echo "✅ Ambiente iniciado!"
	@echo "📍 Aplicação: http://localhost:3000"
	@echo "📍 Adminer: http://localhost:8080"

dev-down: ## Parar ambiente de desenvolvimento
	@echo "🛑 Parando ambiente de desenvolvimento..."
	docker-compose -f $(COMPOSE_FILE_DEV) down

dev-restart: ## Reiniciar ambiente de desenvolvimento
	@echo "🔄 Reiniciando ambiente de desenvolvimento..."
	docker-compose -f $(COMPOSE_FILE_DEV) restart

# ==========================================
# Logs
# ==========================================
logs: ## Ver logs de todos os serviços
	docker-compose -f $(COMPOSE_FILE_PROD) logs -f

logs-app: ## Ver logs da aplicação
	docker-compose -f $(COMPOSE_FILE_PROD) logs -f app

logs-db: ## Ver logs do banco de dados
	docker-compose -f $(COMPOSE_FILE_PROD) logs -f db

# ==========================================
# Shell
# ==========================================
shell: ## Acessar shell do container da aplicação
	docker exec -it $(APP_CONTAINER) sh

db-shell: ## Acessar shell do PostgreSQL
	docker exec -it $(DB_CONTAINER) psql -U gsproducoes -d gsproducoes_intranet

# ==========================================
# Banco de Dados
# ==========================================
migrate: ## Aplicar schema do banco (db:push)
	@echo "📤 Aplicando schema do banco..."
	docker exec $(APP_CONTAINER) npm run db:push
	@echo "✅ Schema aplicado!"

migrate-generate: ## Gerar migrations
	@echo "📝 Gerando migrations..."
	docker exec $(APP_CONTAINER) npm run db:generate
	@echo "✅ Migrations geradas!"

migrate-run: ## Executar migrations
	@echo "▶️  Executando migrations..."
	docker exec $(APP_CONTAINER) npm run db:migrate
	@echo "✅ Migrations executadas!"

seed: ## Popular banco com dados de exemplo
	@echo "🌱 Populando banco com dados de exemplo..."
	docker exec -i $(DB_CONTAINER) psql -U gsproducoes -d gsproducoes_intranet < docs/database/complete-seed.sql
	@echo "✅ Dados inseridos!"

db-reset: ## Resetar banco (APAGA TODOS OS DADOS!)
	@echo "⚠️  ATENÇÃO: Isso irá remover TODOS os dados!"
	@read -p "Tem certeza? Digite 'sim' para confirmar: " confirm; \
	if [ "$$confirm" = "sim" ]; then \
		echo "🛑 Parando containers..."; \
		docker-compose -f $(COMPOSE_FILE_PROD) down -v; \
		echo "🚀 Recriando ambiente..."; \
		docker-compose -f $(COMPOSE_FILE_PROD) up -d; \
		echo "⏳ Aguardando banco ficar pronto..."; \
		sleep 10; \
		echo "✅ Banco resetado com sucesso!"; \
	else \
		echo "❌ Operação cancelada."; \
	fi

backup: ## Fazer backup do banco de dados
	@echo "💾 Criando backup..."
	docker exec $(DB_CONTAINER) pg_dump -U gsproducoes gsproducoes_intranet > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup criado!"

# ==========================================
# Status e Informações
# ==========================================
ps: ## Ver status dos containers
	docker-compose -f $(COMPOSE_FILE_PROD) ps

stats: ## Ver estatísticas de uso dos containers
	docker stats

health: ## Verificar health dos containers
	@echo "🏥 Verificando saúde dos containers..."
	@docker inspect $(APP_CONTAINER) | grep -A 5 '"Health"' || echo "Container não encontrado"

# ==========================================
# Limpeza
# ==========================================
clean: ## Parar e remover containers (mantém volumes)
	@echo "🧹 Limpando containers..."
	docker-compose -f $(COMPOSE_FILE_PROD) down
	@echo "✅ Containers removidos!"

clean-all: ## Parar e remover containers + volumes (APAGA DADOS!)
	@echo "⚠️  ATENÇÃO: Isso irá remover TODOS os dados!"
	@read -p "Tem certeza? Digite 'sim' para confirmar: " confirm; \
	if [ "$$confirm" = "sim" ]; then \
		docker-compose -f $(COMPOSE_FILE_PROD) down -v; \
		echo "✅ Containers e volumes removidos!"; \
	else \
		echo "❌ Operação cancelada."; \
	fi

prune: ## Limpar recursos Docker não utilizados
	@echo "🧹 Limpando recursos não utilizados..."
	docker system prune -f
	@echo "✅ Limpeza concluída!"

# ==========================================
# Rebuild
# ==========================================
rebuild: ## Rebuild completo (sem cache)
	@echo "🔨 Rebuild completo..."
	docker-compose -f $(COMPOSE_FILE_PROD) build --no-cache
	@echo "✅ Rebuild concluído!"

rebuild-up: ## Rebuild e iniciar
	@echo "🔨 Rebuild e inicialização..."
	docker-compose -f $(COMPOSE_FILE_PROD) up --build -d
	@echo "✅ Ambiente reconstruído e iniciado!"

# ==========================================
# Testes
# ==========================================
test-connection: ## Testar conexão com o banco
	@echo "🔌 Testando conexão com banco..."
	docker exec $(DB_CONTAINER) pg_isready -U gsproducoes
	@echo "✅ Conexão OK!"

test-health: ## Testar endpoint de health
	@echo "🏥 Testando health endpoint..."
	@curl -s http://localhost:3000/api/health | jq . || echo "Endpoint não disponível"
