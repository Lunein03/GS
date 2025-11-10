# Plano de Implementação da Identidade Visual Apple-Like

## 1. Objetivo

Garantir que toda a interface da intranet adote a estética Apple minimalista utilizando exclusivamente a paleta proprietária definida:
- Light Mode: #F0EEEF (fundo), #DADADA (UI), #1D1D1F (texto), #6422F2 (primário), #2A2451 (secundário)
- Dark Mode: #1D1D1F (fundo), #F0EEEF (texto), #DADADA (UI), #6422F2 (primário), #2A2451 (cards)
- Tipografia oficial: Inter

## 2. Premissas e Restrições
- Nenhuma cor externa ou saturada deve ser introduzida.
- Headlines e textos devem usar Inter com pesos moderados (até 600).
- Layouts precisam privilegiar espaço negativo, hierarquia visual e minimalismo extremo.
- Shadows sempre sutis: quase invisíveis no light, super leves no dark.
- Radius padrão: 6–8px para componentes interativos.
- Manter compatibilidade com o sistema de temas atual (next-themes + animação).

## 3. Escopo
1. **Fundação**: atualização de fontes, variáveis CSS, Tailwind e tokens de design.
2. **Componentes base**: Buttons, Cards, Inputs, Dropdowns, Tabs, Switches, Toasts.
3. **Layouts e páginas**: Hero sections, cabeçalhos, seções de destaque, dashboards, formulários.
4. **Experiência**: animações, transições, estados de hover/focus, consistência de ícones.
5. **Qualidade**: testes visuais (manual), revisão responsiva, validação dark mode.
6. **Documentação**: atualização de guias, changelog e exemplos de uso.

## 4. Fases e Tarefas
### Fase 0 — Preparação
- Mapear arquivos críticos (globals.css, tailwind.config.ts, theme provider, componentes UI).
- Registrar estado atual (screenshots e notas breves).

### Fase 1 — Fundamentos do Design System
- Substituir Poppins por Inter (fonts Next + Tailwind).
- Revisar variáveis em `globals.css` garantindo valores exatos em HSL correspondentes.
- Reorganizar tokens em `tailwind.config.ts` (cores, radius, sombras, background-image).
- Atualizar documentação interna (`Docs/Identidade Visual.md`) se necessário.

### Fase 2 — Componentes Core
- Buttons: aplicar paleta, radius, hover brightness, espaçamento amplo.
- Cards: bordas 1px, sombras sutis, fundos corretos light/dark.
- Inputs e fields: foco com `ring` roxo primário, preenchimento consistente.
- Dropdowns/menus/modais: bordas + sombras discretas, alinhamento com tokens.
- Ícones: revisar cores (monocromáticos, variações light/dark).

### Fase 3 — Layouts e Páginas
- Hero principal: título grande Inter, CTA roxo primário, fundo com padrões suaves opcional.
- Seções de produto (Drive QR, Patrimônio, GS Propostas): aplicar espaçamento Apple, cards uniformes.
- Formulários e fluxos: estados de erro/sucesso usando paleta, layout clean.
- Cabeçalho e rodapé: simplificar, remover ruídos visuais, focar em tipografia.

### Fase 4 — Experiência e Interações
- Revisar animações do theme toggle (Framer Motion) garantindo suavidade.
- Ajustar transições de hover/focus/active para todos os componentes.
- Implementar feedbacks visuais sutis (progress indicators, skeletons) com paleta.

### Fase 5 — Validação e Documentação Final
- Testes manuais em Light/Dark e principais breakpoints.
- Conferir contraste mínimo (WCAG AA) para todas as combinações.
- Atualizar documentação de design e storybooks/exemplos se existirem.
- Gerar checklist de QA concluída.

## 5. Entregáveis
- Código atualizado seguindo a identidade visual.
- Guia revisado com screenshots light/dark.
- Checklist de QA assinado (manual ou automatizado).
- Registro de mudanças em CHANGELOG ou documentação interna.

## 6. Critérios de Aceite
- Toda interface usa apenas a paleta e tipografia definidas.
- Não há regressões de funcionalidade ou acessibilidade percebidas.
- Light e Dark Mode visualmente consistentes.
- Nenhuma ocorrência de cores antigas identificada por busca automatizada.
- Stakeholders aprovam review visual (light/dark) em páginas críticas.

## 7. Riscos e Mitigações
| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Inconsistência de cores herdadas | Alto | Rodar buscas por hex antigos, revisar componentes compartilhados |
| Diferenças de tipografia após migração | Médio | Testar fallback, validar pesos no Figma/inspeção |
| Regressão em dark mode | Alto | Testes dedicados após cada fase, screenshots |
| Ruptura de espaçamento existente | Médio | Revisar layouts principais após ajustes, ajustar utilitários |
| Erros de build por remoção de tokens | Baixo | Executar `npm run lint`/`npm run build` após cada fase |

## 8. Cronograma Sugerido (referência)
1. Fase 0–1: 1 dia
2. Fase 2: 2 dias
3. Fase 3: 2 dias
4. Fase 4: 1 dia
5. Fase 5: 1 dia
Total estimado: 7 dias úteis (ajustar conforme equipe/disponibilidade).

## 9. Checklist Operacional
- [ ] Fontes Inter configuradas e aplicadas globalmente
- [ ] Variáveis CSS e tokens Tailwind alinhados à paleta
- [ ] Componentes core revisados (buttons, cards, inputs, etc.)
- [ ] Páginas principais atualizadas (Drive QR, Patrimônio, GS Propostas, público)
- [ ] Testes light/dark concluídos
- [ ] Documentação e changelog atualizados

---
Este plano deve ser revisado com o time antes da execução para ajustar prioridades, estimativas e responsabilidades.