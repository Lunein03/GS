'use client';

import { useMemo } from 'react';
import { CheckCircle2, Info, XCircle, ScanQrCode } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useDriveQrContext } from '../hooks/use-drive-qr-context';
import { QRCodeResults } from './qr-code-results';
import { QRCodeUploader } from './qr-code-uploader';

export function DriveQrContent() {
  const { results, isProcessing, handleProcessFiles, handleClearResults } = useDriveQrContext();

  const summary = useMemo(() => {
    const successes = results.filter((item) => item.status === 'success').length;
    const errors = results.filter((item) => item.status === 'error').length;
    return { successes, errors };
  }, [results]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Drive QR Scanner</h1>
        <p className="text-sm text-muted-foreground sm:text-base">Processamento em lote de QR codes com extração inteligente</p>
      </header>

      {/* Área de upload */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
              Fluxo unificado
            </div>
            <h2 className="text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
              Envie suas imagens de QR code
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Arraste arquivos para a área ao lado ou utilize o botão para selecionar manualmente. Nós cuidamos da leitura do QR code, validamos o link e extraímos o título direto do Google Drive.
            </p>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                Processamento local rápido e seguro
              </p>
              <p className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
                Identificamos links inválidos automaticamente
              </p>
            </div>
          </div>
          <div className="lg:pl-6">
            <QRCodeUploader isProcessing={isProcessing} onFilesSelect={handleProcessFiles} />
          </div>
        </div>
      </div>

      {/* Resumo estatístico */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SummaryBadge icon={CheckCircle2} variant="success" label="Válidos" value={summary.successes} />
          <SummaryBadge icon={XCircle} variant="error" label="Erros" value={summary.errors} />
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Processamos vários QR codes em paralelo sem limitar sua fila de uploads.
        </p>
      </div>

      {/* Resultados */}
      {results.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-foreground sm:text-2xl">Resultados</h3>
              <p className="text-sm text-muted-foreground">
                {results.length} imagem(s) processada(s) • {summary.successes} sucesso(s) • {summary.errors} erro(s)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearResults}
              className="w-full sm:w-auto"
            >
              Limpar resultados
            </Button>
          </div>
          <QRCodeResults results={results} />
        </div>
      ) : (
        <Card className="rounded-2xl border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground sm:text-2xl">
              Nenhum QR code processado por enquanto
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Assim que os arquivos forem analisados, exibiremos os links, títulos detectados e prévias em áudio por aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground sm:text-base">
            <p>
              Utilize o painel acima para adicionar suas imagens. Nós cuidaremos imediatamente da leitura e indicaremos qualquer problema encontrado.
            </p>
            <p className="text-xs text-muted-foreground/80">
              Dica: mantenha seus QR codes nítidos. Imagens desfocadas, escuras ou com reflexo podem prejudicar a leitura.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface SummaryBadgeProps {
  icon: typeof CheckCircle2;
  label: string;
  value: number;
  variant: 'success' | 'error';
}

function SummaryBadge({ icon: Icon, label, value, variant }: SummaryBadgeProps) {
  const isSuccess = variant === 'success';
  const baseClasses = isSuccess
    ? 'bg-gradient-to-r from-emerald-500/80 to-emerald-400/70 text-emerald-50'
    : 'bg-gradient-to-r from-rose-500/80 to-rose-400/70 text-rose-50';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${baseClasses}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Quantidade de {label}</span>
      <span>{value}</span>
      <span>{label}</span>
    </span>
  );
}
