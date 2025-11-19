# Planejamento - Dia 13

## Contexto
- Evoluir a experiência de patrimônio com etiquetas QR e garantir que o backend valide os identificadores.
- Manter estabilidade do inventário existente durante as mudanças.

## Objetivos Principais
- Definir fluxo final de uso do QR code (página pública x validação interna).
- Projetar endpoints FastAPI necessários para consulta e registro de leitura.
- Planejar experiência de auditoria rápida via leitura de QR codes.

## Tarefas Prioritárias
1. Mapear requisitos funcionais da página pública e da página interna protegida.
2. Especificar contrato de API para recuperar detalhes do equipamento via código.
3. Desenhar modelo de dados para histórico de leituras (timestamp, usuário, localização).
4. Elaborar estratégia de assinatura/validação do payload para evitar clonagem.
5. Definir formato de impressão e processo operacional das etiquetas.

## Dependências e Insumos
- Necessário confirmar com time jurídico/gestão o texto institucional da página pública.
- Verificar disponibilidade do time backend para criar/ajustar endpoints.
- Checar infraestrutura para hospedar URL curta (DNS ou redirect no Next.js).

## Riscos e Mitigações
- **Risco:** Exposição de dados sensíveis na página pública.
  - **Mitigação:** Mostrar apenas código, nome resumido e contatos; demais dados via área autenticada.
- **Risco:** Uso de QR falsificado.
  - **Mitigação:** Assinar payload e validar assinatura no backend antes de exibir detalhes.
- **Risco:** Falta de adoção no time operacional.
  - **Mitigação:** Preparar treinamento rápido e checklist de auditoria.

## Indicadores de Conclusão do Dia
- Documento de requisitos validado com stakeholders.
- Especificação de API revisada e compartilhada com backend.
- Prototipagem inicial das telas (wireframe ou mock) aprovada.

## Próximos Passos Imediatos
- Agendar alinhamento com stakeholders (manhã do dia 13).
- Criar issues no tracker para cada tarefa priorizada.
- Preparar roteiro de auditoria para teste piloto com 5 equipamentos.
