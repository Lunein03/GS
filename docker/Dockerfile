# ============================================
# Dockerfile Multi-Stage para Next.js 15
# Otimizado para produção com cache layers
# ============================================

# ============================================
# Stage 1: Base - Imagem base com dependências do sistema
# ============================================
FROM node:18-alpine AS base

# Instalar dependências do sistema necessárias
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    postgresql-client

WORKDIR /app

# ============================================
# Stage 2: Dependencies - Instalar dependências
# ============================================
FROM base AS deps

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./

# Instalar dependências de produção e desenvolvimento
RUN npm ci

# ============================================
# Stage 3: Builder - Build da aplicação
# ============================================
FROM base AS builder

WORKDIR /app

# Copiar dependências do stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fonte
COPY . .

# Variáveis de ambiente necessárias para o build
# Estas serão sobrescritas em runtime
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build da aplicação Next.js
RUN npm run build

# ============================================
# Stage 4: Runner - Imagem final de produção
# ============================================
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copiar arquivos públicos
COPY --from=builder /app/public ./public

# Copiar arquivos de build do Next.js
# Usar chown para definir permissões corretas
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar schema do banco para migrations
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# Mudar para usuário não-root
USER nextjs

# Expor porta da aplicação
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Healthcheck para monitoramento
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de inicialização
CMD ["node", "server.js"]
