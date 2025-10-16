# 🧪 Guia de Testes - Drive QR Scanner

**Módulo**: Drive QR Scanner  
**URL**: http://localhost:3000/drive-qr  
**Status**: Pronto para testes

---

## 🚀 Pré-requisitos

1. **Servidor rodando**:
```bash
cd "C:/Users/GS Produçoes/Documents/PROJETOS 2025/Intranet/gsproducao-website-master"
npm run dev
```

2. **QR Codes de teste**:
   - Ter imagens PNG/JPG contendo QR codes
   - QR codes devem apontar para links do Google Drive
   - Idealmente, incluir links de áudio (MP3, WAV, etc.)

3. **Ferramentas úteis**:
   - Postman ou cURL para testar APIs
   - DevTools do navegador (F12)
   - Console do navegador para logs

---

## 📋 Checklist de Testes

### 🟢 Testes Básicos (Obrigatórios)

#### 1. Health Check
**Objetivo**: Verificar se o serviço está funcionando

```bash
# Método 1: Browser
http://localhost:3000/drive-qr/api/health

# Método 2: cURL
curl http://localhost:3000/drive-qr/api/health
```

**Resultado esperado**:
```json
{
  "status": "ok",
  "service": "Drive QR Scanner",
  "timestamp": "2025-10-16T...",
  "version": "1.0.0",
  "checks": {
    "api": "operational",
    "driveProxy": "operational",
    "extractTitle": "operational"
  }
}
```

- [ ] Status retorna "ok"
- [ ] Todos os checks estão "operational"
- [ ] Resposta é rápida (< 100ms)

---

#### 2. Upload de QR Code
**Objetivo**: Testar upload e leitura de QR code

**Passos**:
1. Abrir http://localhost:3000/drive-qr
2. Arrastar imagem com QR code para área de upload
3. Aguardar processamento

**Resultado esperado**:
- [ ] Toast de "Processando..." aparece
- [ ] QR code é lido corretamente
- [ ] Link do Google Drive é detectado
- [ ] Título é extraído (não é "Arquivo (ID...)")
- [ ] Card de resultado aparece com sucesso

---

#### 3. Reprodução de Áudio
**Objetivo**: Testar streaming de áudio

**Pré-requisito**: QR code apontando para arquivo de áudio no Google Drive

**Passos**:
1. Upload de QR code com link de áudio
2. Verificar se player de áudio aparece
3. Clicar em Play
4. Arrastar barra de progresso (seek)

**Resultado esperado**:
- [ ] Player de áudio é exibido
- [ ] Áudio começa a tocar ao clicar Play
- [ ] Seek funciona (pode pular para qualquer parte)
- [ ] Link alternativo de download funciona
- [ ] Console não mostra erros CORS

---

#### 4. Múltiplos QR Codes
**Objetivo**: Testar processamento em lote

**Passos**:
1. Selecionar 3-5 imagens com QR codes
2. Fazer upload de todas simultaneamente
3. Aguardar processamento

**Resultado esperado**:
- [ ] Todos os QR codes são processados
- [ ] Contadores de sucesso/erro estão corretos
- [ ] Cada resultado aparece em um card separado
- [ ] Não há travamentos ou erros

---

### 🟡 Testes Intermediários

#### 5. Extração de Título via API
**Objetivo**: Testar endpoint individual

```bash
curl -X POST http://localhost:3000/drive-qr/api/drive/extract-title \
  -H "Content-Type: application/json" \
  -d '{"url": "https://drive.google.com/file/d/SEU_FILE_ID/view"}'
```

**Resultado esperado**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "fileId": "SEU_FILE_ID",
    "title": "Nome Real do Arquivo.mp3",
    "method": "nodejs-scraping",
    "audio": {
      "isAudio": true,
      "proxyPath": "/drive-qr/api/drive/audio/SEU_FILE_ID",
      "downloadUrl": "https://drive.usercontent.google.com/...",
      "mimeType": "audio/mpeg"
    }
  }
}
```

- [ ] Título é extraído corretamente
- [ ] FileId está presente
- [ ] Method é "nodejs-scraping"
- [ ] Audio info está completo se for áudio

---

#### 6. Batch Processing via API
**Objetivo**: Testar endpoint de lote

```bash
curl -X POST http://localhost:3000/drive-qr/api/drive/extract-titles \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://drive.google.com/file/d/FILE_ID_1/view",
      "https://drive.google.com/file/d/FILE_ID_2/view"
    ]
  }'
```

**Resultado esperado**:
- [ ] Array de resultados com mesmo tamanho do input
- [ ] Cada item tem estrutura correta
- [ ] Erros individuais não quebram o lote
- [ ] Performance é rápida (paralelo, não sequencial)

---

#### 7. Streaming de Áudio Direto
**Objetivo**: Testar proxy de áudio diretamente

```bash
# Teste simples
curl -I http://localhost:3000/drive-qr/api/drive/audio/SEU_FILE_ID

# Teste com Range
curl -H "Range: bytes=0-1023" \
  http://localhost:3000/drive-qr/api/drive/audio/SEU_FILE_ID \
  --output teste.mp3
```

**Resultado esperado**:
- [ ] Headers incluem `Accept-Ranges: bytes`
- [ ] Headers incluem `Access-Control-Allow-Origin: *`
- [ ] Content-Type está correto (audio/mpeg, etc.)
- [ ] Range request retorna status 206
- [ ] Áudio é reproduzível

---

### 🔴 Testes de Erro (Edge Cases)

#### 8. QR Code Inválido
**Objetivo**: Testar tratamento de erros

**Cenários**:
1. Imagem sem QR code
2. QR code com link que não é Google Drive
3. Link do Drive sem permissão pública

**Resultado esperado**:
- [ ] Mensagem de erro clara é exibida
- [ ] Card de erro tem estilo vermelho
- [ ] Não trava o processamento de outros QR codes
- [ ] Contador de erros é incrementado

---

#### 9. Link do Google Drive Inválido
**Objetivo**: Testar fallback de título

```bash
curl -X POST http://localhost:3000/drive-qr/api/drive/extract-title \
  -H "Content-Type: application/json" \
  -d '{"url": "https://drive.google.com/file/d/ID_INVALIDO/view"}'
```

**Resultado esperado**:
- [ ] Não retorna erro 500
- [ ] Título é "Arquivo do Google Drive (ID...)"
- [ ] Method é "fallback"
- [ ] success: false (mas não quebra)

---

#### 10. Validação de Input
**Objetivo**: Testar validação Zod

**Cenários**:

```bash
# URL inválida
curl -X POST http://localhost:3000/drive-qr/api/drive/extract-title \
  -H "Content-Type: application/json" \
  -d '{"url": "not-a-url"}'

# Sem URL
curl -X POST http://localhost:3000/drive-qr/api/drive/extract-title \
  -H "Content-Type: application/json" \
  -d '{}'

# Array vazio (batch)
curl -X POST http://localhost:3000/drive-qr/api/drive/extract-titles \
  -H "Content-Type: application/json" \
  -d '{"urls": []}'
```

**Resultado esperado**:
- [ ] Retorna status 400
- [ ] Mensagem de erro clara
- [ ] Não quebra o servidor

---

## 🎯 Testes de Performance

#### 11. Múltiplas URLs (Batch)
**Objetivo**: Testar limite de 50 URLs

```bash
# Gerar array com 50 URLs
# Verificar que todas são processadas
# Tempo de resposta < 30 segundos
```

**Resultado esperado**:
- [ ] 50 URLs são processadas
- [ ] Nenhuma é perdida
- [ ] Tempo razoável (< 30s)

---

#### 12. Cache de Áudio
**Objetivo**: Verificar que cache funciona

**Passos**:
1. Reproduzir áudio pela primeira vez (nota o tempo)
2. Reproduzir novamente (deve ser instantâneo do cache)
3. Verificar header `Cache-Control: public, max-age=3600`

**Resultado esperado**:
- [ ] Segunda reprodução é instantânea
- [ ] Headers de cache estão corretos

---

## 📱 Testes de Responsividade

#### 13. Mobile
**Objetivo**: Testar em dispositivos móveis

**Passos**:
1. Abrir DevTools (F12)
2. Ativar modo mobile (Ctrl+Shift+M)
3. Testar com iPhone/Android simulado

**Resultado esperado**:
- [ ] Interface se adapta ao mobile
- [ ] Botões são clicáveis
- [ ] Upload funciona
- [ ] Player de áudio funciona

---

## ♿ Testes de Acessibilidade

#### 14. Navegação por Teclado
**Objetivo**: Testar acessibilidade

**Passos**:
1. Usar apenas Tab para navegar
2. Pressionar Enter para selecionar arquivo
3. Usar Space no player de áudio

**Resultado esperado**:
- [ ] Todos os elementos são alcançáveis por Tab
- [ ] Ordem de foco faz sentido
- [ ] Player de áudio funciona com teclado

---

## 🐛 Debug e Troubleshooting

### Console do Navegador
```javascript
// Verificar se há erros
console.error

// Verificar requests CORS
// Network tab > Filtrar por "drive-qr"
```

### Logs do Servidor
```bash
# Verificar logs no terminal onde npm run dev está rodando
# Procurar por erros relacionados a "drive-qr"
```

### Ferramentas Úteis
- **React DevTools**: Ver estado do context
- **Network Tab**: Verificar requests e responses
- **Console Tab**: Ver logs e erros
- **Application Tab**: Ver cache e storage

---

## 📊 Relatório de Testes

### Template de Relatório

```markdown
## Relatório de Testes - Drive QR Scanner

**Data**: ____/____/______
**Testador**: ________________
**Ambiente**: [ ] Local [ ] Staging [ ] Production

### Resumo
- Total de testes: ____ / ____
- Sucessos: ____
- Falhas: ____
- Bloqueadores: ____

### Testes Básicos
- [ ] Health Check
- [ ] Upload de QR Code
- [ ] Reprodução de Áudio
- [ ] Múltiplos QR Codes

### Testes Intermediários
- [ ] Extração de Título via API
- [ ] Batch Processing via API
- [ ] Streaming de Áudio Direto

### Testes de Erro
- [ ] QR Code Inválido
- [ ] Link Inválido
- [ ] Validação de Input

### Observações
_Descrever bugs encontrados, sugestões de melhoria, etc._

### Bugs Encontrados
1. [ ] Bug #1: ...
2. [ ] Bug #2: ...

### Status Final
[ ] Aprovado para produção
[ ] Necessita correções
[ ] Bloqueado
```

---

## ✅ Critérios de Aceitação

Para considerar o módulo **pronto para produção**:

- ✅ Todos os testes básicos passam
- ✅ Pelo menos 80% dos testes intermediários passam
- ✅ Testes de erro não causam crashes
- ✅ Performance é aceitável (< 30s para batch de 50)
- ✅ Não há erros no console em uso normal
- ✅ Funciona em Chrome, Firefox e Safari
- ✅ Funciona em mobile
- ✅ Acessibilidade básica funciona

---

## 🎓 Dicas de Teste

1. **Use QR codes reais**: Gere QR codes com links reais do Google Drive
2. **Teste com permissões**: Teste links públicos e privados
3. **Varie os formatos**: MP3, WAV, M4A, etc.
4. **Teste offline**: Veja como o app se comporta sem internet
5. **Teste com arquivos grandes**: Áudios > 10MB
6. **Monitore a rede**: Use DevTools para ver requisições
7. **Limpe o cache**: Teste com cache limpo periodicamente

---

## 📞 Suporte

**Dúvidas?** Consultar:
1. `app/drive-qr/README.md` - Documentação técnica
2. `docs/drive-qr-implementacao-resumo.md` - Resumo da implementação
3. Console do servidor - Logs em tempo real

---

**Boa sorte com os testes! 🚀**
