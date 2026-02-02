'use client';

import Image from 'next/image';
import { AlertCircle, CheckCircle2, ExternalLink, HardDrive, Loader2, Volume2, XCircle } from 'lucide-react';

import { Badge } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';

import type { DriveQrResult } from '../../domain/types';
import { CustomAudioPlayer } from './custom-audio-player';

export function QRCodeResults({ results }: QRCodeResultsProps) {
  if (results.length === 0) {
    return null;
  }

  const isSingleResult = results.length === 1;

  return (
    <section 
      aria-live="polite" 
      aria-label="Lista de resultados" 
      className={isSingleResult ? 'space-y-5' : 'grid gap-5 lg:grid-cols-2'}
    >
      {results.map((result) => (
        <ResultCard key={result.id} result={result} />
      ))}
    </section>
  );
}

interface ResultCardProps {
  result: DriveQrResult;
}

function ResultCard({ result }: ResultCardProps) {
  const statusBadge = renderStatusBadge(result.status);

  return (
    <Card className="group flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-border/80 hover:shadow-lg">
      <div className="flex items-start gap-4">
        {result.imageUrl ? (
          <figure className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
            <Image
              src={result.imageUrl}
              alt={`QR code do arquivo ${result.fileName}`}
              width={80}
              height={80}
              className="h-full w-full object-cover"
              unoptimized
            />
          </figure>
        ) : null}
        
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start gap-3">
            <h3 className="min-w-0 flex-1 font-poppins text-lg font-medium text-foreground">{result.fileName}</h3>
            {statusBadge}
          </div>
          
          {result.title && result.title !== result.fileName ? (
            <div className="flex items-center gap-2 text-sm">
              <HardDrive className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="font-medium text-muted-foreground">Google Drive:</span>
              <span className="min-w-0 truncate text-foreground" title={result.title}>
                {result.title}
              </span>
            </div>
          ) : null}
          
          {result.link ? (
            <a
              href={result.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-medium transition-all hover:border-border/80 hover:bg-muted"
            >
              <ExternalLink className="h-4 w-4 flex-shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
              <span className="text-foreground">Abrir no Google Drive</span>
            </a>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>Nenhum link detectado</span>
            </div>
          )}
        </div>
      </div>

      {result.status === 'error' ? (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-4">
          <XCircle className="h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Erro no processamento</p>
            <p className="text-sm text-muted-foreground">{result.errorMessage ?? 'Não foi possível ler este QR code.'}</p>
          </div>
        </div>
      ) : null}

      {result.content ? (
        <div className="rounded-xl border border-border bg-muted/50 p-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Texto extraído</p>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground">{result.content}</p>
          </div>
        </div>
      ) : null}

      {result.audio ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 px-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Volume2 className="h-4 w-4 text-foreground" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Prévia em áudio</p>
              <p className="text-xs text-muted-foreground">Ouça o título extraído do Google Drive</p>
            </div>
          </div>
          <CustomAudioPlayer src={result.audio.url} title={result.title || result.fileName} />
        </div>
      ) : null}
    </Card>
  );
}

function renderStatusBadge(status: DriveQrResult['status']) {
  if (status === 'processing') {
    return (
      <Badge variant="outline" className="inline-flex items-center gap-1.5 text-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Processando
      </Badge>
    );
  }

  if (status === 'success') {
    return (
      <Badge className="inline-flex items-center gap-1.5 bg-foreground text-xs text-background">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Concluído
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="inline-flex items-center gap-1.5 border-rose-500/50 text-xs text-rose-600 dark:text-rose-400">
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      Erro
    </Badge>
  );
}

interface QRCodeResultsProps {
  results: DriveQrResult[];
}

