'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
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
import type { Cliente } from '../../types/cliente';

// ============================================
// TYPES
// ============================================

interface ClientesTableProps {
  clientes: Cliente[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

function formatDocument(tipo: 'fisica' | 'juridica', documento: string): string {
  return tipo === 'fisica' ? formatCPF(documento) : formatCNPJ(documento);
}

// ============================================
// COMPONENT
// ============================================

export function ClientesTable({
  clientes,
  onEdit,
  onDelete,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
}: ClientesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  const handleDeleteClick = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (clienteToDelete) {
      onDelete(clienteToDelete.id);
      setDeleteDialogOpen(false);
      setClienteToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Carregando clientes...</div>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">Nenhum cliente encontrado</p>
        <p className="text-sm text-muted-foreground">
          Cadastre um novo cliente para começar
        </p>
      </div>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">Nome</th>
                <th className="px-4 py-3 text-left font-medium">Cargo</th>
                <th className="px-4 py-3 text-left font-medium">CPF/CNPJ</th>
                <th className="px-4 py-3 text-left font-medium">E-Mail</th>
                <th className="px-4 py-3 text-left font-medium">Telefone</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{cliente.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {cliente.cargo || '-'}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {formatDocument(cliente.tipo, cliente.cpfCnpj)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {cliente.contatoEmail}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {cliente.contatoTelefone}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={cliente.ativo === 1 ? 'default' : 'outline'}
                      className={cliente.ativo === 1 ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      {cliente.ativo === 1 ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(cliente.id)}
                        aria-label={`Editar ${cliente.nome}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(cliente)}
                        aria-label={`Remover ${cliente.nome}`}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && onPageChange && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <div className="text-sm text-muted-foreground">
              Mostrando <span className="font-medium">{startItem}</span> a{' '}
              <span className="font-medium">{endItem}</span> de{' '}
              <span className="font-medium">{totalItems}</span> clientes
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o cliente{' '}
              <strong>{clienteToDelete?.nome}</strong>?
              <br />
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

