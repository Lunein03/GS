# Drive QR - Decisão de Arquitetura

## Status: Mantido como Server-Side

### Decisão

O módulo Drive QR permanece usando funções server-side do Next.js.

### Justificativa

1. **Simplicidade**: O módulo apenas extrai metadados de URLs do Google Drive, sem necessidade de autenticação complexa.

2. **Sem Estado**: Não há dados persistentes que precisem ser gerenciados por um backend separado.

3. **Performance**: Executar no Next.js (edge/serverless) é rápido e eficiente.

4. **Manutenibilidade**: O código TypeScript já está funcionando e bem estruturado.

### Arquitetura Atual

```
Cliente (Browser)
    ↓
Next.js Server Functions (src/features/drive-qr/server/)
    ↓
Google Drive API (público)
```

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
