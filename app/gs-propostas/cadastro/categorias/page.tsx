'use client';

import { useEffect, useMemo, useState } from 'react';
import { Network, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { CategoryTable } from './components/category-table';
import { CategoryFormDialog } from './components/category-form-dialog';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useRefreshCategories,
  useUpdateCategory,
} from './hooks/use-categories';
import type { Category, CategoryFormSchema } from './types';

function formatDateTime(date?: Date) {
  if (!date) {
    return 'Sem atualizacao';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(date);
}

type FormMode = 'create' | 'edit';

export default function CategoriasPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(handler);
  }, [search]);

  const { data: categories = [], isLoading, isFetching } = useCategories({
    search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
  });

  const refreshCategories = useRefreshCategories();

  const selectedCategory = useMemo<Category | null>(() => {
    if (!selectedCategoryId) {
      return null;
    }
    return categories.find((category) => category.id === selectedCategoryId) ?? null;
  }, [categories, selectedCategoryId]);

  const createMutation = useCreateCategory({
    onSuccess: (category) => {
      toast.success('Categoria criada com sucesso');
      setFormOpen(false);
      setSelectedCategoryId(category.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useUpdateCategory({
    onSuccess: (category) => {
      toast.success('Categoria atualizada com sucesso');
      setFormOpen(false);
      setSelectedCategoryId(category.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useDeleteCategory({
    onSuccess: () => {
      toast.success('Categoria removida com sucesso');
      setDeleteDialogOpen(false);
      setSelectedCategoryId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitForm = async (data: CategoryFormSchema) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(data);
      return;
    }

    if (!selectedCategory) {
      toast.error('Selecione uma categoria para editar.');
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedCategory.id,
      ...data,
    });
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setSelectedCategoryId(category.id);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) {
      toast.error('Selecione uma categoria.');
      return;
    }

    await deleteMutation.mutateAsync({ id: selectedCategory.id });
  };

  const isProcessing =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const totalCategories = categories.length;
  const selectedCount = selectedCategory ? 1 : 0;
  const hasSelection = Boolean(selectedCategory);
  const lastUpdatedAt = useMemo(() => {
    if (categories.length === 0) {
      return undefined;
    }

    const timestamps = categories.map((category) => category.updatedAt.getTime());
    const latest = Math.max(...timestamps);
    return new Date(latest);
  }, [categories]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Network className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
            <p className="text-muted-foreground">
              Configure categorias para organizar itens comerciais e agilizar o cadastro.
            </p>
          </div>
        </div>

        <div className="w-full max-w-xs">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Procurar..."
            aria-label="Pesquisar categorias"
          />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total: {totalCategories}</span>
            <span aria-hidden="true">•</span>
            <span>{selectedCount} de {totalCategories} linha(s) selecionada(s)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await refreshCategories();
                toast.info('Lista de categorias atualizada');
              }}
              disabled={isFetching || isProcessing}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Dados
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={!hasSelection || deleteMutation.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remover Categoria
            </Button>
            <Button type="button" onClick={handleOpenCreate} disabled={isProcessing}>
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Categoria
            </Button>
          </div>
        </div>

        <CategoryTable
          categories={categories}
          selectedId={selectedCategoryId}
          isLoading={isLoading}
          onSelect={(category) => {
            setSelectedCategoryId(category ? category.id : null);
          }}
          onEdit={handleOpenEdit}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <span>Ultima atualizacao: {formatDateTime(lastUpdatedAt)}</span>
          <span>Nenhum filtro ativo</span>
        </div>
      </section>

      <CategoryFormDialog
        open={formOpen}
        mode={formMode}
        category={formMode === 'edit' ? selectedCategory : null}
        onOpenChange={(open) => setFormOpen(open)}
        onSubmit={handleSubmitForm}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Essa acao nao pode ser desfeita. A categoria
              {selectedCategory ? ` "${selectedCategory.name}"` : ''} sera marcada como inativa.
              Itens vinculados deverao ser atualizados manualmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              Confirmar exclusao
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
