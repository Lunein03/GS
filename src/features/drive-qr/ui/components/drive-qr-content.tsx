'use client';

import { useMemo } from 'react';
import { CheckCircle2, Info, XCircle, ScanQrCode } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import { useDriveQrContext } from '@/features/drive-qr/hooks/use-drive-qr-context';
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
    <div className="space-y-6 font-poppins">
      {/* Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          <ScanQrCode className="h-3.5 w-3.5" aria-hidden="true" />
          Scanner Integrado
        </div>
        <h1 className="font-poppins text-center text-3xl font-medium text-foreground sm:text-4xl">
          Drive QR Scanner
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Processamento em lote de QR codes com extração inteligente de títulos do Google Drive.
        </p>
      </header>

      {/* Upload area */}
      <section id="upload" className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="space-y-4">
            <h2 className="font-poppins text-xl font-medium text-foreground sm:text-2xl">
              Envie suas imagens de QR code
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Arraste arquivos para a área ao lado ou utilize o botão para selecionar manualmente. Nós cuidamos da leitura do QR code, validamos o link e extraímos o título direto do Google Drive.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>Processamento local rápido e seguro</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span>Identificação automática de links do Google Drive</span>
              </div>
            </div>
          </div>

          <div>
            <QRCodeUploader isProcessing={isProcessing} onFilesSelect={handleProcessFiles} />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section id="resumo" className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <CheckCircle2 className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-medium text-foreground">{summary.successes}</p>
              <p className="text-xs text-muted-foreground">Válidos</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <XCircle className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-medium text-foreground">{summary.errors}</p>
              <p className="text-xs text-muted-foreground">Erros</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <ScanQrCode className="h-5 w-5 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-medium text-foreground">{results.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section id="resultados" aria-live="polite">
        {results.length > 0 ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-poppins text-xl font-medium text-foreground">Resultados</h3>
                <p className="text-sm text-muted-foreground">
                  {results.length} processados • {summary.successes} válidos • {summary.errors} erros
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
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-12">
            <div className="mx-auto max-w-xl space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                <ScanQrCode className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h3 className="font-poppins text-lg font-medium text-foreground">Nenhum QR code processado ainda</h3>
                <p className="text-sm text-muted-foreground">
                  Assim que os arquivos forem analisados, exibiremos os links, títulos detectados e prévias em áudio por aqui.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/50 p-4 text-left">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Dica:</strong> Mantenha seus QR codes nítidos. Imagens desfocadas, escuras ou com reflexo podem prejudicar a leitura.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
