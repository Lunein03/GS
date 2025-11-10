# Comandos Úteis (Git Bash)
- docker ps --format '{{.Names}}'  # verificar se gsproducoes-api-dev e gsproducoes-db-dev estão ativos
- docker compose -f docker/docker-compose.dev.yml up -d  # subir serviços quando necessário
- make up  # inicializa stack docker e sincroniza .env
- make logs | make down | make db-reset  # monitorar logs, desligar serviços ou resetar banco
- npm run docker:dev:up / npm run docker:dev:down  # controle alternativo dos containers
- npm run dev  # inicia Next.js com scripts/dev.js (detecção automática de portas)
- npm run lint  # validação ESLint antes de finalizar tarefas
- npm run build  # checagem final de produção