"use client";

/**
 * PrincipalTab - Dados básicos da proposta
 * 
 * Esta tab gerencia os dados principais da proposta:
 * - Status (Aberto/Concluído + ações Ganhar/Perder)
 * - Dados da Proposta (Código, Nome, Pagamento, Validade)
 * - Dados da Empresa (readonly)
 * - Dados do Cliente (select + novo cliente)
 * 
 * @see docs/specs/SPEC-003-tab-principal.md
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Button } from "@/shared/ui/button";
import { DateRangePicker } from "@/shared/ui/date-range-picker";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/shared/ui/select";
import { Loader2, UserPlus, Building2, Trophy, XCircle, Info, CircleDot } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

import { getClientes } from "@/features/gs-propostas/api/clients";
import { getCompanies, createCompany } from "@/features/gs-propostas/api/companies";
import { createCliente } from "@/features/gs-propostas/api/clients";
import type { Cliente, ClienteFormData } from "@/features/gs-propostas/app/app-legacy/cadastro/clientes/types/cliente";
import type { Company, CompanyFormSchema } from "@/features/gs-propostas/app/app-legacy/cadastro/empresas/types";
import type { ProposalData, ProposalStatus } from "../types";
import { CompanyFormDialog } from "@/features/gs-propostas/app/app-legacy/cadastro/empresas/components/company-form-dialog";
import { ClientFormDialog } from "@/features/gs-propostas/app/app-legacy/cadastro/clientes/components/client-form-dialog";

// ============================================
// TYPES
// ============================================

interface PrincipalTabProps {
  /** Dados do formulário (controlled) */
  formData: ProposalData;
  
  /** Callback para atualizar dados */
  onDataChange: (data: Partial<ProposalData>) => void;
  
  /** Callback para mudar status */
  onStatusChange: (status: ProposalStatus) => void;
  
  /** Callback para navegar para tab de clientes */
  onNavigateToClients?: () => void;

  /** Callback para navegar para tab de empresas */
  onNavigateToCompanies?: () => void;
}

// ============================================
// STATUS BAR COMPONENT
// ============================================

interface StatusBarProps {
  status: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
}

function StatusBar({ status, onStatusChange }: StatusBarProps) {
  const isOpen = status === 'draft' || status === 'open';
  const isWon = status === 'won';
  const isLost = status === 'lost';
  
  const handleOpen = () => {
    onStatusChange('open');
    toast.info("Proposta marcada como ABERTA");
  };

  const handleWin = () => {
    onStatusChange('won');
    toast.success("Proposta marcada como GANHA! 🎉");
  };
  
  const handleLose = () => {
    onStatusChange('lost');
    toast.error("Proposta marcada como PERDIDA");
  };

  const statusConfig = {
    label: isWon ? 'Ganha' : isLost ? 'Perdida' : 'Aberto',
    className: isWon 
      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
      : isLost 
        ? 'bg-red-500/20 text-red-400 border-red-500/30' 
        : 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };
  
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-card/50 p-3 gap-3">
      {/* Status Badge */}
      <div className="flex items-center gap-3">
        <span className={cn(
          "px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full border",
          statusConfig.className
        )}>
          {statusConfig.label}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {isOpen ? 'Aguardando fechamento' : isWon ? 'Proposta finalizada com sucesso' : 'Proposta não convertida'}
        </span>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
          onClick={handleOpen}
          disabled={isOpen}
        >
          <CircleDot className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">Aberta</span>
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
          onClick={handleLose}
          disabled={isLost}
        >
          <XCircle className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">Perder</span>
        </Button>
        <Button 
          size="sm" 
          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={handleWin}
          disabled={isWon}
        >
          <Trophy className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">Ganhar</span>
        </Button>
      </div>
    </div>
  );
}


// ============================================
// SECTION HEADER COMPONENT
// ============================================

interface SectionHeaderProps {
  title: string;
  color: 'blue' | 'purple' | 'pink';
  action?: React.ReactNode;
}

function SectionHeader({ title, color, action }: SectionHeaderProps) {
  const colorClass = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  }[color];
  
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
        <span className={cn("w-1 h-4 rounded-full", colorClass)} />
        {title}
      </h3>
      {action}
    </div>
  );
}



const getCompanyDisplayName = (company: Company): string => {
  if (company.tipo === "juridica") {
    return company.nomeFantasia || company.razaoSocial || "Empresa sem nome";
  }
  return company.nome || "Pessoa sem nome";
};

const buildCompanyAddressLine = (company: Company): string => {
  return `${company.endereco}, ${company.numero}${company.complemento ? ` - ${company.complemento}` : ""}`;
};

const mapCompanyToFormData = (company: Company): Partial<ProposalData> => ({
  companyId: company.id,
  companyName: getCompanyDisplayName(company),
  companyCnpj: company.cpfCnpj,
  companyAddress: buildCompanyAddressLine(company),
  companyNeighborhood: company.bairro,
  companyCity: company.cidade,
  companyState: company.estado,
  companyZip: company.cep,
  companyEmail: company.contatoEmail,
  companyPhone: company.contatoTelefone,
  responsibleName: company.contatoNome,
});

const hasCompanyDetails = (data: ProposalData): boolean => {
  return Boolean(
    data.companyCnpj ||
    data.companyAddress ||
    data.companyNeighborhood ||
    data.companyCity ||
    data.companyState ||
    data.companyZip ||
    data.companyEmail ||
    data.companyPhone
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export function PrincipalTab({
  formData,
  onDataChange,
  onStatusChange,
  onNavigateToClients,
  onNavigateToCompanies,
}: PrincipalTabProps) {
  // ============================================
  // STATE
  // ============================================
  
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [selectedClientContacts, setSelectedClientContacts] = useState<string[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const lastCompanyIdRef = useRef<string | undefined>(undefined);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const selectedCompany = useMemo(() => {
    if (!formData.companyId) return null;
    return companies.find((company) => company.id === formData.companyId) ?? null;
  }, [companies, formData.companyId]);
  
  // ============================================
  // LOAD CLIENTS
  // ============================================
  
  const loadClients = useCallback(async () => {
    setIsLoadingClients(true);
    try {
      const response = await getClientes({ page: 1, pageSize: 100 });
      if (response.success) {
        setClients(response.data.clientes);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setIsLoadingClients(false);
    }
  }, []);
  
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // ============================================
  // LOAD COMPANIES
  // ============================================

  const loadCompanies = useCallback(async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await getCompanies({});
      if (response.success) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  useEffect(() => {
    if (!formData.companyId) {
      lastCompanyIdRef.current = undefined;
      return;
    }

    const company = companies.find((item) => item.id === formData.companyId);
    if (!company) return;

    const companyIdChanged = lastCompanyIdRef.current !== formData.companyId;
    if (companyIdChanged || !hasCompanyDetails(formData)) {
      onDataChange(mapCompanyToFormData(company));
    }

    lastCompanyIdRef.current = formData.companyId;
  }, [
    companies,
    formData.companyId,
    formData.companyCnpj,
    formData.companyAddress,
    formData.companyNeighborhood,
    formData.companyCity,
    formData.companyState,
    formData.companyZip,
    formData.companyEmail,
    formData.companyPhone,
    onDataChange,
  ]);
  
  // ============================================
  // HANDLERS
  // ============================================
  
  const handleFieldChange = (field: keyof ProposalData, value: string) => {
    onDataChange({ [field]: value });
  };

  const normalizeDateValue = (value?: Date | string) => {
    if (!value) return "";
    if (value instanceof Date) return value.toISOString().split('T')[0];
    if (typeof value === "string") return value;
    return "";
  };

  const proposalDate = normalizeDateValue(formData.date);
  const proposalValidity = normalizeDateValue(formData.validity);
  
  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      const contacts = [client.contatoNome];
      if (client.contatosSecundarios) {
        client.contatosSecundarios.forEach(c => contacts.push(c.nome));
      }
      
      onDataChange({
        clientId: client.id,
        clientName: client.nome,
        contactName: client.contatoNome // Default to main contact
      });
      setSelectedClientContacts(contacts);
    }
  };

  const handleCompanySelect = (value: string) => {


    const company = companies.find((item) => item.id === value);
    if (company) {
      onDataChange(mapCompanyToFormData(company));
    }
  };

  const handleSyncCompany = () => {
    if (selectedCompany) {
      onDataChange(mapCompanyToFormData(selectedCompany));
    }
  };

  const handleNewClient = () => {
    setIsClientModalOpen(true);
  };

  const handleClientSubmit = async (data: ClienteFormData) => {
    try {
      const result = await createCliente(data);
      if (result.success) {
        toast.success("Cliente cadastrado com sucesso!");
        await loadClients();
        // Selecionar o cliente criado
        handleClientSelect(result.data.id);
        setIsClientModalOpen(false);
      } else {
        toast.error(result.error?.message || "Erro ao cadastrar cliente");
      }
    } catch (error) {
      console.error("Erro ao criar cliente:", error);
      toast.error("Erro inesperado ao cadastrar cliente");
    }
  };

  const handleNewCompany = () => {
    setIsCompanyModalOpen(true);
  };

  const handleCompanySubmit = async (data: CompanyFormSchema) => {
    setIsSubmittingCompany(true);
    try {
      const result = await createCompany(data);
      if (result.success) {
        toast.success("Empresa cadastrada com sucesso!");
        setIsCompanyModalOpen(false);
        // Recarregar lista de empresas e selecionar a nova
        await loadCompanies();
        onDataChange(mapCompanyToFormData(result.data));
      } else {
        toast.error(result.error?.message || "Erro ao cadastrar empresa");
      }
    } catch (error) {
      console.error("Erro ao cadastrar empresa:", error);
      toast.error("Erro inesperado ao cadastrar empresa");
    } finally {
      setIsSubmittingCompany(false);
    }
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="space-y-6 pb-8">
      {/* Status Bar */}
      <StatusBar 
        status={formData.status} 
        onStatusChange={onStatusChange} 
      />
      
      {/* Dados da Proposta */}
      <div className="bg-card/80 p-4 sm:p-6 rounded-lg border border-white/10 shadow-lg ring-1 ring-white/5 space-y-4">
        <SectionHeader title="Dados da Proposta" color="blue" />
        
        {/* Grid com 4 colunas iguais - items-end para alinhar inputs pela base */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Código */}
          <div className="space-y-2">
            <Label htmlFor="code" className="block h-5">Código</Label>
            <Input 
              id="code"
              value={formData.code || ''}
              onChange={(e) => handleFieldChange('code', e.target.value)}
              className="bg-muted/30"
              placeholder="000000-0"
            />
          </div>
          
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1 h-5">
              Nome
              <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="bg-muted/30"
              placeholder="Nome da proposta"
              required
            />
          </div>
          
          {/* Modo de Pagamento */}
          <div className="space-y-2">
            <Label className="block h-5">Modo de Pagamento</Label>
            <Select 
              value={formData.paymentMode || ''} 
              onValueChange={(v) => handleFieldChange('paymentMode', v)}
            >
              <SelectTrigger className="bg-muted/30">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência</SelectItem>
                <SelectItem value="cartao">Cartão</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Data + Validade */}
          <div className="space-y-2">
            <Label htmlFor="proposal-date-range" className="block h-5">Data e validade</Label>
            <DateRangePicker
              id="proposal-date-range"
              value={{ from: proposalDate, to: proposalValidity }}
              onChange={(range) => {
                onDataChange({
                  date: range.from || "",
                  validity: range.to || "",
                });
              }}
              placeholder="Selecione o período"
              className="bg-muted/30"
              fromYear={2020}
              toYear={2035}
            />
          </div>
        </div>
      </div>
      
      {/* Dados da Empresa e Cliente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Empresa */}
        <div className="bg-card/80 p-4 sm:p-6 rounded-lg border border-white/10 shadow-lg ring-1 ring-white/5 space-y-4">
          <SectionHeader 
            title="Dados da Empresa" 
            color="purple"
            action={
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 gap-2 text-xs"
                onClick={handleNewCompany}
                type="button"
              >
                <Building2 className="w-3 h-3" />
                Nova Empresa
              </Button>
            }
          />
          
          {/* Seletor de Empresa - sempre visível */}
          <div className="space-y-2">
            <Label>Empresa Emissora</Label>
            <Select 
              value={formData.companyId || ''}
              onValueChange={handleCompanySelect}
              disabled={isLoadingCompanies || companies.length === 0}
            >
              <SelectTrigger className="bg-muted/30">
                <SelectValue 
                  placeholder={
                    isLoadingCompanies
                      ? "Carregando empresas..."
                      : companies.length === 0
                        ? "Nenhuma empresa cadastrada"
                        : "Selecione a empresa emissora"
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {companies.length === 0 && !isLoadingCompanies && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Nenhuma empresa cadastrada
                  </div>
                )}
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {getCompanyDisplayName(company)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!formData.companyId && !isLoadingCompanies && companies.length === 0 && (
              <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                <Info className="w-3 h-3" />
                Cadastre uma empresa primeiro clicando no botão acima
              </p>
            )}
          </div>

          {/* Dados da empresa - só exibe quando uma empresa estiver selecionada */}
          {formData.companyId && (
            <div className="space-y-4 pt-2 border-t border-white/5">
              {/* Grid 3 colunas: Nome Empresa + CNPJ + Responsável */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2 lg:col-span-1">
                  <Label htmlFor="companyName">Empresa</Label>
                  <Input 
                    id="companyName"
                    value={formData.companyName ?? ''}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyCnpj">CNPJ/CPF</Label>
                  <Input 
                    id="companyCnpj"
                    value={formData.companyCnpj || ''}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsibleName">Responsável</Label>
                  <Input 
                    id="responsibleName"
                    value={formData.responsibleName || ''}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Grid 2 colunas: E-mail + Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">E-mail</Label>
                  <Input 
                    id="companyEmail"
                    value={formData.companyEmail || ''}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Telefone</Label>
                  <Input 
                    id="companyPhone"
                    value={formData.companyPhone || ''}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Grid flexível: Endereço (maior) + Bairro + Cidade + UF + CEP */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="space-y-2 col-span-2 sm:col-span-4 lg:col-span-2">
                  <Label htmlFor="companyAddress">Endereço</Label>
                  <Input 
                    id="companyAddress"
                    value={formData.companyAddress || ''}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyNeighborhood">Bairro</Label>
                  <Input 
                    id="companyNeighborhood"
                    value={formData.companyNeighborhood || ''}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyCity">Cidade</Label>
                  <Input 
                    id="companyCity"
                    value={formData.companyCity || ''}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyState">UF</Label>
                  <Input 
                    id="companyState"
                    value={formData.companyState || ''}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyZip">CEP</Label>
                  <Input 
                    id="companyZip"
                    value={formData.companyZip || ''}
                    readOnly
                    disabled
                    className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Cliente */}
        <div className="bg-card/80 p-4 sm:p-6 rounded-lg border border-white/10 shadow-lg ring-1 ring-white/5 space-y-4">
          <SectionHeader 
            title="Dados do Cliente" 
            color="pink"
            action={
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 gap-2 text-xs"
                onClick={handleNewClient}
                type="button"
              >
                <UserPlus className="w-3 h-3" />
                Novo Cliente
              </Button>
            }
          />
          
          <div className="space-y-4">
            {/* Grid de campos do Cliente - items-end para alinhar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {/* Select de Cliente */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label className="block h-5">Cliente</Label>
                <Select 
                  value={formData.clientId || ''} 
                  onValueChange={handleClientSelect}
                  disabled={isLoadingClients || clients.length === 0}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue 
                      placeholder={
                        isLoadingClients 
                          ? "Carregando clientes..." 
                          : clients.length === 0
                            ? "Nenhum cliente cadastrado"
                            : "Selecione um cliente"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.length === 0 && !isLoadingClients && (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Nenhum cliente cadastrado
                      </div>
                    )}
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.clientId && !isLoadingClients && clients.length === 0 && (
                  <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                    <Info className="w-3 h-3" />
                    Cadastre um cliente primeiro clicando no botão acima
                  </p>
                )}
              </div>
              
              {/* Select de Contato */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <Label className="block h-5">Contato</Label>
                <Select 
                  value={formData.contactName || ''} 
                  onValueChange={(v) => handleFieldChange('contactName', v)}
                  disabled={!formData.clientId}
                >
                  <SelectTrigger className="bg-muted/30">
                    <SelectValue 
                      placeholder={
                        !formData.clientId 
                          ? "Selecione um cliente primeiro" 
                          : "Selecione o contato"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedClientContacts.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        Nenhum contato disponível
                      </div>
                    ) : (
                      selectedClientContacts.map((contact) => (
                        <SelectItem key={contact} value={contact}>
                          {contact}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isLoadingClients && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Carregando lista de clientes...
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal de Cadastro de Empresa */}
      <CompanyFormDialog
        open={isCompanyModalOpen}
        mode="create"
        company={null}
        isSubmitting={isSubmittingCompany}
        onOpenChange={setIsCompanyModalOpen}
        onSubmit={handleCompanySubmit}
      />

      {/* Modal de Cadastro de Cliente */}
      <ClientFormDialog
        open={isClientModalOpen}
        onOpenChange={setIsClientModalOpen}
        onSubmit={handleClientSubmit}
      />
    </div>
  );
}
