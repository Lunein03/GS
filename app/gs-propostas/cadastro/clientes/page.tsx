'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClienteFilters } from './components/filters/cliente-filters';
import { ClientesTable } from './components/table/clientes-table';
import { ClienteForm } from './components/forms/cliente-form';
import { getClientes, deleteCliente, createCliente, updateCliente } from './actions/cliente-actions';
import type { Cliente, FilterState, ClienteFormData } from './types/cliente';

// ============================================
// TYPES
// ============================================

type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

// ============================================
// COMPONENT
// ============================================

export default function ClientesPage() {
  // State
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tipo: 'all',
    status: 'all',
    estado: undefined,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();

  // ============================================
  // DATA FETCHING
  // ============================================

  const loadClientes = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = {
        search: filters.search || undefined,
        tipo: filters.tipo === 'all' ? undefined : filters.tipo,
        status: filters.status === 'all' ? undefined : filters.status,
        estado: filters.estado,
        page: pagination.page,
        pageSize: pagination.pageSize,
      };

      const result = await getClientes(params);

      if (result.data?.success && result.data.data) {
        const clientesFormatted = result.data.data.clientes.map((cliente: any) => ({
          ...cliente,
          ativo: cliente.ativo as number,
        }));

        setClientes(clientesFormatted);
        setPagination({
          page: result.data.data.pagination.page,
          pageSize: result.data.data.pagination.pageSize,
          total: result.data.data.pagination.total,
          totalPages: result.data.data.pagination.totalPages,
        });
      } else {
        const errorMessage = result.serverError ||
          (result.data && !result.data.success ? result.data.error.message : 'Erro ao carregar clientes');
        toast.error(errorMessage);
        setClientes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes. Tente novamente.');
      setClientes([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize]);

  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNew = () => {
    setEditingCliente(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = async (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    if (cliente) {
      // Carregar contatos secundários
      const { getContatosSecundarios } = await import('./actions/cliente-actions');
      const contatosResult = await getContatosSecundarios(id);

      const clienteComContatos: Cliente = {
        ...cliente,
        contatosSecundarios: contatosResult.success && contatosResult.data
          ? contatosResult.data
          : [],
      };

      setEditingCliente(clienteComContatos);
      setIsFormOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteCliente({ id });

      if (result.data?.success) {
        toast.success('Cliente removido com sucesso');
        await loadClientes();
      } else {
        const errorMessage = result.serverError || result.data?.error?.message || 'Erro ao remover cliente';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      toast.error('Erro ao remover cliente. Tente novamente.');
    }
  };

  const handleFormSubmit = async (data: ClienteFormData & { contatosSecundarios?: any[] }) => {
    try {
      let result;
      const { contatosSecundarios, ...clienteData } = data;

      if (editingCliente) {
        result = await updateCliente({ id: editingCliente.id, ...clienteData });
      } else {
        result = await createCliente(clienteData);
      }

      if (result.data?.success) {
        const clienteId = editingCliente?.id || result.data.data?.id;

        // Salvar contatos secundários se houver
        if (clienteId && contatosSecundarios && contatosSecundarios.length > 0) {
          const { createContatoSecundario } = await import('./actions/cliente-actions');

          for (const contato of contatosSecundarios) {
            if (!contato.id) {
              // Novo contato
              await createContatoSecundario({
                clientId: clienteId,
                nome: contato.nome,
                email: contato.email,
                telefone: contato.telefone,
                cargo: contato.cargo,
              });
            }
          }
        }

        toast.success(editingCliente ? 'Cliente atualizado com sucesso' : 'Cliente cadastrado com sucesso');
        setIsFormOpen(false);
        setEditingCliente(undefined);
        await loadClientes();
      } else {
        const errorMessage = result.serverError || result.data?.error?.message || 'Erro ao salvar cliente';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente. Tente novamente.');
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingCliente(undefined);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Cadastre aqui os seus clientes
            </p>
          </div>
        </div>

        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Incluir
        </Button>
      </header>

      {/* Filtros */}
      <ClienteFilters
        onFilterChange={handleFilterChange}
        initialFilters={filters}
      />

      {/* Tabela */}
      <ClientesTable
        clientes={clientes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        pageSize={pagination.pageSize}
        totalItems={pagination.total}
        onPageChange={handlePageChange}
      />

      {/* Mensagem quando não há clientes */}
      {!isLoading && clientes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {filters.search || filters.tipo !== 'all' || filters.status !== 'all' || filters.estado
              ? 'Nenhum cliente encontrado com os filtros aplicados'
              : 'Nenhum cliente cadastrado'}
          </p>
          {!filters.search && filters.tipo === 'all' && filters.status === 'all' && !filters.estado && (
            <p className="text-sm text-muted-foreground">
              Clique em "Incluir" para adicionar seu primeiro cliente
            </p>
          )}
        </div>
      )}

      {/* Dialog de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCliente ? 'Editar Cliente' : 'Cadastrar Cliente'}
            </DialogTitle>
            <DialogDescription>
              {editingCliente
                ? 'Edite aqui os seus clientes. Eles poderão ser incluídos em propostas gerais, posteriormente.'
                : 'Cadastre aqui os seus clientes. Eles poderão ser incluídos em propostas gerais, posteriormente.'}
            </DialogDescription>
          </DialogHeader>

          <ClienteForm
            initialData={editingCliente}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
