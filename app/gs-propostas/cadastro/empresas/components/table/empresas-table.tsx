'use client';

import { useState } from 'react';
import { Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import type { Empresa } from '../../types/empresa';

// ============================================
// TYPES
// ============================================

type SortField = 'tipo' | 'cpfCnpj' | 'nome' | 'cidade' | 'estado' | 'email' | 'ativo';
type SortDirection = 'asc' | 'desc';

interface EmpresasTableProps {
  empresas: Empresa[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  // Paginação
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Formata CPF no padrão 000.000.000-00
 */
function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ no padrão 00.000.000/0000-00
 */
function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length !== 14) return cnpj;
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata documento baseado no tipo
 */
function formatDocument(tipo: 'fisica' | 'juridica', documento: string): string {
  return tipo === 'fisica' ? formatCPF(documento) : formatCNPJ(documento);
}

/**
 * Obtém o nome de exibição da empresa
 */
function getDisplayName(empresa: Empresa): string {
  if (empresa.tipo === 'fisica') {
    return empresa.nome || '-';
  }
  return empresa.razaoSocial || empresa.nomeFantasia || '-';
}

// ============================================
// COMPONENT
// ============================================

export function EmpresasTable({ 
  empresas, 
  onEdit, 
  onDelete, 
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
}: EmpresasTableProps) {
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState<Empresa | null>(null);

  // ============================================
  // SORTING
  // ============================================

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const sortedEmpresas = [...empresas].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortField) {
      case 'tipo':
        aValue = a.tipo;
        bValue = b.tipo;
        break;
      case 'cpfCnpj':
        aValue = a.cpfCnpj;
        bValue = b.cpfCnpj;
        break;
      case 'nome':
        aValue = getDisplayName(a).toLowerCase();
        bValue = getDisplayName(b).toLowerCase();
        break;
      case 'cidade':
        aValue = a.cidade.toLowerCase();
        bValue = b.cidade.toLowerCase();
        break;
      case 'estado':
        aValue = a.estado;
        bValue = b.estado;
        break;
      case 'email':
        aValue = a.contatoEmail.toLowerCase();
        bValue = b.contatoEmail.toLowerCase();
        break;
      case 'ativo':
        aValue = a.ativo;
        bValue = b.ativo;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // ============================================
  // DELETE HANDLERS
  // ============================================

  const handleDeleteClick = (empresa: Empresa) => {
    setEmpresaToDelete(empresa);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (empresaToDelete) {
      onDelete(empresaToDelete.id);
      setDeleteDialogOpen(false);
      setEmpresaToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setEmpresaToDelete(null);
  };

  // ============================================
  // RENDER
  // ============================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Carregando empresas...</div>
      </div>
    );
  }

  if (empresas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">Nenhuma empresa encontrada</p>
        <p className="text-sm text-muted-foreground">
          Cadastre uma nova empresa para começar
        </p>
      </div>
    );
  }

  // ============================================
  // PAGINATION
  // ============================================

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Gerar números de página para exibir
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Tabela de empresas cadastradas">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th scope="col" className="px-4 py-3 text-left">
                  <div className="flex items-center">
                    Logo
                  </div>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('tipo')}
                    className="flex items-center font-medium hover:text-foreground transition-colors"
                    aria-label={`Ordenar por tipo ${sortField === 'tipo' ? (sortDirection === 'asc' ? 'decrescente' : 'crescente') : ''}`}
                  >
                    Tipo
                    {getSortIcon('tipo')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('cpfCnpj')}
                    className="flex items-center font-medium hover:text-foreground transition-colors"
                    aria-label={`Ordenar por documento ${sortField === 'cpfCnpj' ? (sortDirection === 'asc' ? 'decrescente' : 'crescente') : ''}`}
                  >
                    Documento
                    {getSortIcon('cpfCnpj')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('nome')}
                    className="flex items-center font-medium hover:text-foreground transition-colors"
                    aria-label={`Ordenar por nome ${sortField === 'nome' ? (sortDirection === 'asc' ? 'decrescente' : 'crescente') : ''}`}
                  >
                    Nome/Razão Social
                    {getSortIcon('nome')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('cidade')}
                    className="flex items-center font-medium hover:text-foreground transition-colors"
                    aria-label={`Ordenar por cidade ${sortField === 'cidade' ? (sortDirection === 'asc' ? 'decrescente' : 'crescente') : ''}`}
                  >
                    Cidade
                    {getSortIcon('cidade')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('estado')}
                    className="flex items-center font-medium hover:text-foreground transition-colors"
                    aria-label={`Ordenar por estado ${sortField === 'estado' ? (sortDirection === 'asc' ? 'decrescente' : 'crescente') : ''}`}
                  >
                    Estado
                    {getSortIcon('estado')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('email')}
                    className="flex items-center font-medium hover:text-foreground transition-colors"
                    aria-label={`Ordenar por email ${sortField === 'email' ? (sortDirection === 'asc' ? 'decrescente' : 'crescente') : ''}`}
                  >
                    Email
                    {getSortIcon('email')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('ativo')}
                    className="flex items-center font-medium hover:text-foreground transition-colors"
                    aria-label={`Ordenar por status ${sortField === 'ativo' ? (sortDirection === 'asc' ? 'decrescente' : 'crescente') : ''}`}
                  >
                    Status
                    {getSortIcon('ativo')}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end">
                    Ações
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedEmpresas.map((empresa) => (
                <tr
                  key={empresa.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    {empresa.logo ? (
                      <img
                        src={empresa.logo}
                        alt={`Logo ${getDisplayName(empresa)}`}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        {getDisplayName(empresa).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={empresa.tipo === 'fisica' ? 'secondary' : 'default'}
                      className="font-medium"
                    >
                      {empresa.tipo === 'fisica' ? 'PF' : 'PJ'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {formatDocument(empresa.tipo, empresa.cpfCnpj)}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {getDisplayName(empresa)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {empresa.cidade}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {empresa.estado}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-sm">
                    {empresa.contatoEmail}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={empresa.ativo === 1 ? 'default' : 'outline'}
                      className={empresa.ativo === 1 ? 'bg-green-500 hover:bg-green-600' : ''}
                    >
                      {empresa.ativo === 1 ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(empresa.id)}
                        aria-label={`Editar ${getDisplayName(empresa)}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(empresa)}
                        aria-label={`Remover ${getDisplayName(empresa)}`}
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
          <nav 
            className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-muted/20"
            aria-label="Navegação de páginas"
          >
            <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
              Mostrando <span className="font-medium">{startItem}</span> a{' '}
              <span className="font-medium">{endItem}</span> de{' '}
              <span className="font-medium">{totalItems}</span> empresas
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                aria-label="Ir para página anterior"
              >
                Anterior
              </Button>

              <div className="flex items-center gap-1" role="list">
                {getPageNumbers().map((page, index) => {
                  if (page === '...') {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-muted-foreground"
                        aria-hidden="true"
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageClick(page as number)}
                      className="min-w-[2.5rem]"
                      aria-label={`Ir para página ${page}`}
                      aria-current={currentPage === page ? 'page' : undefined}
                      role="listitem"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                aria-label="Ir para próxima página"
              >
                Próxima
              </Button>
            </div>
          </nav>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent aria-describedby="delete-dialog-description">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription id="delete-dialog-description">
              Tem certeza que deseja remover a empresa{' '}
              <strong>{empresaToDelete ? getDisplayName(empresaToDelete) : ''}</strong>?
              <br />
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={handleDeleteCancel} className="w-full sm:w-auto">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 w-full sm:w-auto"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
