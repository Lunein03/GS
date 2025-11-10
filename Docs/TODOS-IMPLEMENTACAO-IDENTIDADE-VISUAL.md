# TO-DOs para Implementação da Identidade Visual Apple-Like

> **Baseado na análise detalhada da aplicação atual em 10/11/2025**
> 
> Este documento contém TO-DOs específicos para migrar a intranet GS Produções para a nova identidade visual Apple-Like conforme especificações em `SPEC-IDENTIDADE-VISUAL.md`.

## Estado Atual Identificado

**Problemas principais encontrados:**
- ✗ Ainda usa fonte Poppins em vez de Inter
- ✗ Design tokens existem mas não coincidem exatamente com as specs
- ✗ Componentes precisam refinamento para estética Apple-like
- ✗ Múltiplas referências hardcoded a font-poppins
- ✗ Layouts precisam ajustes de espaçamento e hierarquia

---

## FASE 0: PREPARAÇÃO E ANÁLISE

```typescript
// TODO (HIGH): [Preparação] Documentar estado atual antes das mudanças
// Fazer backup/screenshots das páginas principais: /, /drive-qr, /patrimonio, /gs-propostas
// Testar funcionalidades críticas em light/dark mode para baseline
// Criar branch feature/apple-identity para desenvolvimento isolado
// Localização: todo o projeto

// TODO (HIGH): [Análise] Mapear todos os usos de Poppins no código
// ARQUIVOS IDENTIFICADOS que usam Poppins:
// - src/app/(core)/layout/root-layout.tsx (linha 5: import Poppins)
// - tailwind.config.ts (linhas 15-16: fontFamily poppins)
// - src/app/(core)/styles/globals.css (linha 123: font-poppins)
// - src/shared/components/hero-section.tsx (múltiplas linhas com font-poppins)
// - src/shared/components/politicas/PoliticaUsoRecursosFinanceiros.tsx (linha 20)
// Fazer busca completa por "Poppins|poppins|font-poppins" em todo o projeto
```

---

## FASE 1: FUNDAÇÃO DO DESIGN SYSTEM

### Tipografia e Fontes

```typescript
// TODO (HIGH): [Fonts] Substituir Poppins por Inter no root layout
// ARQUIVO: src/app/(core)/layout/root-layout.tsx
// AÇÃO: Substituir import { Poppins } from 'next/font/google' por import { Inter } from 'next/font/google'
// Alterar configuração de peso: weight: ['100', '200', '300', '400', '500', '600']
// Alterar variable: '--font-inter' em vez de '--font-poppins'
// Testar que Inter carrega corretamente em desenvolvimento

// TODO (HIGH): [Tailwind Fonts] Atualizar configuração de fontes no Tailwind
// ARQUIVO: tailwind.config.ts (linhas 15-16)
// AÇÃO: Substituir fontFamily.sans e fontFamily.poppins por fontFamily.inter
// Alterar 'var(--font-poppins)' para 'var(--font-inter)'
// Garantir que sans continua como padrão para não quebrar componentes existentes

// TODO (HIGH): [CSS Global] Atualizar referências de fonte no globals.css
// ARQUIVO: src/app/(core)/styles/globals.css
// AÇÃO: Substituir todas as referências .font-poppins por .font-inter (linha 123 e outras)
// Atualizar h1-h6 para usar Inter: remover @apply font-poppins, manter apenas font-medium
// Atualizar parágrafo p para usar Inter: remover font-poppins

// TODO (MEDIUM): [Componentes] Buscar e substituir font-poppins nos componentes
// ARQUIVOS IDENTIFICADOS:
// - src/shared/components/hero-section.tsx (linhas 144, 145, 147, 151)
// - src/shared/components/politicas/PoliticaUsoRecursosFinanceiros.tsx (linha 20)
// AÇÃO: Substituir className="font-poppins" por className="font-inter" ou remover (usar padrão)
// Fazer busca global por "font-poppins" e substituir sistematicamente
```

### Design Tokens e Variáveis CSS

```typescript
// TODO (HIGH): [Design Tokens] Ajustar cores CSS no globals.css para specs exatas
// ARQUIVO: src/app/(core)/styles/globals.css (linhas 6-44 light mode, 46-80 dark mode)
// 
// VERIFICAR E AJUSTAR se necessário:
// Light Mode - comparar com specs:
// --background: deve ser exatamente 300 11% 94% (equivale a #F0EEEF) ✓ está correto
// --foreground: deve ser exatamente 240 3% 11% (equivale a #1D1D1F) ✓ está correto  
// --card: deve ser 0 0% 100% (#FFFFFF) ✓ está correto
// --border: deve ser 0 0% 85% (#DADADA) ✓ está correto
// --primary: deve ser 264 89% 54% (#6422F2) ✓ está correto
// --secondary: deve ser 257 37% 23% (#2A2451) ✓ está correto
// 
// Dark Mode - verificar specs:
// --background: deve ser 240 3% 11% (#1D1D1F) ✓ está correto
// --foreground: deve ser 300 11% 94% (#F0EEEF) ✓ está correto
// --card: deve ser 257 37% 23% (#2A2451) ✓ está correto
// --border: deve ser rgba(255,255,255,0.06) - VERIFICAR se 0 0% 85% / 0.06 está correto
// 
// Se tokens estão corretos, marcar como ✓ CONCLUÍDO

// TODO (MEDIUM): [Shadows] Implementar shadows das specs no CSS
// ARQUIVO: src/app/(core)/styles/globals.css  
// ADICIONAR novas variáveis CSS:
// --shadow-light: 0px 1px 2px rgba(0,0,0,0.04)
// --shadow-dark: 0px 2px 4px rgba(0,0,0,0.16) 
// --shadow-hover: 0px 8px 24px rgba(100,34,242,0.16)
// Aplicar em .dark e :root conforme necessário

// TODO (MEDIUM): [Radius] Ajustar border radius para specs Apple-like
// ARQUIVO: tailwind.config.ts (linha 83-87) e globals.css
// VERIFICAR se --radius: 0.5rem (8px) está correto conforme specs
// ADICIONAR se necessário: --radius-sm: 6px, --radius-md: 8px no CSS
// Garantir que componentes usam valores das specs (botões 8px, cards 16px)
```

---

## FASE 2: COMPONENTES CORE

### Botões

```typescript
// TODO (HIGH): [Button Primary] Ajustar botão primário para specs exatas
// ARQUIVO: src/shared/ui/button.tsx (linhas 7-35)
// 
// VERIFICAR variante 'default' (linha 13-14):
// - Padding deve ser 16px 28px (atualmente h-9 px-4 py-2) - PRECISA AJUSTE
// - Fonte deve ser Inter 16px peso 500 - verificar se text-sm está correto
// - Radius deve ser 8px (rounded-lg ✓ está correto) 
// - Hover deve ser filter: brightness(1.05) em vez de bg-primary/90
// - Focus deve ter ring 2px var(--ring) offset 2px - verificar implementação atual

// TODO (HIGH): [Button Sizes] Ajustar tamanhos de botão para specs
// ARQUIVO: src/shared/ui/button.tsx (linhas 26-31)
// ALTERAR size 'lg' para: h-12 px-7 (equivale a 16px 28px padding das specs)
// MANTER size 'default' como intermediário: h-10 px-5
// Garantir que botões principais usam size='lg' para seguir specs

// TODO (MEDIUM): [Button Secondary] Implementar botão outline conforme specs
// ARQUIVO: src/shared/ui/button.tsx (linha 17-18)
// VERIFICAR variante 'outline':
// - Background deve ser transparente ✓
// - Borda deve ser 1px var(--border) ✓ 
// - Hover deve ser rgba(100,34,242,0.08) - VERIFICAR se hover:bg-accent é equivalente
// - Se não for equivalente, criar nova variante 'outline-apple'

// TODO (LOW): [Button Estados] Implementar estados disabled conforme specs
// ARQUIVO: src/shared/ui/button.tsx (linha 8)
// VERIFICAR se disabled:opacity-50 está correto (specs pedem opacity 0.5 ✓)
// GARANTIR que disabled não altera cor, apenas opacidade
```

### Cards

```typescript
// TODO (HIGH): [Card Base] Ajustar card base para specs Apple-like
// ARQUIVO: src/shared/ui/card.tsx (linhas 5-16)
// 
// VERIFICAR Card principal (linhas 9-12):
// - Radius deve ser 16px para seções (rounded-lg é 8px) - PRECISA AJUSTE para rounded-2xl
// - Padding deve ser 32px - CardHeader/CardContent usam p-6 (24px) - PRECISA AJUSTE
// - Shadow deve usar var(--shadow-light) light e var(--shadow-dark) dark
// - REMOVER shadow-[var(--shadow-card)] e hover:shadow-[var(--shadow-elevated)] atuais
// - ADICIONAR sombras das specs implementadas na Fase 1

// TODO (MEDIUM): [Card Title] Ajustar tipografia do título
// ARQUIVO: src/shared/ui/card.tsx (linha 25-27)
// ALTERAR CardTitle: Inter 20px peso 500 (atualmente text-2xl)
// text-2xl = 24px, mas specs pedem 20px - ALTERAR para text-xl
// MANTER font-medium ✓ (peso 500)

// TODO (MEDIUM): [Card Description] Ajustar subtítulo conforme specs  
// ARQUIVO: src/shared/ui/card.tsx (linha 32-34)
// ALTERAR CardDescription: Inter 16px peso 400 (atualmente text-sm = 14px)
// ALTERAR para text-base (16px) mantendo text-muted-foreground ✓
// Font weight padrão já é 400 ✓

// TODO (MEDIUM): [Card Padding] Implementar padding 32px das specs
// ARQUIVO: src/shared/ui/card.tsx (linhas 19, 39, 44)
// ALTERAR p-6 (24px) para p-8 (32px) em CardHeader, CardContent, CardFooter
// Testar se não quebra layouts existentes, ajustar responsivo se necessário
```

### Inputs e Forms

```typescript
// TODO (HIGH): [Input Base] Ajustar input base para specs
// ARQUIVO: src/shared/ui/input.tsx
// 
// IMPLEMENTAR conforme specs:
// - Altura: 48px (h-12)
// - Background: var(--card) 
// - Borda: 1px var(--border)
// - Radius: 8px (rounded-lg ✓)
// - Focus: outline none, box-shadow: 0 0 0 2px rgba(100,34,242,0.32)
// - Placeholder: var(--muted-foreground) com 70% opacidade

// TODO (HIGH): [Textarea] Implementar textarea seguindo mesmos padrões
// ARQUIVO: src/shared/ui/textarea.tsx
// APLICAR mesmos estilos do input, mas altura auto
// Manter consistência com input: mesma borda, focus, placeholder

// TODO (MEDIUM): [Form Error States] Implementar estados de erro
// ARQUIVOS: src/shared/ui/input.tsx, src/shared/ui/textarea.tsx
// ADICIONAR variante de erro:
// - Borda: #E5484D (vermelho)
// - Texto de ajuda: #E5484D
// - Manter focus ring mas em vermelho
// Criar componente FormError se não existir
```

### Outros Componentes

```typescript
// TODO (MEDIUM): [Switch] Implementar switch conforme specs Apple
// ARQUIVO: src/shared/ui/switch.tsx
// IMPLEMENTAR conforme specs:
// - Trilho: 52px x 30px
// - Fundo: var(--muted) (off), var(--primary) (on)  
// - Thumb: 24px, var(--card)
// - Sombra thumb: 0px 2px 6px rgba(0,0,0,0.12)
// - Transição: 300ms ease

// TODO (MEDIUM): [Dropdown] Ajustar dropdown/popover para specs
// ARQUIVO: src/shared/ui/dropdown-menu.tsx, src/shared/ui/popover.tsx
// IMPLEMENTAR:
// - Fundo: var(--card)
// - Borda: 1px var(--border) 
// - Radius: 12px (rounded-xl)
// - Shadow: 0px 12px 32px rgba(0,0,0,0.12)
// - Item ativo: background rgba(100,34,242,0.08)

// TODO (LOW): [Tabs] Redesenhar tabs seguindo specs
// ARQUIVO: src/shared/ui/tabs.tsx
// IMPLEMENTAR:
// - Container: border-bottom 1px var(--border)
// - Item: padding 16px, fonte 16px peso 500
// - Ativo: underline var(--primary) 2px
// - Inativo: texto rgba(var(--foreground), 0.5)

// TODO (LOW): [Toast] Implementar toasts conforme specs
// ARQUIVO: src/shared/ui/toast.tsx, src/shared/ui/sonner.tsx
// IMPLEMENTAR:
// - Fundo: var(--card), borda: 1px var(--border)  
// - Shadow: 0px 12px 34px rgba(0,0,0,0.12)
// - Duração: 4s
// - Sucesso: barra lateral #1ED760
// - Erro: barra lateral #E5484D
```

---

## FASE 3: LAYOUTS E PÁGINAS

### Layout Principal

```typescript
// TODO (MEDIUM): [Root Layout] Limpar referências antigas no layout
// ARQUIVO: src/app/(core)/layout/root-layout.tsx
// APÓS mudança de fonte Inter:
// - Atualizar className no body (linha 66): remover font-sans, manter apenas font-inter
// - Verificar se ParallaxBackground precisa ajustes para nova identidade
// - Testar se ConditionalNavbar e ConditionalFooter mantêm consistência

// TODO (MEDIUM): [Header/Navbar] Implementar cabeçalho conforme specs
// ARQUIVO: Localizar componente ConditionalNavbar
// IMPLEMENTAR conforme specs de cabeçalho:
// - Altura: 80px desktop, 72px tablet, 64px mobile
// - Background: rgba(240,238,239,0.8) light / rgba(29,29,31,0.8) dark  
// - Backdrop blur: 12px
// - Logo: 32px altura
// - Navegação: gap 32px, fonte 16px peso 400
// - CTA: botão primário padrão

// TODO (LOW): [Footer] Simplificar rodapé seguindo minimalismo Apple
// ARQUIVO: Localizar componente ConditionalFooter  
// IMPLEMENTAR conforme specs:
// - Background: var(--background)
// - Grid: 4 colunas desktop, 2 tablet, stack mobile
// - Links: Inter 14px peso 400, cor var(--muted-foreground)
// - Linha final: borda var(--border), padding 24px
```

### Páginas Principais

```typescript
// TODO (MEDIUM): [Home Page] Aplicar nova identidade na página inicial
// ARQUIVO: src/app/page.tsx e componentes relacionados
// IMPLEMENTAR Hero conforme specs:
// - Padding: 160px top / 120px bottom desktop
// - Grid: duas colunas gap 96px  
// - Headline: Inter 64px peso 500
// - Subheadline: Inter 22px peso 400, max-width 640px
// - Background opcional: gradiente radial rgba(100,34,242,0.12)

// TODO (MEDIUM): [Hero Section] Atualizar componente hero existente
// ARQUIVO: src/shared/components/hero-section.tsx
// APÓS substituição font-poppins por font-inter:
// - Verificar tamanhos de fonte seguem specs (Headline, Subheadline)
// - Ajustar espaçamento para padrão Apple (160px/120px desktop)
// - Implementar hierarquia visual conforme specs
// - Testar responsividade em tablet (72px) e mobile (48px)
```

### Features Específicas

```typescript
// TODO (MEDIUM): [Drive QR] Atualizar módulo Drive QR para nova identidade
// ARQUIVO: src/features/drive-qr/app/ (páginas e componentes)
// IMPLEMENTAR:
// - Cards uniformes com nova paleta e espaçamento
// - Título seção: Inter 40px peso 500
// - Descrição: Inter 18px peso 400
// - Grid 3 colunas gap 32px desktop, responsivo
// - Badge: background rgba(100,34,242,0.08), texto var(--primary)

// TODO (MEDIUM): [Patrimônio] Atualizar módulo Patrimônio
// ARQUIVO: src/features/patrimonio/app/ (páginas e componentes)
// APLICAR mesmos padrões do Drive QR:
// - Cards em grid responsivo
// - Espaçamento seção: 112px top/bottom desktop, 72px tablet, 48px mobile
// - Formulários: estados erro/sucesso com nova paleta
// - Layout clean, minimalismo Apple

// TODO (MEDIUM): [GS Propostas] Atualizar módulo GS Propostas
// ARQUIVO: src/features/gs-propostas/app/ (páginas e componentes)  
// APLICAR mesmos padrões dos outros módulos:
// - Consistência visual com Drive QR e Patrimônio
// - Formulários seguindo specs de Input/Textarea
// - Cards e badges usando nova paleta
// - Hierarquia tipográfica conforme specs

// TODO (LOW): [Políticas] Atualizar páginas de políticas
// ARQUIVO: src/shared/components/politicas/ (PoliticaUsoRecursosFinanceiros.tsx e outros)
// APÓS substituição font-poppins:
// - Remover classes font-poppins hardcoded (linha 20 identificada)
// - Aplicar hierarquia tipográfica das specs
// - Manter legibilidade e acessibilidade
// - Testar em light/dark mode
```

---

## FASE 4: EXPERIÊNCIA E INTERAÇÕES

### Animações e Transições

```typescript
// TODO (MEDIUM): [Theme Toggle] Revisar animação do alternador de tema
// ARQUIVO: src/shared/ui/theme-provider.tsx ou componente de theme toggle
// VERIFICAR se usa Framer Motion com duração 300ms conforme specs
// IMPLEMENTAR animação: opacity + rotateX 15deg para suavidade Apple-like
// Testar transição smooth entre light/dark mode

// TODO (MEDIUM): [Hover States] Implementar hover consistente
// ARQUIVOS: Todos os componentes interativos
// APLICAR transition: all 0.3s ease como padrão
// IMPLEMENTAR:
// - Links: color: var(--primary) no hover
// - Botões: filter brightness(1.05) 
// - Cards: shadow sutil usando shadow-hover token
// - Manter área de clique mínima: 44px x 44px

// TODO (LOW): [Focus States] Garantir focus rings acessíveis
// ARQUIVOS: Botões, inputs, links (todos os componentes interativos)
// VERIFICAR se focus-visible está implementado corretamente
// USAR var(--ring) para cor do focus ring
// MANTER contraste mínimo WCAG AA (4.5:1 texto normal, 3:1 headlines)

// TODO (LOW): [Loading States] Implementar skeletons com nova paleta
// ARQUIVO: src/shared/ui/skeleton.tsx
// IMPLEMENTAR conforme specs:
// - Dark: linear-gradient(90deg, #2A2451 0%, #6422F2 50%, #2A2451 100%)
// - Light: equivalente claro da mesma base
// - Animação shimmer suave
// - Progress indicators usando var(--primary)
```

### Micro Interações

```typescript
// TODO (LOW): [Button Interactions] Adicionar micro interações nos botões
// ARQUIVO: src/shared/ui/button.tsx
// IMPLEMENTAR:
// - Active state: transform scale(0.98) leve
// - Transição: 200ms ease para feedback táctil
// - Manter hover brightness(1.05) já especificado

// TODO (LOW): [Card Interactions] Implementar elevação sutil nos cards
// ARQUIVO: src/shared/ui/card.tsx  
// ADICIONAR hover sem exagero:
// - Shadow leve usando shadow-hover token
// - Transição suave 300ms
// - Evitar translate-y (muito material design, não Apple-like)

// TODO (LOW): [Input Interactions] Melhorar feedback dos inputs
// ARQUIVO: src/shared/ui/input.tsx
// IMPLEMENTAR transição suave para focus state: 200ms ease
// MANTER focus ring conforme specs já definido
// Placeholder animation sutil se necessário
```

---

## FASE 5: VALIDAÇÃO E DOCUMENTAÇÃO

### Testes e QA

```typescript
// TODO (LOW): [Contraste] Validar contraste WCAG AA em todas combinações
// FERRAMENTA: WebAIM Contrast Checker ou DevTools
// TESTAR combinações:
// - Texto normal: mínimo 4.5:1 
// - Headlines: mínimo 3:1
// - Estados disabled, muted, etc.
// DOCUMENTAR exceções se houver

// TODO (LOW): [Responsivo] Testar layouts em breakpoints principais  
// BREAKPOINTS: Desktop (1200px+), Tablet (768-1199px), Mobile (até 767px)
// PÁGINAS: /, /drive-qr, /patrimonio, /gs-propostas
// VERIFICAR:
// - Espaçamento seção responsivo (112px/72px/48px)
// - Grid responsivo (3 col/2 col/stack)
// - Tipografia escala corretamente
// - Cards mantêm proporção

// TODO (LOW): [Cross-browser] Testar compatibilidade navegadores
// BROWSERS: Chrome, Firefox, Safari, Edge
// FOCAR EM:
// - Backdrop-filter (header translúcido)
// - CSS custom properties (design tokens)
// - Inter font loading
// - Animações e transições

// TODO (LOW): [Performance] Verificar impacto na performance
// MÉTRICAS: LCP, CLS, FID antes/depois
// VERIFICAR:
// - Carregamento fonte Inter
// - Backdrop-filter performance (mobile)
// - Animações não causam jank
// OTIMIZAR se necessário
```

### Documentação Final

```typescript
// TODO (LOW): [Screenshots] Atualizar documentação com screenshots
// ARQUIVO: Docs/Identidade Visual.md (se existir)
// CAPTURAR:
// - Páginas principais light/dark mode
// - Componentes principais (botões, cards, forms)
// - Antes/depois da implementação
// ADICIONAR ao README se necessário

// TODO (LOW): [Changelog] Documentar mudanças implementadas
// ARQUIVO: CHANGELOG.md (criar se não existir)
// DOCUMENTAR:
// - Migração Poppins → Inter
// - Novos design tokens
// - Componentes atualizados  
// - Breaking changes se houver

// TODO (LOW): [Design System] Criar guia de uso dos novos tokens
// ARQUIVO: Docs/Design-System.md (criar)
// INCLUIR:
// - Paleta de cores com códigos
// - Tipografia com exemplos
// - Componentes com variações
// - Padrões de layout e espaçamento
// - Boas práticas para novos desenvolvimentos
```

---

## CHECKLIST DE VALIDAÇÃO FINAL

Antes de considerar a implementação concluída, verificar:

- [ ] **Fontes**: Nenhuma referência a Poppins permanece no código
- [ ] **Cores**: Todas as cores seguem a paleta oficial, sem hex hardcoded
- [ ] **Componentes**: Botões, cards, inputs seguem specs exatas  
- [ ] **Layouts**: Espaçamento e hierarquia seguem padrões Apple-like
- [ ] **Responsivo**: Funciona em desktop, tablet e mobile
- [ ] **Acessibilidade**: Contraste WCAG AA, focus visible, áreas de clique
- [ ] **Performance**: Não há regressão em métricas de performance
- [ ] **Funcionalidade**: Todas as features continuam funcionando
- [ ] **Cross-browser**: Testado em principais navegadores
- [ ] **Documentação**: Atualizada com novos padrões

---

## PRIORIZAÇÃO SUGERIDA

**Sprint 1 (Fundação)**: TO-DOs HIGH da Fase 0-1
**Sprint 2 (Componentes)**: TO-DOs HIGH da Fase 2  
**Sprint 3 (Layouts)**: TO-DOs MEDIUM das Fases 2-3
**Sprint 4 (Refinamento)**: TO-DOs LOW das Fases 4-5

**Estimativa Total**: 5-7 dias úteis conforme plano original

---

*Documento criado em 10/11/2025 baseado na análise do código atual*
*Para atualizações, revisar TO-DOs concluídos e ajustar prioridades*