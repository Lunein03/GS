'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { ClienteFilters } from './components/filters/cliente-filters';
import { ClientesTable } from './components/table/clientes-table';
import { ClienteForm } from './components/forms/cliente-form';
import {
  getClientes,
  deleteCliente,
  createCliente,
  updateCliente,
  getContatosSecundarios,
  createContatoSecundario,
} from '@/features/gs-propostas/api/clients';
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

      if (!result.success) {
        toast.error(result.error.message ?? 'Erro ao carregar clientes');
        setClientes([]);
        setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
        return;
      }

      const clientesFormatted = result.data.clientes.map((cliente) => ({
        ...cliente,
        ativo: cliente.ativo as number,
      }));

      setClientes(clientesFormatted);
      setPagination(result.data.pagination);
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
    if (!cliente) {
      return;
    }

    const contatosResult = await getContatosSecundarios(id);
    if (!contatosResult.success) {
      toast.error(contatosResult.error.message ?? 'Erro ao carregar contatos do cliente');
    }

    const clienteComContatos: Cliente = {
      ...cliente,
      contatosSecundarios: contatosResult.success && contatosResult.data
        ? contatosResult.data
        : [],
    };

    setEditingCliente(clienteComContatos);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteCliente({ id });

      if (result.success) {
        toast.success('Cliente removido com sucesso');
        await loadClientes();
      } else {
        toast.error(result.error.message ?? 'Erro ao remover cliente');
      }
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      toast.error('Erro ao remover cliente. Tente novamente.');
    }
  };

  const handleFormSubmit = async (data: ClienteFormData & { contatosSecundarios?: any[] }) => {
    try {
      const { contatosSecundarios, ...clienteData } = data;

      const result = editingCliente
        ? await updateCliente({ id: editingCliente.id, ...clienteData })
        : await createCliente(clienteData);

      if (!result.success) {
        toast.error(result.error.message ?? 'Erro ao salvar cliente');
        return;
      }

      const clienteId = editingCliente?.id || result.data.id;

      if (clienteId && contatosSecundarios && contatosSecundarios.length > 0) {
        for (const contato of contatosSecundarios) {
          if (!contato.id) {
            const contatoResult = await createContatoSecundario(clienteId, {
              nome: contato.nome,
              email: contato.email,
              telefone: contato.telefone,
              cargo: contato.cargo,
            });

            if (!contatoResult.success) {
              toast.error(contatoResult.error.message ?? 'Erro ao salvar contato secundario');
              return;
            }
          }
        }
      }

      toast.success(editingCliente ? 'Cliente atualizado com sucesso' : 'Cliente cadastrado com sucesso');
      setIsFormOpen(false);
      setEditingCliente(undefined);
      await loadClientes();
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
    <div className="flex flex-col gap-6 w-full h-full bg-background text-foreground py-4 px-4 justify-start">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Clientes</h1>
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

