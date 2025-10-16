'use client';

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { Upload, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export function QRCodeUploader({ isProcessing, onFilesSelect }: QRCodeUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);

  const handleOpenFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      handleOpenFileDialog();
    },
    [handleOpenFileDialog]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) {
        return;
      }

      const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length === 0) {
        toast({
          title: 'Selecione imagens válidas',
          description: 'Envie apenas arquivos de imagem contendo QR codes.',
          variant: 'destructive',
        });
        return;
      }

      void onFilesSelect(imageFiles);
    },
    [onFilesSelect, toast]
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handleFiles(event.target.files);
    },
    [handleFiles]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleOpenFileDialog();
      }
    },
    [handleOpenFileDialog]
  );

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-busy={isProcessing}
        aria-label="Área para envio de QR codes"
        onClick={handleOpenFileDialog}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative flex min-h-[230px] flex-col items-center justify-center gap-6 rounded-3xl border border-primary/50 bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02] px-6 py-12 text-center shadow-[0_25px_60px_-35px_rgba(79,70,229,0.75)] outline-none transition hover:border-primary/80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#050618]',
          isDragging && 'border-primary/80 bg-primary/20'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          multiple
          className="hidden"
          onChange={handleChange}
        />
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary-foreground shadow-[0_0_30px_-12px_rgba(99,102,241,1)]">
          {isProcessing ? <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" /> : <Upload className="h-7 w-7" aria-hidden="true" />}
        </span>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-white">Arraste e solte seus QR codes</p>
          <p className="text-sm text-slate-300">
            Suporta múltiplas imagens simultâneas. Clique ou pressione Enter para selecionar manualmente.
          </p>
        </div>
        <Button
          type="button"
          variant="default"
          className="mt-2 bg-gradient-to-r from-primary to-indigo-500 text-primary-foreground shadow-lg shadow-indigo-500/30 hover:from-primary/90 hover:to-indigo-500/90"
          onClick={handleButtonClick}
          disabled={isProcessing}
        >
          Escolher arquivos
        </Button>
      </div>
      <p className="text-xs text-slate-400">Formatos suportados: PNG, JPG, JPEG, WEBP.</p>
    </div>
  );
}

const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/jpg,image/webp,image/gif';

interface QRCodeUploaderProps {
  isProcessing: boolean;
  onFilesSelect: (files: File[]) => Promise<void>;
}
