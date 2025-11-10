'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Form } from '@/shared/ui/form';
import { Button } from '@/shared/ui/button';

import { itemFormSchema, type Item, type Category } from '../types/item.types';
import { createItem, updateItem } from '@/features/gs-propostas/api/items';
import { ItemFormTabs } from './item-form-tabs';
import type { z } from 'zod';

interface ItemFormDialogProps {
  item?: Item;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type ItemFormData = z.infer<typeof itemFormSchema>;

export function ItemFormDialog({
  item,
  categories,
  open,
  onOpenChange,
  onSuccess,
}: ItemFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!item;

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      type: 'product',
      categoryId: '',
      name: '',
      unit: 'unidade',
      defaultPrice: 0,
      sku: '',
      pn: '',
      description: '',
      features: '',
      images: [],
    },
  });

  // Preencher formulário quando estiver em modo de edição
  useEffect(() => {
    if (item && open) {
      form.reset({
        type: item.type,
        categoryId: item.categoryId,
        name: item.name,
        unit: item.unit,
        defaultPrice: item.defaultPrice,
        sku: item.sku || '',
        pn: item.pn || '',
        description: item.description || '',
        features: item.features || '',
        images: item.images || [],
      });
    } else if (!item && open) {
      // Resetar formulário quando abrir em modo de criação
      form.reset({
        type: 'product',
        categoryId: '',
        name: '',
        unit: 'unidade',
        defaultPrice: 0,
        sku: '',
        pn: '',
        description: '',
        features: '',
        images: [],
      });
    }
  }, [item, open, form]);

  async function onSubmit(data: ItemFormData) {
    setIsSubmitting(true);

    try {
      const result = isEditMode
        ? await updateItem(item.id, data)
        : await createItem(data);

      if (result.success) {
        toast.success(
          isEditMode ? 'Item atualizado com sucesso!' : 'Item criado com sucesso!'
        );
        onOpenChange(false);
        form.reset();
        onSuccess();
      } else {
        toast.error(result.error.message);
      }
    } catch (error) {
      toast.error('Erro ao salvar item. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Editar Item' : 'Criar Novo Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Atualize as informações do item abaixo.'
              : 'Preencha as informações do novo item abaixo.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Componente de abas do formulário */}
            <ItemFormTabs
              control={form.control}
              errors={form.formState.errors}
              categories={categories}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

