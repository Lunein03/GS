'use client';

import { memo } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn, sanitizeHtml } from '@/shared/lib/utils';
import type { Note } from '../types';

const EMPTY_STATE_MESSAGE = 'Nenhuma nota cadastrada ate o momento.';

const inclusionModeLabels: Record<Note['inclusionMode'], string> = {
  manual: 'Manual',
  automatic: 'Automatica',
};

type NoteTableProps = {
  notes: Note[];
  selectedId?: string | null;
  isLoading?: boolean;
  onSelect: (note: Note | null) => void;
  onEdit: (note: Note) => void;
};

function NoteTableComponent({
  notes,
  selectedId,
  isLoading = false,
  onSelect,
  onEdit,
}: NoteTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card py-12">
        <span className="text-muted-foreground">Carregando notas...</span>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12 text-center">
        <p className="text-muted-foreground">{EMPTY_STATE_MESSAGE}</p>
        <p className="text-sm text-muted-foreground">
          Clique em "Cadastrar Nota" para adicionar a primeira nota.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3 text-sm text-muted-foreground">
        Clique duas vezes para editar ou selecione uma linha e use os botoes de acao.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="Lista de notas">
          <thead className="bg-muted/40">
            <tr className="border-b">
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Nome
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Descricao
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Modo de inclusao
              </th>
              <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => {
              const isSelected = note.id === selectedId;
              const sanitizedDescription = sanitizeHtml(note.description ?? '');

              return (
                <tr
                  key={note.id}
                  className={cn(
                    'cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/40',
                    isSelected && 'bg-primary/10 hover:bg-primary/15',
                  )}
                  onClick={() => onSelect(isSelected ? null : note)}
                  onDoubleClick={() => onEdit(note)}
                  role="row"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onEdit(note);
                    }
                    if (event.key === ' ') {
                      event.preventDefault();
                      onSelect(isSelected ? null : note);
                    }
                  }}
                >
                  <td className="px-4 py-3 align-middle">
                    <span className="font-medium text-foreground">{note.name}</span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {sanitizedDescription ? (
                      <div
                        className="max-w-xl text-sm text-muted-foreground line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">Sem descricao</span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Badge variant="secondary" className="font-medium">
                      {inclusionModeLabels[note.inclusionMode]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(note);
                      }}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export const NoteTable = memo(NoteTableComponent);


