# ============================================
# Makefile - GS Produções Intranet (Root)
# Proxy para comandos Docker
# ============================================

.PHONY: help

help: ## Mostrar comandos disponíveis
	@echo "🚀 GS Produções Intranet"
	@echo ""
	@echo "Use 'make -f docker/Makefile [comando]' ou os atalhos abaixo:"
	@echo ""
	@echo "  make docker-help    - Ver todos os comandos Docker"
	@echo "  make up             - Iniciar ambiente de produção"
	@echo "  make dev-up         - Iniciar ambiente de desenvolvimento"
	@echo "  make down           - Parar ambiente"
	@echo "  make logs           - Ver logs"
	@echo "  make migrate        - Aplicar migrations"
	@echo ""
	@echo "Ou use os scripts:"
	@echo "  ./scripts/docker-start.sh"
	@echo "  ./scripts/docker-stop.sh"
	@echo ""

docker-help:
	@make -f docker/Makefile help

up:
	@make -f docker/Makefile up

dev-up:
	@make -f docker/Makefile dev-up

down:
	@make -f docker/Makefile down

logs:
	@make -f docker/Makefile logs

migrate:
	@make -f docker/Makefile migrate

shell:
	@make -f docker/Makefile shell

clean:
	@make -f docker/Makefile clean

verify:
	@bash scripts/verify-setup.sh

db-reset:
	@bash scripts/db-reset.sh
