'use client';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Pencil, Trash2 } from 'lucide-react';
import type { Item } from '../types/item.types';

interface ItemsTableProps {
  items: Item[];
  currentPage: number;
  totalPages: number;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  onPageChange: (page: number) => void;
}

export function ItemsTable({
  items,
  currentPage,
  totalPages,
  onEdit,
  onDelete,
  onPageChange,
}: ItemsTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const truncateText = (text: string | undefined, maxLength: number = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getTypeBadgeColor = (type: 'product' | 'service') => {
    return type === 'product'
      ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      : 'bg-green-100 text-green-800 hover:bg-green-100';
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-card/30 p-12 text-center">
        <p className="text-muted-foreground">
          Nenhum item encontrado. Cadastre o primeiro item para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Tipo</TableHead>
              <TableHead className="w-[150px]">Categoria</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-[100px]">Unidade</TableHead>
              <TableHead className="w-[120px]">Valor</TableHead>
              <TableHead className="w-[200px]">Descrição</TableHead>
              <TableHead className="w-[100px] text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge className={getTypeBadgeColor(item.type)}>
                    {item.type === 'product' ? 'Produto' : 'Serviço'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.category && (
                    <Badge
                      style={{
                        backgroundColor: `${item.category.color}20`,
                        color: item.category.color,
                        borderColor: item.category.color,
                      }}
                      className="border"
                    >
                      {item.category.name}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="capitalize">{item.unit}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(item.defaultPrice)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {truncateText(item.description)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      aria-label={`Editar ${item.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item)}
                      aria-label={`Deletar ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              Primeira
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              Última
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

