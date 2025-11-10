'use client';

import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { PaymentModeTable } from './components/payment-mode-table';
import { PaymentModeFormDialog } from './components/payment-mode-form-dialog';
import {
  useCreatePaymentMode,
  useDeletePaymentMode,
  usePaymentModes,
  useRefreshPaymentModes,
  useUpdatePaymentMode,
} from './hooks/use-payment-modes';
import type { PaymentMode, PaymentModeFormSchema } from './types';

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

export default function PagamentosPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedPaymentModeId, setSelectedPaymentModeId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(handler);
  }, [search]);

  const { data: paymentModes = [], isLoading, isFetching } = usePaymentModes({
    search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
  });

  const refreshPaymentModes = useRefreshPaymentModes();

  const selectedPaymentMode = useMemo<PaymentMode | null>(() => {
    if (!selectedPaymentModeId) {
      return null;
    }

    return paymentModes.find((mode) => mode.id === selectedPaymentModeId) ?? null;
  }, [paymentModes, selectedPaymentModeId]);

  const createMutation = useCreatePaymentMode({
    onSuccess: (paymentMode) => {
      toast.success('Modo de pagamento criado com sucesso');
      setFormOpen(false);
      setSelectedPaymentModeId(paymentMode.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useUpdatePaymentMode({
    onSuccess: (paymentMode) => {
      toast.success('Modo de pagamento atualizado com sucesso');
      setFormOpen(false);
      setSelectedPaymentModeId(paymentMode.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useDeletePaymentMode({
    onSuccess: () => {
      toast.success('Modo de pagamento removido com sucesso');
      setDeleteDialogOpen(false);
      setSelectedPaymentModeId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitForm = async (data: PaymentModeFormSchema) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(data);
      return;
    }

    if (!selectedPaymentMode) {
      toast.error('Selecione um modo de pagamento para editar.');
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedPaymentMode.id,
      ...data,
    });
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (paymentMode: PaymentMode) => {
    setSelectedPaymentModeId(paymentMode.id);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPaymentMode) {
      toast.error('Selecione um modo de pagamento.');
      return;
    }

    await deleteMutation.mutateAsync({ id: selectedPaymentMode.id });
  };

  const isProcessing =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const totalPaymentModes = paymentModes.length;
  const selectedCount = selectedPaymentMode ? 1 : 0;
  const hasSelection = Boolean(selectedPaymentMode);
  const lastUpdatedAt = useMemo(() => {
    if (paymentModes.length === 0) {
      return undefined;
    }

    const timestamps = paymentModes.map((mode) => mode.updatedAt.getTime());
    const latest = Math.max(...timestamps);
    return new Date(latest);
  }, [paymentModes]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Modos de Pagamento</h1>
            <p className="text-muted-foreground">
              Configure as condicoes comerciais para propostas e pedidos.
            </p>
          </div>
        </div>

        <div className="w-full max-w-xs">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Procurar..."
            aria-label="Pesquisar modos de pagamento"
          />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total: {totalPaymentModes}</span>
            <span aria-hidden="true">•</span>
            <span>{selectedCount} de {totalPaymentModes} linha(s) selecionada(s)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await refreshPaymentModes();
                toast.info('Lista de modos de pagamento atualizada');
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
              <Trash2 className="mr-2 h-4 w-4" /> Remover Modo de Pagamento
            </Button>
            <Button type="button" onClick={handleOpenCreate} disabled={isProcessing}>
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Modo de Pagamento
            </Button>
          </div>
        </div>

        <PaymentModeTable
          paymentModes={paymentModes}
          selectedId={selectedPaymentModeId}
          isLoading={isLoading}
          onSelect={(paymentMode) => {
            setSelectedPaymentModeId(paymentMode ? paymentMode.id : null);
          }}
          onEdit={handleOpenEdit}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <span>Ultima atualizacao: {formatDateTime(lastUpdatedAt)}</span>
          <span>Nenhum filtro ativo</span>
        </div>
      </section>

      <PaymentModeFormDialog
        open={formOpen}
        mode={formMode}
        paymentMode={formMode === 'edit' ? selectedPaymentMode : null}
        onOpenChange={(open) => setFormOpen(open)}
        onSubmit={handleSubmitForm}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover modo de pagamento</AlertDialogTitle>
            <AlertDialogDescription>
              Essa acao nao pode ser desfeita. O modo de pagamento
              {selectedPaymentMode ? ` "${selectedPaymentMode.name}"` : ''} sera marcado como inativo.
              Condicoes existentes nas propostas deverao ser revisadas manualmente.
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

