'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Building2, Plus, RefreshCw, Trash2 } from 'lucide-react';
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
import { CompanyTable } from './components/company-table';
import { CompanyFormDialog } from './components/company-form-dialog';
import {
    useCompanies,
    useCreateCompany,
    useDeleteCompany,
    useRefreshCompanies,
    useUpdateCompany,
} from './hooks/use-companies';
import type { Company, CompanyFormSchema } from './types';

type FormMode = 'create' | 'edit';

const formatDateTime = (date?: Date) => {
    if (!date) {
        return 'Sem atualização';
    }

    return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'medium',
    }).format(date);
};

export default function EmpresasPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>('create');
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        const handler = window.setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);

        return () => window.clearTimeout(handler);
    }, [search]);

    const { data: companies = [], isLoading, isFetching } = useCompanies({
        search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
    });

    const refreshCompanies = useRefreshCompanies();

    const selectedCompany = useMemo<Company | null>(() => {
        if (!selectedCompanyId) {
            return null;
        }

        return companies.find((company) => company.id === selectedCompanyId) ?? null;
    }, [companies, selectedCompanyId]);

    const createMutation = useCreateCompany({
        onSuccess: (company) => {
            toast.success('Empresa cadastrada com sucesso.');
            setFormOpen(false);
            setSelectedCompanyId(company.id);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const updateMutation = useUpdateCompany({
        onSuccess: (company) => {
            toast.success('Empresa atualizada com sucesso.');
            setFormOpen(false);
            setSelectedCompanyId(company.id);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const deleteMutation = useDeleteCompany({
        onSuccess: () => {
            toast.success('Empresa removida com sucesso.');
            setDeleteDialogOpen(false);
            setSelectedCompanyId(null);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleSubmitForm = async (data: CompanyFormSchema) => {
        if (formMode === 'create') {
            await createMutation.mutateAsync(data);
            return;
        }

        if (!selectedCompany) {
            toast.error('Selecione uma empresa para editar.');
            return;
        }

        await updateMutation.mutateAsync({
            id: selectedCompany.id,
            ...data,
        });
    };

    const handleOpenCreate = () => {
        setFormMode('create');
        setSelectedCompanyId(null);
        setFormOpen(true);
    };

    const handleOpenEdit = (company: Company) => {
        setSelectedCompanyId(company.id);
        setFormMode('edit');
        setFormOpen(true);
    };

    const handleTriggerDelete = (company: Company) => {
        setSelectedCompanyId(company.id);
        setDeleteDialogOpen(true);
    };

        const handleOpenDeleteDialog = () => {
            if (!selectedCompany) {
                toast.error('Selecione uma empresa para remover.');
                return;
            }

            setDeleteDialogOpen(true);
        };

    const handleConfirmDelete = async () => {
        if (!selectedCompany) {
            toast.error('Selecione uma empresa para remover.');
            return;
        }

        await deleteMutation.mutateAsync({ id: selectedCompany.id });
    };

    const handleRefresh = async () => {
        await refreshCompanies();
        toast.info('Lista de empresas atualizada.');
    };

    const isProcessing =
        createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    const totalCompanies = companies.length;
    const selectedCount = selectedCompany ? 1 : 0;
    const hasSelection = Boolean(selectedCompany);

    const lastUpdatedAt = useMemo(() => {
        if (companies.length === 0) {
            return undefined;
        }

        const timestamps = companies.map((company) => company.updatedAt.getTime());
        return new Date(Math.max(...timestamps));
    }, [companies]);

    return (
        <div className="flex flex-col gap-6 w-full h-full bg-background text-foreground py-4 px-4 justify-start">
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Building2 className="h-10 w-10 text-primary" />
                    <div>
                        <h1 className="text-3xl font-medium tracking-tight">Empresas</h1>
                        <p className="text-muted-foreground">
                            Configure aqui as informações da sua empresa para cabeçalhos e rodapés das propostas.
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-xs">
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Procurar..."
                        aria-label="Pesquisar empresas"
                    />
                </div>
            </header>

            <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Total: {totalCompanies}</span>
                        <span aria-hidden="true">•</span>
                        <span>{selectedCount} de {totalCompanies} linha(s) selecionada(s)</span>
                    </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleRefresh}
                                    disabled={isFetching || isProcessing}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Dados
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleOpenDeleteDialog}
                                    disabled={!hasSelection || deleteMutation.isPending}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Remover Empresa
                                </Button>
                                <Button type="button" onClick={handleOpenCreate} disabled={isProcessing}>
                                    <Plus className="mr-2 h-4 w-4" /> Cadastrar Empresa
                                </Button>
                            </div>
                </div>

                <CompanyTable
                    companies={companies}
                    selectedId={selectedCompanyId}
                    isLoading={isLoading}
                    onSelect={(company) => {
                        setSelectedCompanyId(company ? company.id : null);
                    }}
                    onEdit={handleOpenEdit}
                    onDelete={handleTriggerDelete}
                />

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                    <span>Última atualização: {formatDateTime(lastUpdatedAt)}</span>
                    <span>Nenhum filtro ativo</span>
                </div>
            </section>

            <CompanyFormDialog
                open={formOpen}
                mode={formMode}
                company={formMode === 'edit' ? selectedCompany : null}
                onOpenChange={(open) => setFormOpen(open)}
                onSubmit={handleSubmitForm}
                isSubmitting={createMutation.isPending || updateMutation.isPending}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover empresa</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. A empresa
                            {selectedCompany ? ` "${selectedCompany.tipo === 'juridica' ? (selectedCompany.nomeFantasia ?? selectedCompany.razaoSocial ?? 'Sem nome') : (selectedCompany.nome ?? 'Sem nome')}"` : ''}
                            será marcada como inativa e deixará de aparecer nas propostas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleConfirmDelete}
                            disabled={deleteMutation.isPending}
                        >
                            Confirmar exclusão
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

