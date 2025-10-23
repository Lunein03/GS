'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EmpresaFilters } from './components/filters/empresa-filters';
import { EmpresasTable } from './components/table/empresas-table';
import { getEmpresas, deleteEmpresa } from './actions/empresa-actions';
import type { Empresa, FilterState } from './types/empresa';

// TODO (MEDIUM): [Cadastro Empresas] Cobrir fluxo completo com testes E2E.

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

export default function EmpresasPage() {
    const router = useRouter();

    // State
    const [empresas, setEmpresas] = useState<Empresa[]>([]);
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

    // ============================================
    // DATA FETCHING
    // ============================================

    const loadEmpresas = useCallback(async () => {
        setIsLoading(true);

        try {
            // Preparar parâmetros para a action
            const params = {
                search: filters.search || undefined,
                tipo: filters.tipo === 'all' ? undefined : filters.tipo,
                status: filters.status === 'all' ? undefined : filters.status,
                estado: filters.estado,
                page: pagination.page,
                pageSize: pagination.pageSize,
            };

            const result = await getEmpresas(params);

            // next-safe-action retorna { data, serverError, validationError }
            if (result.data?.success && result.data.data) {
                // Converter ativo de number para boolean para compatibilidade com o tipo
                const empresasFormatted = result.data.data.empresas.map((empresa: any) => ({
                    ...empresa,
                    ativo: empresa.ativo as number,
                }));

                setEmpresas(empresasFormatted);
                setPagination({
                    page: result.data.data.pagination.page,
                    pageSize: result.data.data.pagination.pageSize,
                    total: result.data.data.pagination.total,
                    totalPages: result.data.data.pagination.totalPages,
                });
            } else {
                const errorMessage = result.serverError ||
                    (result.data && !result.data.success ? result.data.error.message : 'Erro ao carregar empresas');
                toast.error(errorMessage);
                setEmpresas([]);
            }
        } catch (error) {
            console.error('Erro ao carregar empresas:', error);
            toast.error('Erro ao carregar empresas. Tente novamente.');
            setEmpresas([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters, pagination.page, pagination.pageSize]);

    // Carregar empresas quando filtros ou página mudarem
    useEffect(() => {
        loadEmpresas();
    }, [loadEmpresas]);

    // ============================================
    // HANDLERS
    // ============================================

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        // Reset para primeira página quando filtros mudarem
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (page: number) => {
        setPagination((prev) => ({ ...prev, page }));
        // Scroll para o topo quando mudar de página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEdit = (id: string) => {
        router.push(`/gs-propostas/cadastro/empresas/${id}`);
    };

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteEmpresa({ id });

            // next-safe-action retorna { data, serverError, validationError }
            if (result.data?.success) {
                toast.success('Empresa removida com sucesso');

                // Recarregar lista
                await loadEmpresas();
            } else {
                const errorMessage = result.serverError || result.data?.error?.message || 'Erro ao remover empresa';
                toast.error(errorMessage);
            }
        } catch (error) {
            console.error('Erro ao remover empresa:', error);
            toast.error('Erro ao remover empresa. Tente novamente.');
        }
    };

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="container mx-auto py-8 px-4 space-y-6">
            {/* Filtros */}
            <EmpresaFilters
                onFilterChange={handleFilterChange}
                initialFilters={filters}
            />

            {/* Tabela */}
            <EmpresasTable
                empresas={empresas}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.total}
                onPageChange={handlePageChange}
            />

            {/* Mensagem quando não há empresas */}
            {!isLoading && empresas.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                        {filters.search || filters.tipo !== 'all' || filters.status !== 'all' || filters.estado
                            ? 'Nenhuma empresa encontrada com os filtros aplicados'
                            : 'Nenhuma empresa cadastrada'}
                    </p>
                    {!filters.search && filters.tipo === 'all' && filters.status === 'all' && !filters.estado && (
                        <p className="text-sm text-muted-foreground">
                            Clique em "Cadastrar Empresas" para adicionar sua primeira empresa
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
