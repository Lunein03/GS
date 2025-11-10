'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { categoryFormSchema, type Category } from '../types/item.types';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../actions/category-actions';
import type { z } from 'zod';

interface CategoriesDialogProps {
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoriesChange: () => void;
}

type CategoryFormData = z.infer<typeof categoryFormSchema>;

export function CategoriesDialog({
  categories,
  open,
  onOpenChange,
  onCategoriesChange,
}: CategoriesDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      color: '#3B82F6',
    },
  });

  // Iniciar edição de categoria
  function handleEdit(category: Category) {
    setEditingId(category.id);
    form.reset({
      name: category.name,
      color: category.color,
    });
  }

  // Cancelar edição
  function handleCancelEdit() {
    setEditingId(null);
    form.reset({
      name: '',
      color: '#3B82F6',
    });
  }

  // Submeter formulário (criar ou editar)
  async function onSubmit(data: CategoryFormData) {
    setIsSubmitting(true);

    try {
      // Verificar se o nome já existe (validação client-side)
      const nameExists = categories.some(
        (cat) =>
          cat.name.toLowerCase() === data.name.toLowerCase() &&
          cat.id !== editingId
      );

      if (nameExists) {
        toast.error('Já existe uma categoria com este nome');
        setIsSubmitting(false);
        return;
      }

      const result = editingId
        ? await updateCategory(editingId, data)
        : await createCategory(data);

      if (result.success) {
        toast.success(
          editingId
            ? 'Categoria atualizada com sucesso!'
            : 'Categoria criada com sucesso!'
        );
        form.reset({
          name: '',
          color: '#3B82F6',
        });
        setEditingId(null);
        onCategoriesChange();
      } else {
        toast.error(result.error.message);
      }
    } catch (error) {
      toast.error('Erro ao salvar categoria. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Confirmar deleção
  function handleDeleteClick(categoryId: string) {
    setDeletingId(categoryId);
    setShowDeleteDialog(true);
  }

  // Executar deleção
  async function handleDeleteConfirm() {
    if (!deletingId) return;

    setIsSubmitting(true);

    try {
      const result = await deleteCategory(deletingId);

      if (result.success) {
        toast.success('Categoria deletada com sucesso!');
        setShowDeleteDialog(false);
        setDeletingId(null);
        onCategoriesChange();
      } else {
        toast.error(result.error.message);
      }
    } catch (error) {
      toast.error('Erro ao deletar categoria. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const deletingCategory = categories.find((cat) => cat.id === deletingId);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Gerenciar Categorias</DialogTitle>
            <DialogDescription>
              Crie, edite ou remova categorias para organizar seus itens.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Formulário de criação/edição */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nome da Categoria
                    {editingId && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (editando)
                      </span>
                    )}
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Interpretação"
                    {...form.register('name')}
                    disabled={isSubmitting}
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Cor</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="color"
                      type="color"
                      {...form.register('color')}
                      disabled={isSubmitting}
                      className="w-20 h-10 cursor-pointer"
                    />
                    <Badge
                      style={{
                        backgroundColor: form.watch('color'),
                        color: '#ffffff',
                      }}
                    >
                      Preview
                    </Badge>
                  </div>
                  {form.formState.errors.color && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.color.message}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                      title="Cancelar edição"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[100px]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingId ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Salvar
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <Separator />

            {/* Lista de categorias */}
            <div className="space-y-2">
              <Label>Categorias Existentes ({categories.length})</Label>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                {categories.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Nenhuma categoria cadastrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          editingId === category.id
                            ? 'bg-accent border-primary'
                            : 'hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            style={{
                              backgroundColor: category.color,
                              color: '#ffffff',
                            }}
                          >
                            {category.name}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {category.color}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                            disabled={isSubmitting}
                            title="Editar categoria"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(category.id)}
                            disabled={isSubmitting}
                            title="Deletar categoria"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmação de deleção */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Deleção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar a categoria{' '}
              <strong>{deletingCategory?.name}</strong>?
              {deletingCategory && (
                <div className="mt-2">
                  <Badge
                    style={{
                      backgroundColor: deletingCategory.color,
                      color: '#ffffff',
                    }}
                  >
                    {deletingCategory.name}
                  </Badge>
                </div>
              )}
              <p className="mt-2 text-sm">
                Esta ação não pode ser desfeita. Se a categoria estiver sendo
                utilizada por itens, a deleção será bloqueada.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
