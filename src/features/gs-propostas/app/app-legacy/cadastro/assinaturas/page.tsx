'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, PenTool, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
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
import { SignatureTable } from './components/signature-table';
import { SignatureFormDialog } from './components/signature-form-dialog';
import { SignatureStatusBadge } from './components/signature-status-badge';
import {
  useCompleteGovbrValidation,
  useCreateSignature,
  useDeleteSignature,
  useRefreshSignatures,
  useRequestGovbrValidation,
  useSignatures,
  useUpdateSignature,
} from './hooks/use-signatures';
import type { Signature, SignatureFormSchema } from './types';

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

export default function AssinaturasPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(handler);
  }, [search]);

  const { data: signatures = [], isLoading, isFetching } = useSignatures({
    search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
  });

  const refreshSignatures = useRefreshSignatures();

  const selectedSignature = useMemo<Signature | null>(() => {
    if (!selectedSignatureId) {
      return null;
    }

    return signatures.find((signature) => signature.id === selectedSignatureId) ?? null;
  }, [signatures, selectedSignatureId]);

  const createMutation = useCreateSignature({
    onSuccess: (signature) => {
      toast.success('Assinatura cadastrada com sucesso');
      setFormOpen(false);
      setSelectedSignatureId(signature.id);
      if (signature.signatureType === 'govbr') {
        window.open('https://www.gov.br/pt-br/servicos/entrar', '_blank', 'noopener');
        toast.info('Solicite a validacao no portal Gov.br para concluir.');
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useUpdateSignature({
    onSuccess: (signature) => {
      toast.success('Assinatura atualizada com sucesso');
      setFormOpen(false);
      setSelectedSignatureId(signature.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useDeleteSignature({
    onSuccess: () => {
      toast.success('Assinatura removida com sucesso');
      setDeleteDialogOpen(false);
      setSelectedSignatureId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const requestGovbrMutation = useRequestGovbrValidation({
    onSuccess: (signature) => {
      toast.info('Validacao solicitada. Conclua o processo no portal Gov.br.');
      setSelectedSignatureId(signature.id);
      window.open('https://www.gov.br/pt-br/servicos/entrar', '_blank', 'noopener');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const completeGovbrMutation = useCompleteGovbrValidation({
    onSuccess: (signature) => {
      toast.success('Validacao Gov.br concluida');
      setSelectedSignatureId(signature.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitForm = async (data: SignatureFormSchema) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(data);
      return;
    }

    if (!selectedSignature) {
      toast.error('Selecione uma assinatura para editar.');
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedSignature.id,
      ...data,
    });
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (signature: Signature) => {
    setSelectedSignatureId(signature.id);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSignature) {
      toast.error('Selecione uma assinatura.');
      return;
    }

    await deleteMutation.mutateAsync({ id: selectedSignature.id });
  };

  const handleRequestGovbrValidation = async () => {
    if (!selectedSignature) {
      toast.error('Selecione uma assinatura.');
      return;
    }

    await requestGovbrMutation.mutateAsync({ id: selectedSignature.id });
  };

  const handleCompleteGovbrValidation = async () => {
    if (!selectedSignature) {
      toast.error('Selecione uma assinatura.');
      return;
    }

    await completeGovbrMutation.mutateAsync({ id: selectedSignature.id });
  };

  const isProcessing =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    requestGovbrMutation.isPending ||
    completeGovbrMutation.isPending;

  const totalSignatures = signatures.length;
  const selectedCount = selectedSignature ? 1 : 0;
  const hasSelection = Boolean(selectedSignature);
  const lastUpdatedAt = useMemo(() => {
    if (signatures.length === 0) {
      return undefined;
    }

    const timestamps = signatures.map((signature) => signature.updatedAt.getTime());
    const latest = Math.max(...timestamps);
    return new Date(latest);
  }, [signatures]);

  const canRequestGovbr =
    selectedSignature?.signatureType === 'govbr' &&
    selectedSignature.status !== 'verified';

  const canCompleteGovbr =
    selectedSignature?.signatureType === 'govbr' &&
    selectedSignature.status === 'pending';

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <PenTool className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Assinaturas</h1>
            <p className="text-muted-foreground">
              Cadastre assinaturas Gov.br ou personalizadas para utilizar nas propostas.
            </p>
          </div>
        </div>

        <div className="w-full max-w-xs">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Procurar..."
            aria-label="Pesquisar assinaturas"
          />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total: {totalSignatures}</span>
            <span aria-hidden="true">•</span>
            <span>{selectedCount} de {totalSignatures} linha(s) selecionada(s)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await refreshSignatures();
                toast.info('Lista de assinaturas atualizada');
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
              <Trash2 className="mr-2 h-4 w-4" /> Remover Assinatura
            </Button>
            <Button type="button" onClick={handleOpenCreate} disabled={isProcessing}>
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Assinatura
            </Button>
          </div>
        </div>

        <SignatureTable
          signatures={signatures}
          selectedId={selectedSignatureId}
          isLoading={isLoading}
          onSelect={(signature) => {
            setSelectedSignatureId(signature ? signature.id : null);
          }}
          onEdit={handleOpenEdit}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <span>Ultima atualizacao: {formatDateTime(lastUpdatedAt)}</span>
          <span>Nenhum filtro ativo</span>
        </div>

        {selectedSignature && (
          <div className="rounded-lg border bg-card/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">Assinatura selecionada</span>
                <span className="text-lg font-medium text-foreground">{selectedSignature.name}</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <SignatureStatusBadge status={selectedSignature.status} />
                  {selectedSignature.signatureType === 'govbr' ? (
                    <span>Gov.br • ID: {selectedSignature.govbrIdentifier ?? 'N/A'}</span>
                  ) : (
                    <span>Personalizada pronta para uso</span>
                  )}
                </div>
              </div>

              {selectedSignature.signatureType === 'govbr' && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleRequestGovbrValidation}
                    disabled={!canRequestGovbr || requestGovbrMutation.isPending}
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" /> Validar no Gov.br
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCompleteGovbrValidation}
                    disabled={!canCompleteGovbr || completeGovbrMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Confirmar Validacao
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      <SignatureFormDialog
        open={formOpen}
        mode={formMode}
        signature={formMode === 'edit' ? selectedSignature : null}
        onOpenChange={(open) => setFormOpen(open)}
        onSubmit={handleSubmitForm}
        isSubmitting={
          createMutation.isPending ||
          updateMutation.isPending ||
          requestGovbrMutation.isPending ||
          completeGovbrMutation.isPending
        }
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover assinatura</AlertDialogTitle>
            <AlertDialogDescription>
              Essa acao nao pode ser desfeita. A assinatura
              {selectedSignature ? ` "${selectedSignature.name}"` : ''} sera marcada como revogada e nao podera ser utilizada em novas propostas.
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

