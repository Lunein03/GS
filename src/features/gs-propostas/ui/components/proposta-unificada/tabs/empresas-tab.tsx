"use client";

/**
 * EmpresasTab - Cadastro inline de empresas
 * 
 * Versão inline do cadastro de empresas integrada à tela de proposta.
 * Permite gerenciar as empresas emissoras das propostas.
 * 
 * @see docs/specs/SPEC-005-tab-empresas.md
 */

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { 
  Building2, 
  Plus, 
  Search, 
  Loader2, 
  Eye, 
  Edit2, 
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  User,
  FileText,
} from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { cn } from "@/shared/lib/utils";

// Hooks & Types
import {
  useCompanies,
  useCreateCompany,
  useUpdateCompany,
} from "@/features/gs-propostas/app/app-legacy/cadastro/empresas/hooks/use-companies";
import { CompanyFormDialog } from "@/features/gs-propostas/app/app-legacy/cadastro/empresas/components/company-form-dialog";
import type { 
  Company, 
  CompanyFormSchema 
} from "@/features/gs-propostas/app/app-legacy/cadastro/empresas/types";

// ============================================
// TYPES
// ============================================

interface EmpresasTabProps {
  /** Empresa atualmente selecionada na proposta */
  selectedCompanyId?: string;
  
  /** Callback quando uma empresa é selecionada */
  onCompanySelect: (company: Company | null) => void;
  
  /** Se está em modo somente visualização */
  readOnly?: boolean;
}

type FormMode = 'create' | 'edit';

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCompanyDisplayName(company: Company): string {
  if (company.tipo === 'juridica') {
    return company.nomeFantasia || company.razaoSocial || 'Empresa sem nome';
  }
  return company.nome || 'Pessoa sem nome';
}

function getCompanyDocument(company: Company): string {
  return company.cpfCnpj || '-';
}

function formatDateTime(date?: Date): string {
  if (!date) return 'Sem atualização';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

// ============================================
// COMPANY PREVIEW COMPONENT
// ============================================

interface CompanyPreviewProps {
  company: Company;
  onUse: () => void;
  onEdit: () => void;
  readOnly?: boolean;
}

function CompanyPreview({ company, onUse, onEdit, readOnly }: CompanyPreviewProps) {
  const displayName = getCompanyDisplayName(company);
  const isJuridica = company.tipo === 'juridica';
  
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-lg">{displayName}</h4>
            <p className="text-sm text-muted-foreground">
              {isJuridica ? 'Pessoa Jurídica' : 'Pessoa Física'} • {getCompanyDocument(company)}
            </p>
          </div>
        </div>
        <Badge variant="default" className="shrink-0">
          {company.ativo !== 0 ? 'Ativa' : 'Inativa'}
        </Badge>
      </div>
      
      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm border-t border-border pt-4">
        {/* Razão Social (PJ only) */}
        {isJuridica && company.razaoSocial && (
          <div className="flex items-start gap-2 text-muted-foreground md:col-span-2">
            <FileText className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs uppercase tracking-wide">Razão Social</span>
              <p className="text-foreground">{company.razaoSocial}</p>
            </div>
          </div>
        )}
        
        {/* Contact */}
        <div className="flex items-start gap-2 text-muted-foreground">
          <User className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs uppercase tracking-wide">Contato</span>
            <p className="text-foreground">{company.contatoNome}</p>
          </div>
        </div>
        
        {/* Phone */}
        <div className="flex items-start gap-2 text-muted-foreground">
          <Phone className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs uppercase tracking-wide">Telefone</span>
            <p className="text-foreground">{company.contatoTelefone}</p>
          </div>
        </div>
        
        {/* Email */}
        <div className="flex items-start gap-2 text-muted-foreground">
          <Mail className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs uppercase tracking-wide">Email</span>
            <p className="text-foreground truncate">{company.contatoEmail}</p>
          </div>
        </div>
        
        {/* Address */}
        <div className="flex items-start gap-2 text-muted-foreground md:col-span-2">
          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <span className="text-xs uppercase tracking-wide">Endereço</span>
            <p className="text-foreground">
              {company.endereco}, {company.numero}
              {company.complemento && ` - ${company.complemento}`}
              <br />
              {company.bairro} - {company.cidade}/{company.estado} - CEP: {company.cep}
            </p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      {!readOnly && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1">
            <Edit2 className="w-3.5 h-3.5" />
            Editar
          </Button>
          <Button size="sm" onClick={onUse} className="gap-1 ml-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Usar para proposta
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function EmpresasTab({
  selectedCompanyId,
  onCompanySelect,
  readOnly = false,
}: EmpresasTabProps) {
  // ============================================
  // STATE
  // ============================================
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(selectedCompanyId || null);
  
  // ============================================
  // DATA FETCHING (React Query)
  // ============================================
  
  const { data: companies = [], isLoading, isFetching } = useCompanies({
    search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
  });
  
  // ============================================
  // MUTATIONS
  // ============================================
  
  const createMutation = useCreateCompany({
    onSuccess: (company) => {
      toast.success('Empresa cadastrada com sucesso!');
      setFormOpen(false);
      setLocalSelectedId(company.id);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao cadastrar empresa');
    },
  });
  
  const updateMutation = useUpdateCompany({
    onSuccess: (company) => {
      toast.success('Empresa atualizada com sucesso!');
      setFormOpen(false);
      setLocalSelectedId(company.id);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao atualizar empresa');
    },
  });
  
  // ============================================
  // COMPUTED
  // ============================================
  
  const selectedCompany = useMemo(() => {
    if (!localSelectedId) return null;
    return companies.find(c => c.id === localSelectedId) ?? null;
  }, [companies, localSelectedId]);
  
  const lastUpdatedAt = useMemo(() => {
    if (companies.length === 0) return undefined;
    const timestamps = companies.map(c => c.updatedAt.getTime());
    return new Date(Math.max(...timestamps));
  }, [companies]);
  
  // ============================================
  // EFFECTS
  // ============================================
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);
  
  // ============================================
  // HANDLERS
  // ============================================
  
  const handleCompanyClick = (companyId: string) => {
    setLocalSelectedId(companyId);
  };
  
  const handleUseCompany = () => {
    if (selectedCompany) {
      onCompanySelect(selectedCompany);
      toast.success(`Empresa "${getCompanyDisplayName(selectedCompany)}" selecionada!`);
    }
  };
  
  const handleOpenCreate = () => {
    setFormMode('create');
    setLocalSelectedId(null);
    setFormOpen(true);
  };
  
  const handleOpenEdit = (company: Company) => {
    setLocalSelectedId(company.id);
    setFormMode('edit');
    setFormOpen(true);
  };
  
  const handleFormSubmit = async (data: CompanyFormSchema) => {
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
  
  const isProcessing = createMutation.isPending || updateMutation.isPending;
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Empresas</h3>
            <p className="text-xs text-muted-foreground">
              Configure as empresas emissoras das propostas
            </p>
          </div>
        </div>
        
        {!readOnly && (
          <Button onClick={handleOpenCreate} size="sm" className="gap-2" disabled={isProcessing}>
            <Plus className="h-4 w-4" />
            Nova Empresa
          </Button>
        )}
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, razão social, CNPJ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando empresas...</span>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && companies.length === 0 && (
        <div className="text-center py-12 bg-card rounded-lg border border-dashed border-border">
          <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-2">
            {debouncedSearch
              ? 'Nenhuma empresa encontrada com esse termo'
              : 'Nenhuma empresa cadastrada'}
          </p>
          {!readOnly && !debouncedSearch && (
            <Button onClick={handleOpenCreate} size="sm" variant="outline" className="gap-2 mt-2">
              <Plus className="h-4 w-4" />
              Cadastrar primeira empresa
            </Button>
          )}
        </div>
      )}
      
      {/* Companies Table */}
      {!isLoading && companies.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow 
                  key={company.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    localSelectedId === company.id && "bg-primary/5"
                  )}
                  onClick={() => handleCompanyClick(company.id)}
                >
                  <TableCell>
                    <RadioGroup value={localSelectedId || ''} onValueChange={handleCompanyClick}>
                      <RadioGroupItem value={company.id} />
                    </RadioGroup>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">{getCompanyDisplayName(company)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {company.tipo === 'juridica' ? 'PJ' : 'PF'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getCompanyDocument(company)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {company.contatoNome}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompanyClick(company.id);
                        }}
                        title="Visualizar"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {!readOnly && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(company);
                          }}
                          title="Editar"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Footer Info */}
          <div className="px-4 py-3 border-t border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Total: {companies.length} empresa(s)</span>
            <span>Última atualização: {formatDateTime(lastUpdatedAt)}</span>
          </div>
        </div>
      )}
      
      {/* Selected Company Preview */}
      {selectedCompany && (
        <CompanyPreview
          company={selectedCompany}
          onUse={handleUseCompany}
          onEdit={() => handleOpenEdit(selectedCompany)}
          readOnly={readOnly}
        />
      )}
      
      {/* Form Dialog */}
      <CompanyFormDialog
        open={formOpen}
        mode={formMode}
        company={formMode === 'edit' ? selectedCompany : null}
        onOpenChange={(open) => setFormOpen(open)}
        onSubmit={handleFormSubmit}
        isSubmitting={isProcessing}
      />
    </div>
  );
}
