# SPEC-001: Estrutura do Projeto

**Status:** ✅ Concluído  
**Prioridade:** P0 (Bloqueador)  
**Estimativa:** 10 min  
**Dependências:** Nenhuma  
**Data de Conclusão:** 2026-02-03

---

## 📋 Objetivo

Criar a estrutura de pastas necessária para a nova arquitetura do GS Propostas.

---

## 📂 Estrutura Criada

```
src/
├── features/gs-propostas/
│   └── ui/
│       └── components/
│           └── proposta-unificada/          ✅ CRIADO
│               ├── index.ts                  ✅ CRIADO
│               ├── proposta-unificada.tsx    ✅ CRIADO
│               ├── header.tsx                ✅ CRIADO
│               ├── footer.tsx                ✅ CRIADO
│               └── tabs/                     ✅ CRIADO
│                   ├── index.ts              ✅ CRIADO
│                   ├── principal-tab.tsx     ✅ CRIADO
│                   ├── itens-tab.tsx         ✅ CRIADO
│                   ├── documentos-tab.tsx    ✅ CRIADO
│                   ├── clientes-tab.tsx      ✅ CRIADO
│                   ├── empresas-tab.tsx      ✅ CRIADO
│                   ├── categorias-tab.tsx    ✅ CRIADO
│                   ├── pagamentos-tab.tsx    ✅ CRIADO
│                   ├── assinaturas-tab.tsx   ✅ CRIADO
│                   ├── notas-tab.tsx         ✅ CRIADO
│                   └── historico-tab.tsx     ✅ CRIADO
└── app/(workspace)/gs-propostas/
    └── proposta/                             ✅ CRIADO
        ├── nova/
        │   └── page.tsx                      ✅ CRIADO
        └── [id]/
            └── page.tsx                      ✅ CRIADO
```

---

## ✅ Checklist de Implementação

### Pastas Criadas

- [x] `src/features/gs-propostas/ui/components/proposta-unificada/`
- [x] `src/features/gs-propostas/ui/components/proposta-unificada/tabs/`
- [x] `src/app/(workspace)/gs-propostas/proposta/`
- [x] `src/app/(workspace)/gs-propostas/proposta/nova/`
- [x] `src/app/(workspace)/gs-propostas/proposta/[id]/`

### Arquivos Criados

- [x] `proposta-unificada/index.ts` (barrel export)
- [x] `proposta-unificada/proposta-unificada.tsx` (componente principal)
- [x] `proposta-unificada/header.tsx` (header)
- [x] `proposta-unificada/footer.tsx` (footer)
- [x] `proposta-unificada/tabs/index.ts` (barrel export das tabs)
- [x] Todas as 10 tabs placeholder

---

## 🔍 Verificação

```bash
# Verificar estrutura criada
ls -la src/features/gs-propostas/ui/components/proposta-unificada/
ls -la src/features/gs-propostas/ui/components/proposta-unificada/tabs/
ls -la src/app/(workspace)/gs-propostas/proposta/

# Resultado esperado: pastas existem
```

---

## 📝 Notas de Implementação

1. Usar `mkdir -p` ou ferramenta equivalente para criar recursivamente
2. Placeholders devem exportar componentes vazios para evitar erros de import
3. Manter convenção kebab-case para arquivos

---

## 🔄 Rollback

Se necessário reverter:

```bash
rm -rf src/features/gs-propostas/ui/components/proposta-unificada/
rm -rf src/app/(workspace)/gs-propostas/proposta/
```

---

## 🔍 Verificação Realizada

| Check                                  | Resultado      |
| -------------------------------------- | -------------- |
| TypeScript (`npx tsc --noEmit`)        | ✅ Exit code 0 |
| HTTP `GET /gs-propostas/proposta/nova` | ✅ HTTP 200 OK |
| Arquivos criados                       | ✅ 16 arquivos |
| Pastas criadas                         | ✅ 5 pastas    |

---

**Próximo:** [SPEC-002-proposta-unificada.md](./SPEC-002-proposta-unificada.md)
