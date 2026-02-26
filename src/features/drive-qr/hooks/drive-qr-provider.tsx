'use client';

import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { useToast } from '@/shared/ui/use-toast';
import { generateId } from '@/shared/lib/utils';

import { fetchDriveMetadata } from './lib/drive-client';
import { detectAudioByNameOrUrl, scanQrCode } from './lib/qr-processor';
import type { DriveQrResult } from '../domain/types';

export const DriveQrContext = createContext<DriveQrContextValue | undefined>(undefined);

export function DriveQrProvider({ children }: DriveQrProviderProps) {
  const [results, setResults] = useState<DriveQrResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const objectUrlRegistry = useRef(new Map<string, string>());

  const updateResult = useCallback((resultId: string, patch: Partial<DriveQrResult>) => {
    setResults((previous) => previous.map((item) => (item.id === resultId ? { ...item, ...patch } : item)));
  }, []);

  const registerObjectUrl = useCallback((resultId: string, url: string) => {
    objectUrlRegistry.current.set(resultId, url);
  }, []);

  const revokeObjectUrls = useCallback((resultIds?: string[]) => {
    const registry = objectUrlRegistry.current;
    const ids = resultIds ?? Array.from(registry.keys());
    ids.forEach((id) => {
      const url = registry.get(id);
      if (url) {
        URL.revokeObjectURL(url);
        registry.delete(id);
      }
    });
  }, []);

  const handleProcessFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) {
        return;
      }

      setIsProcessing(true);
      toast({
        title: 'Processando QR codes',
        description: `Iniciando análise de ${files.length} arquivo(s).`,
      });

      let successCount = 0;
      let errorCount = 0;

      for (const file of files) {
        const resultId = generateId();
        const imageUrl = URL.createObjectURL(file);
        registerObjectUrl(resultId, imageUrl);

        const baseResult: DriveQrResult = {
          id: resultId,
          fileName: file.name,
          status: 'processing',
          imageUrl,
          processedAt: new Date().toISOString(),
        };

        setResults((previous) => [...previous, baseResult]);

        try {
          const qrContent = await scanQrCode(file);

          if (!qrContent) {
            errorCount += 1;
            updateResult(resultId, {
              status: 'error',
              errorMessage: 'Não foi possível ler o QR code desta imagem.',
            });
            continue;
          }

          const isValidUrl = /^https?:\/\//i.test(qrContent);
          if (!isValidUrl) {
            errorCount += 1;
            updateResult(resultId, {
              status: 'error',
              link: qrContent,
              errorMessage: 'O QR code não contém uma URL válida.',
            });
            continue;
          }

          try {
            const timeoutSignal = createTimeoutSignal(10000);
            const metadata = await fetchDriveMetadata(qrContent, timeoutSignal);
            const isAudio = metadata.audio.isAudio || detectAudioByNameOrUrl(file.name, qrContent);
            const audioSource = metadata.audio.proxyPath ?? metadata.audio.downloadUrl ?? null;

            successCount += 1;
            updateResult(resultId, {
              status: 'success',
              link: qrContent,
              title: metadata.title,
              extractionMethod: metadata.method,
              fileId: metadata.fileId,
              audio: isAudio && audioSource
                ? {
                    url: audioSource,
                    type: metadata.audio.mimeType ?? 'audio/mpeg',
                    durationSeconds: null,
                    downloadUrl: metadata.audio.downloadUrl,
                  }
                : null,
            });
          } catch (driveError) {
            errorCount += 1;
            updateResult(resultId, {
              status: 'error',
              link: qrContent,
              errorMessage:
                driveError instanceof Error
                  ? driveError.message
                  : 'Erro inesperado ao consultar o Google Drive.',
            });
          }
        } catch (error) {
          errorCount += 1;
          updateResult(resultId, {
            status: 'error',
            errorMessage: 'Erro inesperado ao processar o arquivo de imagem.',
          });
        }
      }

      setIsProcessing(false);

      toast({
        title: 'Processamento concluído',
        description: `${successCount} sucesso(s) • ${errorCount} erro(s)`,
      });
    },
    [registerObjectUrl, toast, updateResult]
  );

  const handleClearResults = useCallback(() => {
    revokeObjectUrls();
    setResults([]);
  }, [revokeObjectUrls]);

  const value = useMemo<DriveQrContextValue>(
    () => ({
      results,
      isProcessing,
      handleProcessFiles,
      handleClearResults,
    }),
    [handleClearResults, handleProcessFiles, isProcessing, results]
  );

  return <DriveQrContext.Provider value={value}>{children}</DriveQrContext.Provider>;
}

interface DriveQrProviderProps {
  children: ReactNode;
}

export interface DriveQrContextValue {
  results: DriveQrResult[];
  isProcessing: boolean;
  handleProcessFiles: (files: File[]) => Promise<void>;
  handleClearResults: () => void;
}

function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal) {
    try {
      return AbortSignal.timeout(timeoutMs);
    } catch {
      // ignora e usa fallback
    }
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}


