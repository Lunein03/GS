# Estilo e Convenções
- Código em TypeScript com componentes React funcionais (declarados com `function`), preferindo Server Components; usar Zod para validações.
- Tailwind CSS é padrão para estilos; priorizar tokens derivados de CSS vars (`bg-background`, `text-foreground`, etc.) e componentes shadcn/ui localizados em `src/shared/ui`.
- Evitar `'use client'` exceto quando necessário; envolver clientes em `Suspense` e seguir padrões de acessibilidade (aria, focus states).
- Server Actions usam `next-safe-action` retornando `ActionResponse`; tratar erros esperados como valores e inesperados com error boundaries.
- Estrutura modular orientada a domínio: lógica em `domain`, hooks em `hooks`, UI em `ui`, evitando lógica pesada em componentes.