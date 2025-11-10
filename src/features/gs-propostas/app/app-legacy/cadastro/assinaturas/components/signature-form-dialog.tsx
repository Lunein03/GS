'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import type { Signature, SignatureFormSchema, SignatureType } from '../types';
import { signatureFormSchema } from '../types';
import { SignatureDrawPad } from './signature-draw-pad';

const MAX_FILE_SIZE = 500 * 1024; // 500 KB

const SIGNATURE_WIDTH = 600;
const SIGNATURE_HEIGHT = 200;

type SignatureFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  signature?: Signature | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SignatureFormSchema) => Promise<void> | void;
};

type SignatureSource = 'draw' | 'upload';

type SignatureMeta = {
  dataUrl: string;
  mime: string;
  width: number;
  height: number;
};

function extractMime(dataUrl: string): string {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,/);
  return match ? match[1] : 'image/png';
}

async function fileToDataUrl(file: File): Promise<SignatureMeta> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Arquivo excede o limite de 500KB.');
  }

  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Nao foi possivel ler o arquivo selecionado.'));
    };
    reader.onerror = () => reject(new Error('Falha ao carregar a imagem selecionada.'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Nao foi possivel processar a imagem.'));
    img.src = dataUrl;
  });

  return {
    dataUrl,
    mime: extractMime(dataUrl),
    width: image.width,
    height: image.height,
  };
}

export function SignatureFormDialog({
  open,
  mode,
  signature,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: SignatureFormDialogProps) {
  const defaultValues = useMemo<SignatureFormSchema>(
    () => ({
      name: '',
      cpf: '',
      email: '',
      phone: '',
      signatureType: 'govbr' satisfies SignatureType,
      govbrIdentifier: '',
      signatureImageData: undefined,
      signatureImageMime: undefined,
      signatureImageWidth: undefined,
      signatureImageHeight: undefined,
    }),
    [],
  );

  const [signatureSource, setSignatureSource] = useState<SignatureSource>('draw');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<SignatureFormSchema>({
    resolver: zodResolver(signatureFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (signature) {
      const type = signature.signatureType;
      setSignatureSource(signature.signatureImage ? 'draw' : 'upload');
      form.reset({
        name: signature.name,
        cpf: signature.cpf,
        email: signature.email,
        phone: signature.phone,
        signatureType: type,
        govbrIdentifier: signature.govbrIdentifier ?? '',
        signatureImageData: signature.signatureImage ?? undefined,
        signatureImageMime: signature.signatureImageMime ?? undefined,
        signatureImageWidth: signature.signatureImageWidth ?? SIGNATURE_WIDTH,
        signatureImageHeight: signature.signatureImageHeight ?? SIGNATURE_HEIGHT,
      });
      setErrorMessage(null);
      return;
    }

    form.reset(defaultValues);
    setSignatureSource('draw');
    setErrorMessage(null);
  }, [signature, form, defaultValues]);

  useEffect(() => {
    if (!open) {
      form.reset(signature ? {
        name: signature.name,
        cpf: signature.cpf,
        email: signature.email,
        phone: signature.phone,
        signatureType: signature.signatureType,
        govbrIdentifier: signature.govbrIdentifier ?? '',
        signatureImageData: signature.signatureImage ?? undefined,
        signatureImageMime: signature.signatureImageMime ?? undefined,
        signatureImageWidth: signature.signatureImageWidth ?? SIGNATURE_WIDTH,
        signatureImageHeight: signature.signatureImageHeight ?? SIGNATURE_HEIGHT,
      } : defaultValues);
      setErrorMessage(null);
    }
  }, [open, form, signature, defaultValues]);

  const signatureType = form.watch('signatureType');
  const signatureImageData = form.watch('signatureImageData');
  const signatureImageWidth = form.watch('signatureImageWidth');
  const signatureImageHeight = form.watch('signatureImageHeight');

  const handleSignatureChange = (meta: SignatureMeta | null) => {
    if (!meta) {
      form.setValue('signatureImageData', undefined, { shouldValidate: true });
      form.setValue('signatureImageMime', undefined, { shouldValidate: false });
      form.setValue('signatureImageWidth', undefined, { shouldValidate: false });
      form.setValue('signatureImageHeight', undefined, { shouldValidate: false });
      return;
    }

    form.setValue('signatureImageData', meta.dataUrl, { shouldValidate: true });
    form.setValue('signatureImageMime', meta.mime, { shouldValidate: false });
    form.setValue('signatureImageWidth', meta.width, { shouldValidate: false });
    form.setValue('signatureImageHeight', meta.height, { shouldValidate: false });
  };

  const handleDrawChange = (dataUrl: string | null, dimensions: { width: number; height: number }) => {
    if (!dataUrl) {
      handleSignatureChange(null);
      return;
    }

    handleSignatureChange({
      dataUrl,
      mime: extractMime(dataUrl),
      width: dimensions.width,
      height: dimensions.height,
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    try {
      setErrorMessage(null);
      const data = await fileToDataUrl(file);
      handleSignatureChange(data);
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : 'Nao foi possivel carregar o arquivo selecionado.');
      handleSignatureChange(null);
    }
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const trimmedGovbrIdentifier = data.govbrIdentifier?.trim();
    await onSubmit({
      name: data.name.trim(),
      cpf: data.cpf.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      signatureType: data.signatureType,
      govbrIdentifier: data.signatureType === 'govbr' ? trimmedGovbrIdentifier : undefined,
      signatureImageData: data.signatureType === 'custom' ? data.signatureImageData : undefined,
      signatureImageMime: data.signatureType === 'custom' ? data.signatureImageMime : undefined,
      signatureImageWidth: data.signatureType === 'custom' ? data.signatureImageWidth ?? SIGNATURE_WIDTH : undefined,
      signatureImageHeight: data.signatureType === 'custom' ? data.signatureImageHeight ?? SIGNATURE_HEIGHT : undefined,
    });
  });

  const dialogTitle = mode === 'create' ? 'Cadastrar assinatura' : 'Editar assinatura';
  const submitLabel = mode === 'create' ? 'Salvar' : 'Atualizar';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Cadastre assinaturas Gov.br ou personalizadas para utilizar nas propostas comerciais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signature-name">Nome</Label>
                <Input
                  id="signature-name"
                  placeholder="Nome completo"
                  disabled={isSubmitting}
                  {...form.register('name')}
                  aria-invalid={Boolean(form.formState.errors.name)}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="signature-cpf">CPF</Label>
                  <Input
                    id="signature-cpf"
                    placeholder="000.000.000-00"
                    disabled={isSubmitting}
                    {...form.register('cpf')}
                    aria-invalid={Boolean(form.formState.errors.cpf)}
                  />
                  {form.formState.errors.cpf && (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.cpf.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signature-phone">Telefone</Label>
                  <Input
                    id="signature-phone"
                    placeholder="(00) 00000-0000"
                    disabled={isSubmitting}
                    {...form.register('phone')}
                    aria-invalid={Boolean(form.formState.errors.phone)}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature-email">E-mail</Label>
                <Input
                  id="signature-email"
                  type="email"
                  placeholder="email@empresa.com"
                  disabled={isSubmitting}
                  {...form.register('email')}
                  aria-invalid={Boolean(form.formState.errors.email)}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Tipo de assinatura</Label>
                <RadioGroup
                  value={signatureType}
                  onValueChange={(value) => {
                    form.setValue('signatureType', value as SignatureType, { shouldValidate: true });
                    if (value === 'govbr') {
                      handleSignatureChange(null);
                    }
                  }}
                  className="grid gap-2 sm:grid-cols-2"
                >
                  <Label
                    htmlFor="signature-type-govbr"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm shadow-sm transition-colors hover:bg-muted/60"
                  >
                    <RadioGroupItem value="govbr" id="signature-type-govbr" disabled={isSubmitting} />
                    <div>
                      <div className="font-medium">Assinatura Gov.br</div>
                      <p className="text-xs text-muted-foreground">
                        Exige autenticacao no portal Gov.br. Mantem validade oficial para documentos.
                      </p>
                    </div>
                  </Label>

                  <Label
                    htmlFor="signature-type-custom"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm shadow-sm transition-colors hover:bg-muted/60"
                  >
                    <RadioGroupItem value="custom" id="signature-type-custom" disabled={isSubmitting} />
                    <div>
                      <div className="font-medium">Assinatura Personalizada</div>
                      <p className="text-xs text-muted-foreground">
                        Desenhe ou envie uma imagem da assinatura responsavel.
                      </p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-b from-indigo-600/90 to-indigo-500/90 p-6 text-white">
              <div className="text-xs font-medium uppercase tracking-wide">Assinaturas digitais</div>
              <p className="mt-3 text-sm text-white/90">
                Cadastre responsaveis com validacao Gov.br ou assinatura personalizada. Utilize-as em propostas e documentos emitidos pelo sistema.
              </p>
              <p className="mt-3 text-xs text-white/80">
                Assinaturas Gov.br exigem login no portal para validar a autenticidade. Assinaturas personalizadas ficam disponiveis imediatamente apos cadastro.
              </p>
            </div>
          </div>

          {signatureType === 'govbr' ? (
            <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
              <div className="space-y-2">
                <Label htmlFor="signature-govbr">Identificador Gov.br</Label>
                <Input
                  id="signature-govbr"
                  placeholder="CPF ou identificador utilizado no Gov.br"
                  disabled={isSubmitting}
                  {...form.register('govbrIdentifier')}
                  aria-invalid={Boolean(form.formState.errors.govbrIdentifier)}
                />
                {form.formState.errors.govbrIdentifier && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.govbrIdentifier.message}
                  </p>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Ao salvar, o responsavel devera acessar o portal Gov.br para concluir a autenticacao e liberar o uso da assinatura nos documentos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Button
                  type="button"
                  variant={signatureSource === 'draw' ? 'default' : 'outline'}
                  onClick={() => {
                    setSignatureSource('draw');
                    handleSignatureChange(
                      signatureImageData
                        ? {
                            dataUrl: signatureImageData,
                            mime: extractMime(signatureImageData),
                            width: signatureImageWidth ?? SIGNATURE_WIDTH,
                            height: signatureImageHeight ?? SIGNATURE_HEIGHT,
                          }
                        : null,
                    );
                  }}
                  disabled={isSubmitting}
                >
                  Desenhar assinatura
                </Button>
                <Button
                  type="button"
                  variant={signatureSource === 'upload' ? 'default' : 'outline'}
                  onClick={() => setSignatureSource('upload')}
                  disabled={isSubmitting}
                >
                  Enviar imagem
                </Button>
              </div>

              {signatureSource === 'upload' ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="signature-upload">Arquivo da assinatura (PNG ou JPG)</Label>
                    <Input
                      id="signature-upload"
                      type="file"
                      accept="image/png,image/jpeg"
                      disabled={isSubmitting}
                      onChange={handleFileChange}
                    />
                    <p className="text-xs text-muted-foreground">Tamanho maximo 500KB. Recomendado fundo transparente.</p>
                    {errorMessage && (
                      <p className="text-sm text-destructive" role="alert">
                        {errorMessage}
                      </p>
                    )}
                    {form.formState.errors.signatureImageData && (
                      <p className="text-sm text-destructive" role="alert">
                        {form.formState.errors.signatureImageData.message}
                      </p>
                    )}
                  </div>

                  {signatureImageData && (
                    <div className="space-y-2">
                      <Label>Visualizacao da assinatura</Label>
                      <div className="rounded-lg border bg-white p-4">
                        <img
                          src={signatureImageData}
                          alt="Visualizacao da assinatura enviada"
                          className="max-h-40 w-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Desenhe a assinatura</Label>
                  <SignatureDrawPad
                    initialImage={signatureImageData}
                    onChange={handleDrawChange}
                    disabled={isSubmitting}
                    width={signatureImageWidth ?? SIGNATURE_WIDTH}
                    height={signatureImageHeight ?? SIGNATURE_HEIGHT}
                  />
                  {form.formState.errors.signatureImageData && (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.signatureImageData.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Fechar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

