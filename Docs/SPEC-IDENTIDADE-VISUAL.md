# Especificações de Implementação — Identidade Visual Apple-Like

## 1. Design Tokens Oficiais

### 1.1 Light Mode
| Token | Cor | Uso |
|-------|-----|-----|
| `--background` | #F0EEEF | Fundo principal da aplicação |
| `--foreground` | #1D1D1F | Texto padrão |
| `--card` | #FFFFFF | Cards e contêineres elevados |
| `--card-foreground` | #1D1D1F | Texto em cards |
| `--border` | #DADADA | Bordas, divisores |
| `--muted` | #DADADA | Superfícies secundárias |
| `--accent` | #2A2451 | Destaques secundários |
| `--primary` | #6422F2 | CTAs, links principais |
| `--primary-foreground` | #FFFFFF | Texto em CTAs |
| `--secondary` | #2A2451 | Etiquetas premium, badges |
| `--secondary-foreground` | #FFFFFF | Texto em elementos secundários |
| `--ring` | #6422F2 | Focus ring |

### 1.2 Dark Mode
| Token | Cor | Uso |
|-------|-----|-----|
| `--background` | #1D1D1F | Fundo principal da aplicação |
| `--foreground` | #ffffffff | Texto padrão |
| `--card` | #2A2451 | Cards e contêineres elevados |
| `--card-foreground` | #F0EEEF | Texto em cards |
| `--border` | rgba(255,255,255,0.06) | Bordas, divisores |
| `--muted` | #2A2451 | Superfícies secundárias |
| `--accent` | #2A2451 | Destaques secundários |
| `--primary` | #6422F2 | CTAs, links principais |
| `--primary-foreground` | #F0EEEF | Texto em CTAs |
| `--secondary` | #2A2451 | Etiquetas premium, badges |
| `--secondary-foreground` | #F0EEEF | Texto em elementos secundários |
| `--ring` | #6422F2 | Focus ring |

### 1.3 Tipografia
| Item | Valor |
|------|-------|
| Fonte principal | Inter (100–600) |
| Headline | Inter 48px/56px, peso 500, tracking -1% |
| Subheadline | Inter 28px/36px, peso 400 |
| Body | Inter 16px/24px, peso 400 |
| Small | Inter 14px/20px, peso 400 |
| Label | Inter 12px/18px, peso 500 |

### 1.4 Espaçamento e Grid
| Token | Valor |
|-------|-------|
| `spacing-base` | 8px |
| `section-padding` | 112px top/bottom (desktop), 72px (tablet), 48px (mobile) |
| `card-gap` | 32px desktop, 24px tablet, 16px mobile |
| `grid-columns` | 12 colunas com gutter 24px |

### 1.5 Radius e Sombras
| Token | Valor |
|-------|-------|
| `radius-sm` | 6px |
| `radius-md` | 8px |
| `shadow-light` | 0px 1px 2px rgba(0,0,0,0.04) |
| `shadow-dark` | 0px 2px 4px rgba(0,0,0,0.16) |
| `shadow-hover` | 0px 8px 24px rgba(100,34,242,0.16) (somente CTA primário) |

## 2. Componentes

### 2.1 Botão Primário
- Background: `var(--primary)`
- Texto: `var(--primary-foreground)`
- Radius: 8px
- Padding: 16px 28px
- Fonte: Inter 16px, peso 500
- Hover: `filter: brightness(1.05)`
- Focus: anel `2px` `var(--ring)`, offset 2px
- Disabled: `opacity: 0.5`, sem mudança de cor

### 2.2 Botão Secundário (outline)
- Background: transparente
- Borda: `1px var(--border)`
- Texto: `var(--foreground)`
- Hover: `background-color: rgba(100,34,242,0.08)`
- Focus: mesmo do primário

### 2.3 Card Base
- Light: background `var(--card)`, borda `var(--border)`
- Dark: background `#2A2451`, borda `rgba(255,255,255,0.06)`
- Radius: 16px (padrão seções), padding 32px
- Shadow: `shadow-light` (light), `shadow-dark` (dark)
- Título: Inter 20px peso 500
- Subtítulo: Inter 16px peso 400, cor `var(--muted-foreground)`

### 2.4 Inputs e Textareas
- Altura: 48px (textarea: auto)
- Background: `var(--card)`
- Borda: `1px var(--border)`
- Radius: 8px
- Placeholder: `var(--muted-foreground)` com 70% opacidade
- Focus: `outline: none; box-shadow: 0 0 0 2px rgba(100,34,242,0.32)`
- Erro: borda `#E5484D`, texto de ajuda `#E5484D`

### 2.5 Switch / Toggle
- Trilho: 52px x 30px
- Fundo: `var(--muted)` (off), `var(--primary)` (on)
- Thumb: 24px, `var(--card)`
- Sombra do thumb: `0px 2px 6px rgba(0,0,0,0.12)`

### 2.6 Dropdown / Popover
- Fundo: `var(--card)`
- Borda: `1px var(--border)`
- Radius: 12px
- Shadow: `0px 12px 32px rgba(0,0,0,0.12)`
- Item ativo: background `rgba(100,34,242,0.08)`, texto `var(--foreground)`

### 2.7 Tabs
- Container: border-bottom `1px var(--border)`
- Item: padding 16px, fonte 16px peso 500
- Ativo: texto `var(--foreground)`, underline `var(--primary)` 2px
- Inativo: texto `rgba(var(--foreground), 0.5)`

### 2.8 Toasts
- Fundo: `var(--card)`
- Borda: `1px var(--border)`
- Shadow: `0px 12px 34px rgba(0,0,0,0.12)`
- Duração padrão: 4s
- Sucesso: barra lateral `#1ED760`
- Erro: barra lateral `#E5484D`

## 3. Layouts

### 3.1 Cabeçalho
- Altura 80px desktop, 72px tablet, 64px mobile
- Background: translúcido `rgba(240,238,239,0.8)` (light) / `rgba(29,29,31,0.8)` (dark)
- Blur: 12px (backdrop)
- Logo: 32px de altura
- Navegação: gap 32px, fonte 16px peso 400
- CTA no header: botão primário padrão

### 3.2 Hero Principal
- Padding: 160px top / 120px bottom (desktop)
- Grid: duas colunas (texto / arte) com gap 96px
- Headline: Inter 64px peso 500
- Subheadline: Inter 22px peso 400, largura máxima 640px
- CTA: botão primário + link secundário
- Background opcional: gradiente radial com `rgba(100,34,242,0.12)`

### 3.3 Seções de Produto
- Título de seção: Inter 40px peso 500
- Descrição: Inter 18px peso 400
- Cards alinhados em grid 3 colunas, gap 32px
- Badge: background `rgba(100,34,242,0.08)`, texto `var(--primary)`

### 3.4 Rodapé
- Background: `var(--background)`
- Grid: 4 colunas desktop, 2 colunas tablet, empilha mobile
- Links: Inter 14px peso 400, cor `var(--muted-foreground)`
- Linha final: borda `var(--border)`, padding 24px

## 4. Interações e Motion
- Transições padrão: `transition: all 0.3s ease`
- Hover em links: `color: var(--primary)`
- Theme toggle: animação Framer Motion 300ms, `opacity` + `rotateX` 15deg
- Skeletons: background `linear-gradient(90deg, #2A2451 0%, #6422F2 50%, #2A2451 100%)` (dark) e equivalente claro

## 5. Acessibilidade
- Contraste mínimo: 4.5:1 para texto normal, 3:1 para headlines
- Focus visible obrigatório em todos os elementos interativos
- Área de clique mínima: 44px x 44px
- Ícones devem ter `aria-hidden="true"` se decorativos
- Links e botões com labels descritivos

## 6. Checklist de Conformidade
- [ ] Variáveis CSS atuais mapeadas para tokens acima
- [ ] Todos os componentes reutilizam tokens, sem cores hex soltas
- [ ] Estados hover/focus/active verificados light/dark
- [ ] Layouts chave (home intranet, módulos, públicos) revisados
- [ ] Nenhum texto usa fonte ou peso fora da escala definida
- [ ] QA de contraste e acessibilidade manual completo

---
Estas especificações devem ser consultadas durante implementações e code reviews para garantir consistência visual e comportamental em toda a aplicação.