# 🔍 Drive QR Scanner

Scanner de QR codes otimizado para links do Google Drive com extração inteligente de títulos e reprodução de áudio.

## ✨ Funcionalidades

- 📸 **Scanner de QR Codes**: Processa múltiplos QR codes simultaneamente usando jsQR
- 🔍 **Detecção de Links**: Identifica automaticamente links do Google Drive
- 🎯 **Extração Inteligente**: Web scraping com Cheerio para obter títulos reais dos arquivos
- 🎵 **Reprodução de Áudio**: Proxy integrado para streaming de arquivos de áudio do Google Drive
- 📁 **Identificação Clara**: Separa nome do arquivo local (.png) do título no Google Drive
- ⚡ **Processamento em Lote**: Endpoint otimizado para múltiplas URLs
- 🎨 **Interface Moderna**: Design responsivo com tema dark e gradientes

## 🏗️ Estrutura do Projeto

```
app/drive-qr/
├── page.tsx                      # Página principal (Server Component)
├── layout.tsx                    # Layout com metadata
├── providers.tsx                 # Providers (Toast, Tooltip, Context)
├── not-found.tsx                 # Página 404
│
├── components/
│   ├── drive-qr-content.tsx      # Componente principal (Client)
│   ├── drive-qr-layout.tsx       # Layout visual com hero
│   ├── qr-code-uploader.tsx      # Upload com drag & drop
│   └── qr-code-results.tsx       # Listagem de resultados
│
├── api/
│   ├── drive/
│   │   ├── extract-title/        # POST - Extrai título de uma URL
│   │   ├── extract-titles/       # POST - Batch processing de URLs
│   │   └── audio/[fileId]/       # GET - Proxy de streaming de áudio
│   └── health/                   # GET - Health check do serviço
│
├── lib/
│   ├── google-drive.ts           # Lógica de extração de metadados
│   ├── qr-processor.ts           # Processamento de QR codes
│   └── drive-client.ts           # Cliente para APIs
│
├── context/
│   └── drive-qr-provider.tsx     # Context API para estado
│
├── hooks/
│   └── use-drive-qr-context.ts   # Hook para acessar o context
│
└── types/
    └── index.ts                  # Definições de tipos TypeScript
```

## 🚀 Como Usar

### 1. Acessar o Scanner

Navegue para: `http://localhost:3000/drive-qr`

### 2. Upload de QR Codes

- **Arraste e solte** imagens contendo QR codes na área de upload
- Ou **clique** na área para selecionar arquivos manualmente
- Suporta múltiplos arquivos simultaneamente

### 3. Visualizar Resultados

O sistema automaticamente:
- Lê o QR code da imagem
- Verifica se é um link do Google Drive
- Extrai o título real do arquivo
- Detecta se é um arquivo de áudio
- Exibe player de áudio se aplicável

## 🔌 APIs Disponíveis

### Extrair Título Individual

```bash
POST /drive-qr/api/drive/extract-title
Content-Type: application/json

{
  "url": "https://drive.google.com/file/d/1abc..."
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "fileId": "1abc...",
    "title": "Meu Arquivo.mp3",
    "method": "nodejs-scraping",
    "audio": {
      "isAudio": true,
      "proxyPath": "/drive-qr/api/drive/audio/1abc...",
      "downloadUrl": "https://drive.usercontent.google.com/uc?id=1abc...",
      "mimeType": "audio/mpeg"
    }
  }
}
```

### Extrair Títulos em Lote

```bash
POST /drive-qr/api/drive/extract-titles
Content-Type: application/json

{
  "urls": [
    "https://drive.google.com/file/d/1abc...",
    "https://drive.google.com/file/d/2def..."
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "data": [
    {
      "success": true,
      "fileId": "1abc...",
      "title": "Arquivo 1.mp3",
      "method": "nodejs-scraping",
      "url": "https://drive.google.com/file/d/1abc...",
      "audio": { ... }
    },
    {
      "success": true,
      "fileId": "2def...",
      "title": "Arquivo 2.wav",
      "method": "nodejs-scraping",
      "url": "https://drive.google.com/file/d/2def...",
      "audio": { ... }
    }
  ]
}
```

### Streaming de Áudio

```bash
GET /drive-qr/api/drive/audio/[fileId]
Range: bytes=0-1023  # Opcional para streaming parcial
```

**Características:**
- ✅ Suporta Range requests (seeking)
- ✅ Headers CORS apropriados
- ✅ Cache de 1 hora
- ✅ Detecção automática de Content-Type
- ✅ Proxy transparente do Google Drive

### Health Check

```bash
GET /drive-qr/api/health
```

**Resposta:**
```json
{
  "status": "ok",
  "service": "Drive QR Scanner",
  "timestamp": "2025-10-16T12:00:00.000Z",
  "version": "1.0.0",
  "checks": {
    "api": "operational",
    "driveProxy": "operational",
    "extractTitle": "operational"
  }
}
```

## 🎵 Formatos de Áudio Suportados

- 🎵 MP3 (`audio/mpeg`)
- 🎵 WAV (`audio/wav`)
- 🎵 M4A (`audio/mp4`)
- 🎵 AAC (`audio/aac`)
- 🎵 OGG (`audio/ogg`)
- 🎵 FLAC (`audio/flac`)
- 🎵 WMA (`audio/x-ms-wma`)

## 🔧 Tecnologias Utilizadas

### Frontend
- **Next.js 14+** - App Router
- **React 18** - Componentes funcionais
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **jsQR** - Leitura de QR codes
- **Lucide React** - Ícones

### Backend
- **Next.js API Routes** - Endpoints REST
- **Cheerio** - Web scraping
- **Zod** - Validação de schemas
- **Node.js Streams** - Streaming de áudio

## 🎨 Design System

O módulo segue o design system da intranet:
- 🌙 Tema dark com gradientes roxo/azul
- 💎 Efeito glassmorphism nos cards
- ✨ Animações sutis e transições suaves
- 📱 Mobile-first e totalmente responsivo
- ♿ Acessibilidade WCAG AA

## 🧪 Testes Recomendados

### Manual
1. ✅ Upload de QR code com link válido do Google Drive
2. ✅ Upload de múltiplos QR codes simultaneamente
3. ✅ QR code apontando para arquivo de áudio
4. ✅ Reprodução de áudio com seek (arrastar barra)
5. ✅ QR code com link inválido ou sem permissão
6. ✅ Imagem sem QR code ou desfocada

### Automatizados
```bash
# TODO: Implementar testes com Vitest
npm run test:drive-qr
```

## 📊 Performance

- ⚡ Processamento local de QR codes (sem latência de rede)
- ⚡ Extração paralela de metadados
- ⚡ Streaming eficiente de áudio com Range requests
- ⚡ Cache de 1 hora para áudio (reduz chamadas ao Drive)

## 🐛 Troubleshooting

### Player de áudio não funciona
- Verificar se o arquivo tem permissão pública no Google Drive
- Verificar console do browser para erros CORS
- Testar endpoint: `/drive-qr/api/health`
- Tentar download direto usando o link alternativo

### Título não é extraído corretamente
- Arquivo pode estar em pasta privada
- Link pode ser de tipo não suportado
- Sistema usa fallback: "Arquivo (ID...)"

### QR code não é detectado
- Imagem muito pequena ou desfocada
- QR code danificado ou com baixo contraste
- Tentar melhorar qualidade da imagem

## 🔮 Roadmap Futuro

- [ ] Suporte a outros tipos de arquivo (documentos, planilhas)
- [ ] Cache Redis para metadados
- [ ] Histórico de QR codes processados
- [ ] Export de resultados para CSV/JSON
- [ ] Integração com Google Drive API (autenticação)
- [ ] Testes automatizados completos

## 📝 Licença

Este módulo faz parte da Intranet GS Produções e é de uso interno.

---

**Última atualização**: 16 de Outubro de 2025  
**Versão**: 1.0.0  
**Status**: ✅ Funcional
