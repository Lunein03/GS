'use client';

import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { RichTextEditor } from './rich-text-editor';
import { noteFormSchema, type Note, type NoteFormSchema } from '../types';

const DESCRIPTION_LIMIT = 2000;

const inclusionModeLabels: Record<NoteFormSchema['inclusionMode'], string> = {
  manual: 'Manual',
  automatic: 'Automatica',
};

type NoteFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  note?: Note | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: NoteFormSchema) => Promise<void> | void;
};

export function NoteFormDialog({
  open,
  mode,
  note,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: NoteFormDialogProps) {
  const form = useForm<NoteFormSchema>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      name: '',
      description: '',
      inclusionMode: 'manual',
    },
  });

  useEffect(() => {
    if (note) {
      form.reset({
        name: note.name,
        description: note.description ?? '',
        inclusionMode: note.inclusionMode,
      });
      return;
    }

    form.reset({
      name: '',
      description: '',
      inclusionMode: 'manual',
    });
  }, [note, form]);

  useEffect(() => {
    if (!open) {
      form.reset({
        name: note?.name ?? '',
        description: note?.description ?? '',
        inclusionMode: note?.inclusionMode ?? 'manual',
      });
    }
  }, [open, note, form]);

  const plainDescriptionLength = useMemo(() => {
    const raw = form.watch('description');
    if (!raw) {
      return 0;
    }
    return raw.replace(/<[^>]*>/g, '').trim().length;
  }, [form]);

  const dialogTitle = mode === 'create' ? 'Cadastrar nota' : 'Editar nota';
  const submitLabel = mode === 'create' ? 'Salvar' : 'Atualizar';

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      name: data.name.trim(),
      description: data.description ?? '',
      inclusionMode: data.inclusionMode,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Configure notas padrao que poderam ser vinculadas as propostas comerciais.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="note-name" className="text-sm font-medium">
                  Nome
                </label>
                <Input
                  id="note-name"
                  placeholder="Ex.: Observacao de contrato"
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
                <label className="text-sm font-medium">Modo de inclusao</label>
                <Controller
                  control={form.control}
                  name="inclusionMode"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger aria-label="Modo de inclusao">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(inclusionModeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.inclusionMode && (
                  <p className="text-sm text-destructive" role="alert">
                    {form.formState.errors.inclusionMode.message}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-b from-indigo-500/90 to-indigo-400/90 p-6 text-white">
              <div className="font-medium tracking-wide uppercase text-xs">Notas</div>
              <p className="mt-3 text-sm text-white/90">
                Utilize notas para guardar clausulas, observacoes ou informacoes padrao das propostas.
                Defina o modo de inclusao para controlar se a nota aparece automaticamente ou sob demanda.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descricao</label>
            <Controller
              control={form.control}
              name="description"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                  placeholder="Descricao da nota..."
                />
              )}
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Utilize o editor para adicionar formatacao, listas e links.</span>
              <span>{plainDescriptionLength}/{DESCRIPTION_LIMIT}</span>
            </div>
            {form.formState.errors.description && (
              <p className="text-sm text-destructive" role="alert">
                {form.formState.errors.description.message}
              </p>
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

