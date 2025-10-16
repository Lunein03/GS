'use client';

import Image from 'next/image';
import { AlertCircle, CheckCircle2, ExternalLink, FileImage, HardDrive, Loader2, Volume2, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import type { DriveQrResult } from '../types';

export function QRCodeResults({ results }: QRCodeResultsProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <section aria-live="polite" aria-label="Lista de resultados" className="space-y-5">
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
    <Card className="flex h-full flex-col gap-5 rounded-[28px] border border-white/5 bg-white/[0.04] p-6 shadow-[0_20px_70px_-40px_rgba(99,102,241,0.9)]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 items-start gap-4">
          {result.imageUrl ? (
            <figure className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <Image
                src={result.imageUrl}
                alt={`QR code do arquivo ${result.fileName}`}
                width={96}
                height={96}
                className="h-full w-full object-cover"
                unoptimized
              />
            </figure>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-lg font-semibold text-white">{result.fileName}</p>
                {result.title && result.title !== result.fileName ? (
                  <p className="flex items-center gap-2 text-sm text-slate-300">
                    <HardDrive className="h-4 w-4 text-indigo-300" aria-hidden="true" />
                    <span className="font-medium text-white">Google Drive</span>
                    <span className="truncate" title={result.title}>
                      {result.title}
                    </span>
                  </p>
                ) : null}
              </div>
              {statusBadge}
            </div>

            <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <FileImage className="h-4 w-4 text-indigo-300" aria-hidden="true" />
                <span className="truncate" title={result.fileName}>
                  {result.fileName}
                </span>
              </p>
              {result.link ? (
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="truncate max-w-[260px] sm:max-w-none">{result.link}</span>
                </a>
              ) : (
                <span className="text-xs text-slate-500">Nenhum link detectado</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {result.status === 'error' ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          <XCircle className="h-4 w-4" aria-hidden="true" />
          <span>{result.errorMessage ?? 'Não foi possível ler este QR code.'}</span>
        </div>
      ) : null}

      {result.content ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Texto extraído</p>
          <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-100">{result.content}</p>
        </div>
      ) : null}

      {result.audio ? (
        <div className="space-y-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-indigo-100">
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            <span>Prévia em áudio</span>
          </div>
          <audio controls preload="none" className="w-full" aria-label={`Prévia em áudio para ${result.fileName}`}>
            <source src={result.audio.url} type={result.audio.type ?? 'audio/mpeg'} />
            Seu navegador não suporta a reprodução de áudio.
          </audio>
        </div>
      ) : null}
    </Card>
  );
}

function renderStatusBadge(status: DriveQrResult['status']) {
  if (status === 'processing') {
    return (
      <Badge variant="outline" className="inline-flex items-center gap-1 text-xs">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Processando
      </Badge>
    );
  }

  if (status === 'success') {
    return (
      <Badge className="inline-flex items-center gap-1 bg-emerald-500/90 text-white">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Concluído
      </Badge>
    );
  }

  return (
    <Badge className="inline-flex items-center gap-1 bg-rose-500/80 text-rose-50">
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      Erro
    </Badge>
  );
}

interface QRCodeResultsProps {
  results: DriveQrResult[];
}
