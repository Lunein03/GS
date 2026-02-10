"use client";

/**
 * PrincipalTab - Dados básicos da proposta
 * 
 * Esta tab gerencia os dados principais da proposta:
 * - Status (Aberto/Concluído + ações Ganhar/Perder)
 * - Dados da Proposta (Código, Nome, Pagamento, Validade)
 * - Dados da Empresa (seleção + edição opcional)
 * - Dados do Cliente (select + novo cliente)
 * 
 * @see docs/specs/SPEC-003-tab-principal.md
 */

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Loader2, UserPlus, Building2, Trophy, XCircle, Info, CircleDot, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import {
  formatCNPJ,
  formatCPF,
  formatPhone,
  formatCEP,
  removeNonNumeric,
  toTitleCase,
} from "@/shared/lib/validators";

import { getClientes } from "@/features/gs-propostas/api/clients";
import { getCompanies, createCompany } from "@/features/gs-propostas/api/companies";
import { createCliente } from "@/features/gs-propostas/api/clients";
import type { Cliente, ClienteFormData } from "@/features/gs-propostas/app/app-legacy/cadastro/clientes/types/cliente";
import type { Company, CompanyFormSchema } from "@/features/gs-propostas/app/app-legacy/cadastro/empresas/types";
import type { ProposalData, ProposalStatus } from "../types";
import { CompanyFormDialog } from "@/features/gs-propostas/app/app-legacy/cadastro/empresas/components/company-form-dialog";
import { ClientFormDialog } from "@/features/gs-propostas/app/app-legacy/cadastro/clientes/components/client-form-dialog";
import { LogoUploader } from "../logo-uploader";

// ============================================
// TYPES
// ============================================

interface PrincipalTabProps {
  formData: ProposalData;
  onDataChange: (data: Partial<ProposalData>) => void;
  onStatusChange: (status: ProposalStatus) => void;
  onNavigateToClients?: () => void;
  onNavigateToCompanies?: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB',
  'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

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

// ============================================
// HELPER FUNCTIONS
// ============================================

const getCompanyDisplayName = (company: Company): string => {
  if (company.tipo === "juridica") {
    return company.nomeFantasia || company.razaoSocial || "Empresa sem nome";
  }
  return company.nome || "Pessoa sem nome";
};

const formatDocValue = (doc: string): string => {
  const digits = removeNonNumeric(doc);
  if (digits.length === 11) return formatCPF(digits);
  if (digits.length === 14) return formatCNPJ(digits);
  return doc;
};

const formatPhoneValue = (phone: string): string => {
  const digits = removeNonNumeric(phone);
  if (digits.length >= 10) return formatPhone(digits);
  return phone;
};

const formatCepValue = (cep: string): string => {
  const digits = removeNonNumeric(cep);
  if (digits.length === 8) return formatCEP(digits);
  return cep;
};

const buildCompanyAddressLine = (company: Company): string => {
  const street = company.endereco ? toTitleCase(company.endereco) : '';
  return `${street}, ${company.numero}${company.complemento ? ` - ${company.complemento}` : ""}`;
};

const mapCompanyToFormData = (company: Company): Partial<ProposalData> => ({
  companyId: company.id,
  companyName: toTitleCase(getCompanyDisplayName(company)),
  companyCnpj: company.cpfCnpj ? formatDocValue(company.cpfCnpj) : '',
  companyAddress: buildCompanyAddressLine(company),
  companyNeighborhood: company.bairro ? toTitleCase(company.bairro) : '',
  companyCity: company.cidade ? toTitleCase(company.cidade) : '',
  companyState: company.estado?.toUpperCase() || '',
  companyZip: company.cep ? formatCepValue(company.cep) : '',
  companyEmail: company.contatoEmail,
  companyPhone: company.contatoTelefone ? formatPhoneValue(company.contatoTelefone) : '',
  responsibleName: company.contatoNome ? toTitleCase(company.contatoNome) : '',
});

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
  const [isCompanyDetailsOpen, setIsCompanyDetailsOpen] = useState(false);
  const [isCompanyAdvancedOpen, setIsCompanyAdvancedOpen] = useState(false);
  
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
    const companyDetailsFilled = Boolean(
      formData.companyCnpj ||
      formData.companyAddress ||
      formData.companyNeighborhood ||
      formData.companyCity ||
      formData.companyState ||
      formData.companyZip ||
      formData.companyEmail ||
      formData.companyPhone
    );

    if (companyIdChanged || !companyDetailsFilled) {
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

  useEffect(() => {
    if (!formData.companyId) {
      setIsCompanyDetailsOpen(false);
      setIsCompanyAdvancedOpen(false);
    }
  }, [formData.companyId]);
  
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
        contactName: client.contatoNome
      });
      setSelectedClientContacts(contacts);
    }
  };

  const handleCompanySelect = (value: string) => {
    const company = companies.find((item) => item.id === value);
    if (company) {
      onDataChange(mapCompanyToFormData(company));
      setIsCompanyDetailsOpen(false);
      setIsCompanyAdvancedOpen(false);
    }
  };

  const handleClearCompany = () => {
    onDataChange({
      companyId: undefined,
      companyName: undefined,
      companyCnpj: undefined,
      companyAddress: undefined,
      companyNeighborhood: undefined,
      companyCity: undefined,
      companyState: undefined,
      companyZip: undefined,
      companyEmail: undefined,
      companyPhone: undefined,
      responsibleName: undefined,
    });
    setIsCompanyDetailsOpen(false);
    setIsCompanyAdvancedOpen(false);
    lastCompanyIdRef.current = undefined;
  };

  const handleClearClient = () => {
    onDataChange({
      clientId: undefined,
      clientName: undefined,
      contactName: undefined,
    });
    setSelectedClientContacts([]);
  };

  const handleMaskedFieldChange = (field: keyof ProposalData, value: string, type: 'cnpj' | 'phone' | 'cep' | 'titlecase') => {
    let formatted = value;
    const digits = removeNonNumeric(value);
    switch (type) {
      case 'cnpj':
        if (digits.length === 11) formatted = formatCPF(digits);
        else if (digits.length === 14) formatted = formatCNPJ(digits);
        break;
      case 'phone':
        if (digits.length >= 10) formatted = formatPhone(digits);
        break;
      case 'cep':
        if (digits.length === 8) formatted = formatCEP(digits);
        break;
      case 'titlecase':
        formatted = toTitleCase(value);
        break;
    }
    onDataChange({ [field]: formatted });
  };

  const handleToggleCompanyDetails = () => {
    setIsCompanyDetailsOpen((prev) => {
      const next = !prev;
      if (!next) {
        setIsCompanyAdvancedOpen(false);
      }
      return next;
    });
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
                  date: range.from ? new Date(range.from) : undefined,
                  validity: range.to ? new Date(range.to) : undefined,
                });
              }}
              placeholder="Selecione o período"
              className="bg-muted/30"
              fromYear={2020}
              toYear={2035}
            />
          </div>

          {/* Logo da Proposta - NEW SECTION */}
          <div className="sm:col-span-2 lg:col-span-4 mt-2 pt-4 border-t border-white/10">
            <LogoUploader 
              currentLogoUrl={formData.logoUrl}
              currentPosition={formData.logoPosition || 'left'}
              onLogoChange={(url) => onDataChange({ logoUrl: url })}
              onPositionChange={(pos) => onDataChange({ logoPosition: pos })}
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
          
          {/* Seletor de Empresa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Empresa Emissora</Label>
              <div className="flex items-center gap-1">
                {formData.companyId && (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                      onClick={handleClearCompany}
                      title="Limpar seleção"
                    >
                      <X className="h-3.5 w-3.5" />
                      Limpar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={handleToggleCompanyDetails}
                    >
                      {isCompanyDetailsOpen ? "Ocultar edição" : "Editar dados"}
                      {isCompanyDetailsOpen ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
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

          {/* Edição inline compacta */}
          {formData.companyId && isCompanyDetailsOpen && (
            <div className="space-y-4 pt-2 border-t border-white/5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Empresa</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName ?? ''}
                    onChange={(e) => handleFieldChange('companyName', e.target.value)}
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyCnpj">CNPJ/CPF</Label>
                  <Input
                    id="companyCnpj"
                    value={formData.companyCnpj || ''}
                    placeholder="00.000.000/0000-00"
                    onChange={(e) => handleFieldChange('companyCnpj', e.target.value)}
                    onBlur={(e) => handleMaskedFieldChange('companyCnpj', e.target.value, 'cnpj')}
                    className="bg-muted/30"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => setIsCompanyAdvancedOpen((prev) => !prev)}
                >
                  {isCompanyAdvancedOpen ? "Menos campos" : "Mais campos"}
                  {isCompanyAdvancedOpen ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>

              {isCompanyAdvancedOpen && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="responsibleName">Responsável</Label>
                      <Input
                        id="responsibleName"
                        value={formData.responsibleName || ''}
                        onChange={(e) => handleFieldChange('responsibleName', e.target.value)}
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="companyEmail">E-mail</Label>
                      <Input
                        id="companyEmail"
                        value={formData.companyEmail || ''}
                        onChange={(e) => handleFieldChange('companyEmail', e.target.value)}
                        className="bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyPhone">Telefone</Label>
                      <Input
                        id="companyPhone"
                        value={formData.companyPhone || ''}
                        placeholder="(00) 00000-0000"
                        onChange={(e) => handleFieldChange('companyPhone', e.target.value)}
                        onBlur={(e) => handleMaskedFieldChange('companyPhone', e.target.value, 'phone')}
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">Endereço</Label>
                      <Input
                        id="companyAddress"
                        value={formData.companyAddress || ''}
                        onChange={(e) => handleFieldChange('companyAddress', e.target.value)}
                        className="bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyNeighborhood">Bairro</Label>
                      <Input
                        id="companyNeighborhood"
                        value={formData.companyNeighborhood || ''}
                        onChange={(e) => handleFieldChange('companyNeighborhood', e.target.value)}
                        onBlur={(e) => handleMaskedFieldChange('companyNeighborhood', e.target.value, 'titlecase')}
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyCity">Cidade</Label>
                      <Input
                        id="companyCity"
                        value={formData.companyCity || ''}
                        onChange={(e) => handleFieldChange('companyCity', e.target.value)}
                        onBlur={(e) => handleMaskedFieldChange('companyCity', e.target.value, 'titlecase')}
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyState">UF</Label>
                      <Select
                        value={formData.companyState || ''}
                        onValueChange={(v) => handleFieldChange('companyState', v)}
                      >
                        <SelectTrigger id="companyState" className="bg-muted/30">
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRAZIL_STATES.map((uf) => (
                            <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyZip">CEP</Label>
                      <Input
                        id="companyZip"
                        value={formData.companyZip || ''}
                        placeholder="00000-000"
                        onChange={(e) => handleFieldChange('companyZip', e.target.value)}
                        onBlur={(e) => handleMaskedFieldChange('companyZip', e.target.value, 'cep')}
                        className="bg-muted/30"
                      />
                    </div>
                  </div>
                </div>
              )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              {/* Select de Cliente */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between gap-2 h-5">
                  <Label>Cliente</Label>
                  {formData.clientId && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1 text-destructive hover:text-destructive"
                      onClick={handleClearClient}
                      title="Limpar seleção"
                    >
                      <X className="h-3.5 w-3.5" />
                      Limpar
                    </Button>
                  )}
                </div>
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
