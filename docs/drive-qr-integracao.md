# Guia de Integração do QR Code Drive Scanner

Este documento descreve, passo a passo, como migrar e integrar o projeto **`drive-qr-scanner`** ao monolito Next.js da intranet, replicando o padrão adotado pelo módulo `app/patrimonio`. Use este material como referência quando retomarmos a implementação.

## 1. Objetivo e Escopo

- Consolidar o scanner de QR codes dentro da intranet, eliminando a aplicação Vite independente.
- Remover a dependência do serviço Python e manter apenas uma solução Node/Next para extração de títulos e proxy de áudio.
- Padronizar componentes, roteamento, ações de servidor, estado e design system conforme práticas do segmento `patrimonio`.

## 2. Visão Geral das Arquiteturas Atuais

### Patrimônio (`app/patrimonio`)
- **App Router** com páginas server-side (`page.tsx`), layouts segmentados e metadata configurada.
- **Providers dedicados** (`providers.tsx`) para injetar contextos e UI globais (Tooltip, Toaster, EquipmentProvider).
- **Camada de domínio** bem definida: `actions/`, `lib/` (mappers, services, repositories, validators), `types/`.
- **Design system** centralizado em `@/components/ui` (shadcn), Tailwind com tokens específicos, acessibilidade reforçada.
- **Integração com Drizzle** e `next-safe-action`, retornando sempre `ActionResponse`.

### Drive QR Scanner (`drive-qr-scanner`)
- SPA em Vite + React Router + React Query, com providers declarados em `App.tsx`.
- Serviços auxiliares externos (`python-service/`, `node-service/`, função Supabase) para extrair metadados de links do Drive.
- UI própria (`src/components/ui`) duplicando componentes shadcn.
- Configurações específicas em `.env` com credenciais Supabase e URLs de serviços.

## 3. Estratégia de Migração

1. **Criar um novo segmento no App Router** (`app/drive-qr`) com a mesma estrutura de `patrimonio`:
   - `layout.tsx` → importa `DriveQrLayout`.
   - `providers.tsx` → injeta `TooltipProvider`, `Toaster` e, se necessário, um contexto de resultados (`DriveQrProvider`).
   - `page.tsx` → server component que renderiza `DriveQrContent` (client).
   - `not-found.tsx` → mensagem padrão de rota inexistente.

2. **Reorganizar código existente** dentro do segmento:
   - `components/` → mover `QRCodeUploader`, `QRCodeResults`, layout/header.
   - `actions/` → criar server actions e/ou route handlers (`extract-title`, `extract-titles`, `drive-audio`).
   - `lib/` → dividir por responsabilidades (`drive/extractor.ts`, `drive/audio.ts`, `qr/process.ts`).
   - `types/` → centralizar contratos (`QRCodeResult`, `DriveInfo`, `AudioInfo`).

3. **Unificar o backend em Node/Next**:
   - Utilizar a lógica robusta do atual `node-service/server.js` dentro de route handlers (ex.: `app/api/drive/extract-title/route.ts`).
   - Implementar streaming de áudio em `app/api/drive/audio/[fileId]/route.ts`, preservando suporte a Range e cabeçalhos.
   - Validar entradas com Zod e retornar `ActionResponse`, seguindo o padrão `actions/equipment.ts`.
   - Remover `python-service` e o uso direto da função Supabase (decidir manutenção como fallback apenas se necessário).

4. **Adequar o frontend**:
   - Substituir React Router por roteamento de arquivos. Eliminar `App.tsx` e `main.tsx`.
   - Remover React Query (o estado atual é local). Caso seja preciso, usar `useActionState` ou hooks customizados.
   - Reaproveitar componentes de UI da intranet (`@/components/ui`). Evitar duplicação de shadcn.
   - Manter componentes cliente apenas quando utilizarem APIs de navegador (`FileReader`, `URL.createObjectURL`, `<audio>`).
   - Externalizar textos fixos em constantes, conforme regras vigentes.

5. **Configuração e ambiente**:
   - Migrar variáveis para `env.mjs`/`.env.local`, utilizando prefixos `NEXT_PUBLIC_` apenas quando necessário no cliente.
   - Garantir que credenciais Supabase ou chaves Google não fiquem hardcoded; usar cofre/variáveis de ambiente seguras.
   - Atualizar `package.json` da raiz (se novas dependências forem adicionadas, como `cheerio` via ESM).

6. **Documentação e limpeza**:
   - Converter `SOLUCAO_PYTHON.md` em histórico ou removê-lo após desativar o serviço.
   - Criar README específico do módulo `drive-qr` (estrutura, comandos, infraestrutura backend).
   - Remover diretórios `drive-qr-scanner/` antigos quando todo o código estiver portado.

## 4. Estrutura de Pastas e Arquivos

### 4.1 Estrutura alvo sugerida

Organize o módulo dentro de `app/drive-qr` seguindo a hierarquia abaixo (adapte nomes conforme necessário, mas mantenha a separação de responsabilidades):

```
app/
   drive-qr/
      layout.tsx
      page.tsx
      providers.tsx
      not-found.tsx
      components/
         drive-qr-layout.tsx
         drive-qr-header.tsx
         qr-code-uploader.tsx
         qr-code-results.tsx
         ...
      actions/
         extract-title.ts
         extract-titles.ts
      lib/
         drive-extractor.ts
         audio-proxy.ts
         qr-processor.ts
         schema.ts
      types/
         index.ts
         qr-code.ts
      hooks/
         use-drive-qr-context.ts
      context/
         drive-qr-provider.tsx
      api/
         drive/
            extract-title/route.ts
            extract-titles/route.ts
            audio/[fileId]/route.ts
```

- Coloque assets estáticos (imagens, ícones) em `public/drive-qr/` caso sejam exclusivos desse módulo.
- Centralize constantes compartilhadas em `lib/` (por exemplo, listas de extensões de áudio, mensagens padrão).
- Sempre que criar subcomponentes com escopo restrito, avalie um microdiretório (`components/uploader/`, `components/results/`).

### 4.2 Convenções e organização

- Respeite o padrão do monorepo: código compartilhado em `packages/`, código específico dentro do segmento.
- Interfaces e tipos ficam em `types/`; evite declarar `type`/`interface` inline em componentes grandes.
- Exporte uma barrel file (`types/index.ts`) para facilitar importações.
- Para formulários ou lógica reutilizável, prefira hooks em `hooks/` (ex.: `useUploadQueue`).
- Ações de servidor devem ficar em `actions/` e expor funções validadas via `next-safe-action`.
- Rotas REST/streaming vão em `api/`; mantenha apenas lógica de transporte nelas, reusando helpers de `lib/`.

## 5. Boas Práticas de Implementação

- **Componentização:** utilize componentes funcionais com `function` (não `const`). Separe responsabilidades e extraia UI repetida.
- **Server Components primeiro:** mantenha a camada de layout e páginas como server components; marque com `'use client'` somente o necessário.
- **Validação consistente:** todas as entradas em server actions/rotas devem passar por schemas Zod; retorne `ActionResponse` padronizado.
- **Tratamento de erros:** use `appErrors` e mensagens amigáveis. Logue erros inesperados com contexto (URL processada, método).
- **Acessibilidade:** suporte teclado em drag-and-drop, forneça `aria-label`/`role` adequado e mensagens para leitores de tela.
- **Performance:** reutilize `AbortController`/`AbortSignal.timeout` para evitar pendências e libere `URL.createObjectURL` ao limpar resultados.
- **Estilo:** siga Tailwind com tokens existentes, mantenha tema consistente, evite estilos inline.
- **Testabilidade:** planeje testes unitários para parsing (`drive-extractor`) e tests end-to-end para rotas `/api/drive/*`.

## 6. Roteiro Detalhado

### 6.1 Preparação
- [ ] Criar branch dedicada à migração.
- [ ] Copiar lista de variáveis relevantes do `.env` atual e planejar os novos nomes (`DRIVE_SCRAPER_BASE_URL`, etc.).
- [ ] Verificar dependências utilizadas no `node-service` (`axios`, `cheerio`) e instalar no monorepo, caso ausentes.

### 6.2 Infraestrutura Next
- [ ] Criar pasta `app/drive-qr/` com arquivos `layout.tsx`, `providers.tsx`, `page.tsx`, `not-found.tsx`.
- [ ] Implementar `DriveQrLayout` inspirado em `PatrimonioLayout` (sidebar opcional, header, responsividade).
- [ ] Adicionar providers específicos em `providers.tsx` (Toaster, Tooltip, contexto de resultados se necessário).

### 6.3 Backend Node integrado
- [ ] Migrar função de extração (`extractTitle`) para módulo TypeScript em `app/drive-qr/lib/drive-extractor.ts`:
  - Extrair ID do arquivo com mesmas regexes do Node/Python.
  - Testar URLs `/view`, `/open`, Docs/Sheets/Slides.
  - Hierarquia de parsing: `<title>`, `og:title`, `meta name="title"`, JSON em scripts.
  - Limpar título (`cleanTitle`) evitando sufixos Google.
  - Detectar arquivos de áudio e montar URLs de download/proxy.
- [ ] Criar route handler `app/api/drive/extract-title/route.ts` com `POST`:
  - Schema Zod `{ url: string }`.
  - Chamar helper, capturar erros e retornar `ActionResponse`.
- [ ] Criar handler `app/api/drive/extract-titles/route.ts` com `POST` de array (`urls: string[]`).
- [ ] Criar handler `app/api/drive/audio/[fileId]/route.ts` com streaming e suporte a `Range`.
- [ ] Mapear logs e tratar erros inesperados com padrões `appErrors`.

### 6.4 Frontend e UX
- [ ] Migrar `QRCodeUploader`, `QRCodeResults` e demais componentes para `app/drive-qr/components/`.
- [ ] Ajustar imports para usar `@/components/ui/button`, `card`, `badge`, etc.
- [ ] Criar `DriveQrContent` (client) centralizando lógica de processamento, mantendo `processFiles` com `FileReader`.
- [ ] Substituir chamadas `fetch` diretas por invocações às novas rotas (`/api/drive/...`) com tratamento de erros consistente.
- [ ] Garantir limpeza de `URL.createObjectURL` e estados (`useEffect` no unmount).

### 6.5 Configurações
- [ ] Atualizar `tsconfig.json` (se novos paths forem criados) e garantir que o alias `@` cubra `app/drive-qr`.
- [ ] Revisar `tailwind.config.ts` para assegurar que os novos caminhos (`app/drive-qr/**/*`) estejam incluídos.
- [ ] Remover scripts Vite do `package.json` raiz quando o app legado deixar de existir.

### 6.6 Qualidade e Validação
- [ ] Rodar `pnpm lint` e `pnpm test` (ou comandos equivalentes) após migração.
- [ ] Validar funcionalidade manualmente: upload de múltiplos QR codes, detecção de erros, preview de áudio.
- [ ] Monitorar tempos de resposta; ajustar timeouts caso a soma das tentativas exceda experiência aceitável (>10s).

## 7. Checklist de Governança

| Item | Status esperado | Observações |
|------|-----------------|-------------|
| Dependências Python removidas | ✅ | Nenhum script/biblioteca Python deve permanecer em produção. |
| Componentes shadcn duplicados | ❌ | Todos os componentes devem referenciar `@/components/ui`. |
| Conformidade `ActionResponse` | ✅ | Todas as ações/rotas retornam `{ success, data?, error? }`. |
| Variáveis sensíveis | ✅ | Armazenadas em ambiente seguro, sem valores hardcoded em repo. |
| Acessibilidade | ✅ | Arrastar/soltar com teclado e leitores de tela. |
| Documentação | ✅ | Guia (este documento) e README atualizados. |

## 8. Referências Úteis

- `app/patrimonio/actions/*`: exemplos de server actions com `next-safe-action` e Drizzle.
- `app/patrimonio/components/*`: padrão de componentes client-side com Tailwind e shadcn.
- `app/patrimonio/providers.tsx`: organização de providers e integração com Toaster/Tooltip.
- `drive-qr-scanner/node-service/server.js`: base para lógica de scraping e proxy de áudio.

## 9. Próximos Passos Futuramente

1. Validar junto ao time se o fallback via Supabase continua necessário; caso sim, portar a função edge para Next com autenticação adequada.
2. Definir estratégia de cache para títulos já consultados (Redis, KV ou Drizzle) para reduzir chamadas repetidas.
3. Considerar testes automatizados (unitários para parsing e integração para rotas `/api/drive/*`).
4. Planejar desativação gradual do diretório `drive-qr-scanner/` após entrega da versão integrada.

---

> **Importante:** mantenha este arquivo atualizado conforme decisões de arquitetura evoluírem. Antes de iniciar o desenvolvimento, revise variáveis de ambiente, dependências externas e o cronograma da equipe.
