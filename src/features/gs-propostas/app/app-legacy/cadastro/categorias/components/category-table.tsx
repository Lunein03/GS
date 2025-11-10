'use client';

import { memo } from 'react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';
import type { Category } from '../types';

const EMPTY_STATE_MESSAGE = 'Nenhuma categoria cadastrada ate o momento.';

type CategoryTableProps = {
  categories: Category[];
  selectedId?: string | null;
  isLoading?: boolean;
  onSelect: (category: Category | null) => void;
  onEdit: (category: Category) => void;
};

function CategoryTableComponent({
  categories,
  selectedId,
  isLoading = false,
  onSelect,
  onEdit,
}: CategoryTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-card py-12">
        <span className="text-muted-foreground">Carregando categorias...</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-12 text-center">
        <p className="text-muted-foreground">{EMPTY_STATE_MESSAGE}</p>
        <p className="text-sm text-muted-foreground">
          Clique em "Cadastrar Categoria" para adicionar a primeira categoria.
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
        <table className="w-full" role="table" aria-label="Lista de categorias">
          <thead className="bg-muted/40">
            <tr className="border-b">
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Nome
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Cor
              </th>
              <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Descricao
              </th>
              <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const isSelected = category.id === selectedId;

              return (
                <tr
                  key={category.id}
                  className={cn(
                    'cursor-pointer border-b last:border-0 transition-colors hover:bg-muted/40',
                    isSelected && 'bg-primary/10 hover:bg-primary/15',
                  )}
                  onClick={() => onSelect(isSelected ? null : category)}
                  onDoubleClick={() => onEdit(category)}
                  role="row"
                  aria-selected={isSelected}
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onEdit(category);
                    }
                    if (event.key === ' ') {
                      event.preventDefault();
                      onSelect(isSelected ? null : category);
                    }
                  }}
                >
                  <td className="px-4 py-3 align-middle">
                    <div>
                      <span className="font-medium text-foreground">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex h-3 w-3 rounded-full border border-border"
                        style={{ backgroundColor: category.color }}
                        aria-hidden="true"
                      />
                      <Badge variant="outline" className="font-mono text-xs">
                        {category.color.toUpperCase()}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle text-sm text-muted-foreground">
                    {category.description ? category.description : 'Sem descricao'}
                  </td>
                  <td className="px-4 py-3 align-middle text-right">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        onEdit(category);
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

export const CategoryTable = memo(CategoryTableComponent);


