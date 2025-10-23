'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, Plus, RefreshCw, Trash2 } from 'lucide-react';
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
import { NoteTable } from './components/note-table';
import { NoteFormDialog } from './components/note-form-dialog';
import {
  useCreateNote,
  useDeleteNote,
  useNotes,
  useRefreshNotes,
  useUpdateNote,
} from './hooks/use-notes';
import type { Note, NoteFormSchema } from './types';

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

export default function NotasPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(handler);
  }, [search]);

  const { data: notes = [], isLoading, isFetching } = useNotes({
    search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
  });

  const refreshNotes = useRefreshNotes();

  const selectedNote = useMemo<Note | null>(() => {
    if (!selectedNoteId) {
      return null;
    }
    return notes.find((note) => note.id === selectedNoteId) ?? null;
  }, [notes, selectedNoteId]);

  const createMutation = useCreateNote({
    onSuccess: (note) => {
      toast.success('Nota criada com sucesso');
      setFormOpen(false);
      setSelectedNoteId(note.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useUpdateNote({
    onSuccess: (note) => {
      toast.success('Nota atualizada com sucesso');
      setFormOpen(false);
      setSelectedNoteId(note.id);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useDeleteNote({
    onSuccess: () => {
      toast.success('Nota removida com sucesso');
      setDeleteDialogOpen(false);
      setSelectedNoteId(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmitForm = async (data: NoteFormSchema) => {
    if (formMode === 'create') {
      await createMutation.mutateAsync(data);
      return;
    }

    if (!selectedNote) {
      toast.error('Selecione uma nota para editar.');
      return;
    }

    await updateMutation.mutateAsync({
      id: selectedNote.id,
      ...data,
    });
  };

  const handleOpenCreate = () => {
    setFormMode('create');
    setFormOpen(true);
  };

  const handleOpenEdit = (note: Note) => {
    setSelectedNoteId(note.id);
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedNote) {
      toast.error('Selecione uma nota.');
      return;
    }

    await deleteMutation.mutateAsync({ id: selectedNote.id });
  };

  const isProcessing =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const totalNotes = notes.length;
  const selectedCount = selectedNote ? 1 : 0;
  const hasSelection = Boolean(selectedNote);
  const lastUpdatedAt = useMemo(() => {
    if (notes.length === 0) {
      return undefined;
    }

    const timestamps = notes.map((note) => note.updatedAt.getTime());
    const latest = Math.max(...timestamps);
    return new Date(latest);
  }, [notes]);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notas</h1>
            <p className="text-muted-foreground">
              Cadastre notas e observacoes padrao para incluir em propostas comerciais.
            </p>
          </div>
        </div>

        <div className="w-full max-w-xs">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Procurar..."
            aria-label="Pesquisar notas"
          />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Total: {totalNotes}</span>
            <span aria-hidden="true">•</span>
            <span>{selectedCount} de {totalNotes} linha(s) selecionada(s)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await refreshNotes();
                toast.info('Lista de notas atualizada');
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
              <Trash2 className="mr-2 h-4 w-4" /> Remover Nota
            </Button>
            <Button type="button" onClick={handleOpenCreate} disabled={isProcessing}>
              <Plus className="mr-2 h-4 w-4" /> Cadastrar Nota
            </Button>
          </div>
        </div>

        <NoteTable
          notes={notes}
          selectedId={selectedNoteId}
          isLoading={isLoading}
          onSelect={(note) => {
            setSelectedNoteId(note ? note.id : null);
          }}
          onEdit={handleOpenEdit}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
          <span>Ultima atualizacao: {formatDateTime(lastUpdatedAt)}</span>
          <span>Nenhum filtro ativo</span>
        </div>
      </section>

      <NoteFormDialog
        open={formOpen}
        mode={formMode}
        note={formMode === 'edit' ? selectedNote : null}
        onOpenChange={(open) => setFormOpen(open)}
        onSubmit={handleSubmitForm}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover nota</AlertDialogTitle>
            <AlertDialogDescription>
              Essa acao nao pode ser desfeita. A nota
              {selectedNote ? ` "${selectedNote.name}"` : ''} sera marcada como inativa.
              Propostas existentes nao serao alteradas automaticamente.
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
