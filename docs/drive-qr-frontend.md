# Diretrizes de Frontend para o módulo Drive QR

## Visão geral
- Layout inspirado em ambiente noturno com gradientes sutis roxo/azul, garantindo contraste mínimo WCAG AA.
- Estrutura em três blocos principais: cabeçalho hero (layout), painel de upload (content) e lista de resultados.
- Priorizar hierarquia visual clara: títulos grandes, legendas discretas e botões com destaque em gradiente.

## Paleta e estilo
- Fundo base `#050618` aplicado no layout, com sobreposições de gradientes para profundidade.
- Tarjas e cartões usam `bg-white/[0.04~0.10]` com bordas `border-white/5` para manter o efeito vidro.
- Componentes de chamada para ação utilizam gradiente `from-primary to-indigo-500` e sombra difusa.
- Badges seguem gradientes específicos: verde (sucesso), rosa (erro), azul/índigo (elementos neutros).

## Componentes e responsabilidades
- `DriveQrLayout`: controla fundo global, hero e botão de retorno; manter elementos decorativos em wrappers absolutos para fácil ajuste.
- `DriveQrContent`: administra cards principais, resumo e renderização condicional; evitar lógica de estado além de agregações simples.
- `QRCodeUploader`: drag & drop com feedback visual; preservar estados de arraste, foco e busy na mesma div interativa.
- `QRCodeResults`: lista sequencial (sem grid) para reforçar leitura; cada cartão agrupa prévia, metadados, texto e áudio.
- Contexto e serviços permanecem responsáveis por lógica, mantendo componentes focados apenas em visualização.

## Estados e feedback
- Sempre exibir estatísticas agregadas (válidos/erros) para orientar o usuário, mesmo com zero resultados.
- Resultados em erro usam bloco em vermelho translúcido com texto claro e ícone `XCircle`.
- Upload em progresso substitui ícone por spinner; botão fica desabilitado mas mantém contraste.
- Prévia em áudio aparece somente quando disponível, com área em indigo translúcido destacando o player.

## Boas práticas de implementação
- Utilizar apenas componentes funcionais com interfaces tipadas; concentrar strings estáticas próximas ao componente.
- Preferir `className` utilitário via Tailwind com valores arbitrários quando necessário (por exemplo, `rounded-[32px]`).
- Evitar exibir detalhes internos (ex.: método de extração); focar em mensagens amigáveis ao usuário.
- Manter responsividade mobile-first: colunas viram uma única coluna até ~1024px.
- Reaproveitar ícones Lucide com tamanho `h-4 w-4` para consistência.
- Validar lint (`npm run lint`) antes de abrir PRs.
