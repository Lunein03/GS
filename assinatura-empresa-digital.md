# Assinatura Empresa Digital

**Overview**
Implementar assinatura digital vinculada ao cadastro da empresa (nao do cliente), com suporte a Gov.br e certificado eletronico (ICP-Brasil). Substitui o antigo campo de assinatura por URL e cria um fluxo correto de signatario, tipo de assinatura, status e identificadores. Esta fase descreve o plano de implementacao sem codificar.

**Project Type**
WEB

**Success Criteria**
- Cadastro de empresa exibe secao "Assinatura Digital" com tipos `govbr` e `certificado`.
- Empresa salva e atualiza dados de assinatura via API sem uso de URL.
- Backend persiste tipo, status e identificadores de assinatura associados a `empresas`.
- Propostas/documentos conseguem consumir a assinatura da empresa (quando verificada) sem regressao.
- Migracao aplica sem perda de dados e sem erro em ambientes existentes.

**Tech Stack**
- Frontend: Next.js/React (existente) para UI e validacao.
- Backend: FastAPI + SQLAlchemy + Pydantic (existente) para modelos, schemas e rotas.
- DB: Alembic migrations (existente).
- Integracoes: Gov.br e ICP-Brasil como fluxo de validacao (fase inicial pode ser apenas cadastro + status pendente).

**File Structure**
- Frontend
  - `src/features/gs-propostas/app/app-legacy/cadastro/empresas/components/company-form-dialog.tsx`
  - `src/features/gs-propostas/app/app-legacy/cadastro/empresas/types/company-schemas.ts`
  - `src/features/gs-propostas/api/companies.ts`
  - `src/features/gs-propostas/app/app-legacy/cadastro/assinaturas/*` (referencia/evitar conflito)
- Backend
  - `backend/app/models/crm.py`
  - `backend/app/schemas/crm.py`
  - `backend/app/api/routes/crm.py`
  - `backend/alembic/versions/*_add_company_signature.py`
- SQL
  - `sql/migration_dump.sql` (validar alinhamento)

**Open Questions**
- A empresa deve ter uma unica assinatura ou multiplos responsaveis?
- Para `certificado` (ICP-Brasil), quais campos minimos armazenar: CPF do titular, serial do certificado, CN, emissor?
- O fluxo Gov.br/ICP-Brasil deve ser integrado agora (validacao real) ou apenas cadastro + status pendente?
- A assinatura da empresa deve ser aplicada automaticamente nas propostas ou selecionavel por proposta?

**Task Breakdown**
1. `task_id: T1`
   `name: Discovery e mapeamento atual de assinatura`
   `agent: explorer-agent`
   `skills: clean-code, architecture, plan-writing`
   `priority: P0`
   `dependencies: none`
   `INPUT: mapear modelos/rotas atuais de assinatura e uso em propostas`
   `OUTPUT: relatorio curto com pontos de integracao e riscos`
   `VERIFY: lista de arquivos e campos envolvidos`

2. `task_id: T2`
   `name: Definir modelo de dados de assinatura da empresa`
   `agent: project-planner`
   `skills: plan-writing, brainstorming`
   `priority: P0`
   `dependencies: T1`
   `INPUT: requisitos + respostas das Open Questions`
   `OUTPUT: definicao de campos e enums (tipo/status/identificadores)`
   `VERIFY: schema aprovado pelo stakeholder`

3. `task_id: T3`
   `name: Migracao de banco para assinatura da empresa`
   `agent: backend-specialist`
   `skills: clean-code`
   `priority: P0`
   `dependencies: T2`
   `INPUT: definicao de campos`
   `OUTPUT: migration Alembic adicionando colunas em `empresas``
   `VERIFY: migration aplica e reverte sem erro`

4. `task_id: T4`
   `name: Backend - modelos e schemas de empresa`
   `agent: backend-specialist`
   `skills: clean-code`
   `priority: P1`
   `dependencies: T3`
   `INPUT: colunas novas em `empresas``
   `OUTPUT: `Empresa` model e `Company*` schemas atualizados`
   `VERIFY: validacao Pydantic passa para payloads validos`

5. `task_id: T5`
   `name: Backend - rotas CRM de empresas`
   `agent: backend-specialist`
   `skills: clean-code`
   `priority: P1`
   `dependencies: T4`
   `INPUT: schemas atualizados`
   `OUTPUT: endpoints `POST/PUT /crm/companies` aceitam assinatura`
   `VERIFY: create/update retornam novos campos`

6. `task_id: T6`
   `name: Frontend - schema e types de empresa`
   `agent: frontend-specialist`
   `skills: clean-code`
   `priority: P1`
   `dependencies: T4`
   `INPUT: schema backend`
   `OUTPUT: `company-schemas.ts` com novos campos e validacao`
   `VERIFY: formulario valida corretamente por tipo`

7. `task_id: T7`
   `name: Frontend - UI de assinatura digital no cadastro da empresa`
   `agent: frontend-specialist`
   `skills: app-builder`
   `priority: P1`
   `dependencies: T6`
   `INPUT: requisitos de UI`
   `OUTPUT: secao "Assinatura Digital" com tipo, identificador, status`
   `VERIFY: UX funcional sem URL e sem regressao`

8. `task_id: T8`
   `name: Integracao futura Gov.br / ICP-Brasil (placeholder)`
   `agent: backend-specialist`
   `skills: brainstorming`
   `priority: P2`
   `dependencies: T5`
   `INPUT: endpoints definidos`
   `OUTPUT: rotas stub para iniciar validacao externa`
   `VERIFY: endpoints retornam status pendente/verificado`

9. `task_id: T9`
   `name: Ajustes nas propostas/documentos`
   `agent: backend-specialist`
   `skills: clean-code`
   `priority: P2`
   `dependencies: T5`
   `INPUT: assinatura da empresa`
   `OUTPUT: consumo da assinatura da empresa ao gerar proposta`
   `VERIFY: PDF/HTML exibem assinatura correta`

10. `task_id: T10`
    `name: QA e testes`
    `agent: test-engineer`
    `skills: systematic-debugging`
    `priority: P3`
    `dependencies: T7, T9`
    `INPUT: funcionalidade completa`
    `OUTPUT: testes minimos (unit + manual check)`
    `VERIFY: smoke test frontend e endpoints CRUD`

**Phase X: Verification**
- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build`
- [ ] `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] `python .agent/skills/frontend-design/scripts/ux_audit.py .`
- [ ] `python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:3000`
- [ ] `python .agent/skills/webapp-testing/scripts/playwright_runner.py http://localhost:3000 --screenshot`
- [ ] Atualizar esta secao com "PHASE X COMPLETE" somente apos todos os checks passarem.
