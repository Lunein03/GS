# 🚀 Implementação Pendente - Drive QR Scanner

**Status Atual**: 80% completo  
**Data de Análise**: 16 de Outubro de 2025  
**Prioridade**: Alta

---

## 📊 Visão Geral

O módulo Drive QR Scanner em `http://localhost:3000/drive-qr` está funcional mas incompleto. Este documento detalha os itens pendentes para torná-lo 100% operacional.

---

## 🔴 CRÍTICO - Implementação Imediata

### 1. Route Handler de Proxy de Áudio
**Arquivo**: `app/drive-qr/api/drive/audio/[fileId]/route.ts`  
**Status**: ❌ Não implementado (diretório vazio)  
**Impacto**: Sem isso, arquivos de áudio não podem ser reproduzidos

#### Requisitos:
- Suporte a Range requests (streaming parcial)
- Headers CORS apropriados
- Proxy direto do Google Drive
- Tratamento de erros 404/403/500
- Content-Type dinâmico baseado no arquivo
- Cache headers para performance

#### Referência:
Baseado em `drive-qr-scanner/node-service/server.js` (endpoint `/drive-audio/:fileId`)

#### Implementação:
```typescript
// app/drive-qr/api/drive/audio/[fileId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;
  
  // Validar fileId
  if (!fileId || !/^[a-zA-Z0-9-_]{10,}$/.test(fileId)) {
    return NextResponse.json(
      { error: 'ID de arquivo inválido' },
      { status: 400 }
    );
  }

  // URL do Google Drive
  const driveUrl = `https://drive.usercontent.google.com/uc?id=${fileId}&export=download`;

  try {
    // Obter headers de range do request
    const rangeHeader = request.headers.get('range');
    
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };

    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    // Fazer request ao Google Drive
    const response = await fetch(driveUrl, {
      headers,
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Google Drive retornou status ${response.status}`);
    }

    // Preparar headers da resposta
    const responseHeaders = new Headers();
    
    // Copiar headers importantes
    const headersToCopy = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
    ];

    headersToCopy.forEach((headerName) => {
      const value = response.headers.get(headerName);
      if (value) {
        responseHeaders.set(headerName, value);
      }
    });

    // Adicionar CORS
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range');

    // Se não tiver content-type, definir padrão
    if (!responseHeaders.get('content-type')) {
      responseHeaders.set('content-type', 'audio/mpeg');
    }

    // Retornar stream
    return new NextResponse(response.body, {
      status: rangeHeader ? 206 : 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Erro ao fazer proxy de áudio:', error);
    return NextResponse.json(
      { error: 'Erro ao acessar arquivo de áudio no Google Drive' },
      { status: 500 }
    );
  }
}

// Suporte a OPTIONS para CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
    },
  });
}
```

---

### 2. Atualizar Lógica de Construção de URL de Áudio
**Arquivo**: `app/drive-qr/lib/google-drive.ts`  
**Status**: ⚠️ Parcialmente implementado  
**Impacto**: URLs de áudio não apontam para o proxy correto

#### Modificações necessárias:
Na função `buildAudioInfo`, atualizar:
```typescript
function buildAudioInfo({
  fileId,
  title,
  url,
}: {
  fileId: string | null;
  title: string | null;
  url: string;
}): DriveAudioInfo {
  const isAudio = detectAudio(title, url);

  if (!isAudio || !fileId) {
    return {
      isAudio: false,
      proxyPath: null,
      downloadUrl: null,
      mimeType: null,
    };
  }

  // URL do proxy interno (Next.js)
  const proxyPath = `/drive-qr/api/drive/audio/${fileId}`;
  
  // URL de download direto do Google Drive
  const downloadUrl = `https://drive.usercontent.google.com/uc?id=${fileId}&export=download`;

  // Detectar MIME type baseado na extensão
  const mimeType = detectMimeType(title);

  return {
    isAudio: true,
    proxyPath,
    downloadUrl,
    mimeType,
  };
}

function detectMimeType(title: string | null): string {
  if (!title) return 'audio/mpeg';
  
  const normalized = title.toLowerCase();
  const mimeTypes: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.wma': 'audio/x-ms-wma',
  };

  for (const [ext, mime] of Object.entries(mimeTypes)) {
    if (normalized.includes(ext)) {
      return mime;
    }
  }

  return 'audio/mpeg'; // Padrão
}
```

---

### 3. Verificar Componente de Áudio
**Arquivo**: `app/drive-qr/components/qr-code-results.tsx`  
**Status**: ✅ Já implementado (verificar se está usando a URL correta)

Confirmar que está usando `result.audio.url` que deve apontar para o proxy:
```typescript
{result.audio?.url && (
  <div className="border border-border rounded-lg p-3">
    <audio
      controls
      preload="none"
      className="w-full"
      src={result.audio.url}
    >
      Seu navegador não suporta reprodução de áudio.
    </audio>
    <p className="mt-2 text-xs text-muted-foreground">
      Se o áudio não iniciar,{' '}
      <a
        href={result.audio.downloadUrl ?? result.audio.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        abra ou baixe o arquivo
      </a>{' '}
      diretamente.
    </p>
  </div>
)}
```

---

## 🟡 IMPORTANTE - Próxima Fase

### 4. Endpoint de Batch Processing
**Arquivo**: `app/drive-qr/api/drive/extract-titles/route.ts`  
**Status**: ❌ Não implementado  
**Impacto**: Performance ao processar múltiplos QR codes

#### Implementação:
```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractDriveMetadata } from '@/app/drive-qr/lib/google-drive';
import type { ActionResponse } from '@/types/actions';
import { appErrors } from '@/types/actions';

const schema = z.object({
  urls: z.array(z.string().url()).min(1).max(50),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            ...appErrors.VALIDATION_ERROR,
            details: { issues: parsed.error.flatten() },
          },
        },
        { status: 400 }
      );
    }

    // Processar em paralelo
    const results = await Promise.allSettled(
      parsed.data.urls.map((url) => extractDriveMetadata(url))
    );

    const data = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        success: false,
        fileId: null,
        title: 'Erro ao processar',
        method: 'error',
        audio: {
          isAudio: false,
          proxyPath: null,
          downloadUrl: null,
          mimeType: null,
        },
        url: parsed.data.urls[index],
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Erro ao processar URLs em lote', error);
    return NextResponse.json(
      {
        success: false,
        error: appErrors.UNEXPECTED_ERROR,
      },
      { status: 500 }
    );
  }
}
```

---

### 5. Sistema de Health Check
**Arquivo**: `app/drive-qr/api/health/route.ts`  
**Status**: ❌ Não implementado  
**Impacto**: Diagnóstico de problemas

#### Implementação:
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'ok',
    service: 'Drive QR Scanner',
    timestamp: new Date().toISOString(),
    checks: {
      api: 'operational',
    },
  };

  return NextResponse.json(health);
}
```

---

## 🟢 OPCIONAL - Melhorias Futuras

### 6. Configuração Dinâmica de Serviços
**Arquivo**: `app/drive-qr/lib/config.ts` (criar)  
**Status**: ❌ Não existe  
**Benefício**: Permitir múltiplos backends com fallback

### 7. Serviço Python
**Decisão Pendente**: Manter ou remover `drive-qr-scanner/python-service/`  
**Opções**:
- Manter como fallback robusto
- Remover completamente (Node.js é suficiente)
- Migrar para serverless function

### 8. Melhorias de UI
- Badge mostrando método de extração usado
- Ícones específicos por tipo de arquivo (doc, sheet, slide)
- Estatísticas de performance
- Loading skeleton mais elaborado

---

## 📋 Checklist de Implementação

### Fase 1 - Crítico (Hoje)
- [ ] Implementar `app/drive-qr/api/drive/audio/[fileId]/route.ts`
- [ ] Atualizar `buildAudioInfo` em `google-drive.ts`
- [ ] Adicionar função `detectMimeType`
- [ ] Testar reprodução de áudio no browser
- [ ] Testar range requests (seek no player)

### Fase 2 - Importante (Esta Semana)
- [ ] Implementar `extract-titles` (batch)
- [ ] Implementar health check endpoint
- [ ] Adicionar testes de integração
- [ ] Documentar APIs no README

### Fase 3 - Opcional (Próximo Sprint)
- [ ] Decidir sobre serviço Python
- [ ] Sistema de configuração dinâmica
- [ ] Melhorias de UI
- [ ] Métricas e logging

---

## 🧪 Plano de Testes

### Testes Manuais Necessários:
1. Upload de imagem com QR code de áudio
2. Verificar extração do título
3. Clicar play no player de áudio
4. Testar seek (arrastar barra de progresso)
5. Testar download direto
6. Testar com múltiplos QR codes simultaneamente
7. Testar com QR codes inválidos
8. Testar com links sem permissão

### Casos de Borda:
- QR code com imagem desfocada
- Link do Drive sem permissão pública
- Arquivo muito grande (>100MB)
- Tipos de arquivo não suportados
- URLs malformadas

---

## 📚 Referências

- Código original: `drive-qr-scanner/`
- Documentação: `docs/drive-qr-integracao.md`
- Padrão do projeto: `app/patrimonio/`
- Node service: `drive-qr-scanner/node-service/server.js`

---

## 🎯 Meta Final

**Drive QR Scanner 100% funcional** com:
✅ Leitura de QR codes  
✅ Extração de títulos do Google Drive  
✅ Reprodução de arquivos de áudio  
✅ Interface moderna e responsiva  
✅ Processamento em lote eficiente  
✅ Tratamento robusto de erros  

---

**Última Atualização**: 16 de Outubro de 2025  
**Responsável**: Equipe de Desenvolvimento  
**Prioridade**: 🔴 Alta
