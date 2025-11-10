'use client';

import { useCallback, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent, type MouseEvent } from 'react';
import { QrCode, Loader2 } from 'lucide-react';

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
  'group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-5 rounded-2xl border-2 border-border bg-muted/30 px-8 py-12 text-center outline-none transition-all duration-200 hover:scale-[1.01] hover:border-foreground/30 hover:bg-muted/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        isDragging && 'scale-[1.02] border-solid border-foreground/40 bg-muted/70 shadow-lg',
        isProcessing && 'pointer-events-none opacity-60'
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
      
      {/* Efeito de glow quando dragging */}
      {isDragging && (
        <div className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-foreground/5 blur-xl" />
      )}
      
      {/* Ícone QR Code com animação */}
      <div className="relative">
        {/* Efeito de bounce no ícone quando dragging */}
        <div className={cn(
          'transition-transform duration-1500',
          isDragging && 'animate-bounce'
        )}>
          <div className={cn(
            'absolute -inset-4 rounded-full bg-foreground/10 blur-md transition-opacity duration-300',
            isDragging ? 'opacity-100' : 'opacity-0'
          )} />
          {isProcessing ? (
            <Loader2 className="relative h-20 w-20 animate-spin text-foreground drop-shadow-sm" aria-hidden="true" />
          ) : (
            <QrCode className={cn(
              'relative h-20 w-20 drop-shadow-sm transition-colors duration-300',
              isDragging ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
            )} aria-hidden="true" />
          )}
        </div>
      </div>
      
      {/* Textos */}
      <div className="space-y-2">
        <h3 className="font-inter text-xl font-semibold text-foreground md:text-2xl">
          {isDragging ? 'Solte os arquivos aqui' : 'Arraste e solte seus QR codes'}
        </h3>
        <p className="mx-auto max-w-md text-base text-muted-foreground md:text-lg">
          {isDragging ? (
            <span className="font-medium text-foreground">Solte para fazer upload</span>
          ) : (
            <>
              Drag & drop files here, or{' '}
              <span className="font-medium text-foreground">browse</span>
            </>
          )}
        </p>
        <p className="text-sm text-muted-foreground">
          Formatos: PNG, JPG, JPEG, WEBP
        </p>
      </div>
    </div>
  );
}

const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/jpg,image/webp,image/gif';

interface QRCodeUploaderProps {
  isProcessing: boolean;
  onFilesSelect: (files: File[]) => Promise<void>;
}
