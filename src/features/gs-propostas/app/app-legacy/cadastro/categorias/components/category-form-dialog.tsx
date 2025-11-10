'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Button } from '@/shared/ui/button';
import { CategoryColorPicker, categoryColorOptions } from './category-color-picker';
import { categoryFormSchema, type Category, type CategoryFormSchema } from '../types';

const DESCRIPTION_LIMIT = 1000;

type CategoryFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  category?: Category | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CategoryFormSchema) => Promise<void> | void;
};

export function CategoryFormDialog({
  open,
  mode,
  category,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: CategoryFormDialogProps) {
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);

  const defaultColor = useMemo(() => categoryColorOptions[0], []);

  const form = useForm<CategoryFormSchema>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      color: defaultColor,
      description: undefined,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        color: category.color ?? defaultColor,
        description: category.description ?? undefined,
      });
      setIsOptionalOpen(Boolean(category.description));
      return;
    }

    form.reset({
      name: '',
      color: defaultColor,
      description: undefined,
    });
    setIsOptionalOpen(false);
  }, [category, defaultColor, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        name: category?.name ?? '',
        color: category?.color ?? defaultColor,
        description: category?.description ?? undefined,
      });
    }
  }, [open, category, defaultColor, form]);

  const description = form.watch('description') ?? '';

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      name: data.name.trim(),
      color: data.color.toUpperCase(),
      description: data.description?.trim() || undefined,
    });
  });

  const dialogTitle = mode === 'create' ? 'Cadastrar categoria' : 'Editar categoria';
  const submitLabel = mode === 'create' ? 'Salvar' : 'Atualizar';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Configure os detalhes da categoria que sera exibida para os itens comerciais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="category-name" className="text-sm font-medium">
                  Nome
                </label>
                <Input
                  id="category-name"
                  placeholder="Ex.: Interpretacao"
                  {...form.register('name')}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.name)}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Cor</span>
                <CategoryColorPicker
                  value={form.watch('color')}
                  onChange={(color) => form.setValue('color', color, { shouldValidate: true })}
                />
                {form.formState.errors.color && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.color.message}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-b from-blue-600/90 to-blue-500/90 p-6 text-white">
              <div className="font-medium tracking-wide uppercase text-xs">Categorias</div>
              <p className="mt-3 text-sm text-white/90">
                Use cores para identificar rapidamente os grupos de produtos e serviços.
                Categorias bem definidas facilitam a busca e a gestao dos itens.
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
                <label htmlFor="category-description" className="text-sm font-medium">
                  Descricao
                </label>
                <Textarea
                  id="category-description"
                  placeholder="Descricao da categoria..."
                  maxLength={DESCRIPTION_LIMIT}
                  rows={6}
                  {...form.register('description')}
                  disabled={isSubmitting}
                  aria-invalid={Boolean(form.formState.errors.description)}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Descreva como esta categoria sera utilizada.</span>
                  <span>
                    {(description?.length ?? 0)}/{DESCRIPTION_LIMIT}
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

