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
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  paymentModeFormSchema,
  type PaymentMode,
  type PaymentModeFormSchema,
} from '../types';

const DESCRIPTION_LIMIT = 1000;

type PaymentModeFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  paymentMode?: PaymentMode | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PaymentModeFormSchema) => Promise<void> | void;
};

function normalizeRate(value: number): number {
  return Number.isFinite(value) ? Number(value.toFixed(4)) : 0;
}

export function PaymentModeFormDialog({
  open,
  mode,
  paymentMode,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: PaymentModeFormDialogProps) {
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: '',
      installments: 1,
      interestRate: 0,
      adjustmentRate: 0,
      description: undefined,
    }),
    [],
  );

  const form = useForm<PaymentModeFormSchema>({
    resolver: zodResolver(paymentModeFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (paymentMode) {
      form.reset({
        name: paymentMode.name,
        installments: paymentMode.installments,
        interestRate: normalizeRate(paymentMode.interestRate),
        adjustmentRate: normalizeRate(paymentMode.adjustmentRate),
        description: paymentMode.description ?? undefined,
      });
      setIsOptionalOpen(Boolean(paymentMode.description));
      return;
    }

    form.reset(defaultValues);
    setIsOptionalOpen(false);
  }, [paymentMode, form, defaultValues]);

  useEffect(() => {
    if (!open) {
      form.reset(paymentMode ? {
        name: paymentMode.name,
        installments: paymentMode.installments,
        interestRate: normalizeRate(paymentMode.interestRate),
        adjustmentRate: normalizeRate(paymentMode.adjustmentRate),
        description: paymentMode.description ?? undefined,
      } : defaultValues);
    }
  }, [open, form, paymentMode, defaultValues]);

  const descriptionValue = form.watch('description') ?? '';

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      name: data.name.trim(),
      installments: Number(data.installments),
      interestRate: normalizeRate(data.interestRate),
      adjustmentRate: normalizeRate(data.adjustmentRate),
      description: data.description?.trim() || undefined,
    });
  });

  const dialogTitle = mode === 'create' ? 'Cadastrar modo de pagamento' : 'Editar modo de pagamento';
  const submitLabel = mode === 'create' ? 'Salvar' : 'Atualizar';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Defina a quantidade de prestacoes, taxas e descricao opcional para o modo de pagamento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="payment-mode-name" className="text-sm font-medium">
                  Nome
                </label>
                <Input
                  id="payment-mode-name"
                  placeholder="Ex.: Cartao parcelado"
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label htmlFor="payment-mode-installments" className="text-sm font-medium">
                    Prestacoes
                  </label>
                  <Input
                    id="payment-mode-installments"
                    type="number"
                    min={1}
                    max={120}
                    step={1}
                    disabled={isSubmitting}
                    {...form.register('installments', { valueAsNumber: true })}
                    aria-invalid={Boolean(form.formState.errors.installments)}
                  />
                  {form.formState.errors.installments && (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.installments.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="payment-mode-interest" className="text-sm font-medium">
                    Taxa de juros (%)
                  </label>
                  <Input
                    id="payment-mode-interest"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    disabled={isSubmitting}
                    {...form.register('interestRate', { valueAsNumber: true })}
                    aria-invalid={Boolean(form.formState.errors.interestRate)}
                  />
                  {form.formState.errors.interestRate && (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.interestRate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="payment-mode-adjustment" className="text-sm font-medium">
                    Ajuste (%)
                  </label>
                  <Input
                    id="payment-mode-adjustment"
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    disabled={isSubmitting}
                    {...form.register('adjustmentRate', { valueAsNumber: true })}
                    aria-invalid={Boolean(form.formState.errors.adjustmentRate)}
                  />
                  {form.formState.errors.adjustmentRate && (
                    <p className="text-sm text-destructive" role="alert">
                      {form.formState.errors.adjustmentRate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-b from-amber-500/90 to-orange-500/90 p-6 text-white">
              <div className="text-xs font-semibold uppercase tracking-wide">Pagamentos</div>
              <p className="mt-3 text-sm text-white/90">
                Configure as condicoes comerciais utilizados nas propostas. Ajuste taxas conforme politica financeira.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => setIsOptionalOpen((prev) => !prev)}
            >
              {isOptionalOpen ? '- Opcional' : '+ Opcional'}
            </button>

            {isOptionalOpen && (
              <div className="space-y-2">
                <label htmlFor="payment-mode-description" className="text-sm font-medium">
                  Descricao
                </label>
                <Textarea
                  id="payment-mode-description"
                  placeholder="Detalhes sobre este modo de pagamento"
                  maxLength={DESCRIPTION_LIMIT}
                  rows={5}
                  disabled={isSubmitting}
                  {...form.register('description')}
                  aria-invalid={Boolean(form.formState.errors.description)}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Explique quando utilizar esta condicao de pagamento.</span>
                  <span>
                    {(descriptionValue?.length ?? 0)}/{DESCRIPTION_LIMIT}
                  </span>
                </div>
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
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
