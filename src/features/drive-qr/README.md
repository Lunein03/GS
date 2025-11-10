# Drive QR - Decisão de Arquitetura

## Status: Mantido como Server-Side

### Decisão
O módulo Drive QR **não será migrado** para a API FastAPI e permanecerá usando funções server-side do Next.js.

### Justificativa

1. **Simplicidade**: O módulo apenas extrai metadados de URLs do Google Drive, sem necessidade de autenticação complexa.

2. **Sem Estado**: Não há dados persistentes que precisem ser gerenciados pelo backend.

3. **Performance**: Executar no Next.js (edge/serverless) é mais rápido que fazer round-trip para API Python.

4. **Manutenibilidade**: O código TypeScript já está funcionando e bem estruturado.

5. **Custo-Benefício**: Migrar para FastAPI não traria benefícios significativos e aumentaria a complexidade.

### Arquitetura Atual

```
Cliente (Browser)
    ↓
Next.js Server Functions (src/features/drive-qr/server/)
    ↓
Google Drive API (público)
```

### Quando Reavaliar

Considerar migração para FastAPI apenas se:
- Precisar de autenticação OAuth com Google Drive
- Precisar de cache persistente de metadados
- Precisar de processamento pesado de arquivos
- Precisar compartilhar lógica com outros serviços Python

### Arquivos Principais

- `src/features/drive-qr/server/google-drive.ts` - Extração de metadados
- `src/features/drive-qr/hooks/` - Hooks React para UI
- `src/features/drive-qr/ui/` - Componentes de interface

### Manutenção

Este módulo está **estável** e não requer migração. Qualquer manutenção futura deve continuar usando TypeScript/Next.js.

---

**Data da Decisão:** 2025-01-03  
**Revisado por:** Equipe de Desenvolvimento  
**Próxima Revisão:** Quando houver necessidade de novas funcionalidades
