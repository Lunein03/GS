"use client";

/**
 * PropostaUnificada - Centro de Propostas Unificado
 * 
 * Componente container principal que substitui o modal anterior.
 * Funciona como uma página full-screen com tabs para gestão completa de propostas.
 * 
 * @see docs/specs/SPEC-002-proposta-unificada.md
 */

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { 
  FileText, 
  Package, 
  Users, 
  Building2, 
  FileSignature,
  StickyNote, 
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  MessageSquareText,
  MoreHorizontal,
} from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/shared/ui/resizable";

import dynamic from "next/dynamic";

// Static Imports (Critical path)
import { PrincipalTab } from "./tabs/principal-tab";
import { PropostaHeader } from "./header";
import { PropostaFooter } from "./footer";

// Dynamic Imports (Lazy loaded)
const ClientesTab = dynamic(() => import("./tabs/clientes-tab").then(mod => mod.ClientesTab), {
  loading: () => <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
});

const EmpresasTab = dynamic(() => import("./tabs/empresas-tab").then(mod => mod.EmpresasTab), {
  loading: () => <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
});

const ItensTab = dynamic(() => import("./tabs/itens-tab").then(mod => mod.ItensTab));
const ObservacoesTab = dynamic(() => import("./tabs/observacoes-tab").then(mod => mod.ObservacoesTab));
const NotasTab = dynamic(() => import("./tabs/notas-tab").then(mod => mod.NotasTab));
const AssinaturasTab = dynamic(() => import("./tabs/assinaturas-tab").then(mod => mod.AssinaturasTab));
const HistoricoTab = dynamic(() => import("./tabs/historico-tab").then(mod => mod.HistoricoTab));

import { 
  ProposalDocumentEditor, 
  ProposalDocumentEditorRef 
} from "../proposal-document-editor";

// Types - Cliente
import type { Cliente } from "@/features/gs-propostas/app/app-legacy/cadastro/clientes/types/cliente";
import type { Company } from "@/features/gs-propostas/app/app-legacy/cadastro/empresas/types";

// Types
import type { 
  ProposalData, 
  ProposalFormData,
  TabKey, 
  TabDefinition,
  PropostaUnificadaProps 
} from "./types";
import { 
  proposalFormSchema, 
  DEFAULT_PROPOSAL_DATA 
} from "./types";
import { generateProposalCode, DEFAULT_PROPOSAL_ITEMS } from "./utils";
import { proposalsApi } from "@/features/gs-propostas/api/proposals";

// ============================================
// TAB CONFIGURATION
// ============================================

const TABS: TabDefinition[] = [
  { key: 'principal', label: 'Principal', shortLabel: 'Prin', icon: FileText, group: 'proposta' },
  { key: 'itens', label: 'Itens', shortLabel: 'Itens', icon: Package, group: 'proposta' },
  { key: 'assinaturas', label: 'Assinaturas', shortLabel: 'Assin', icon: FileSignature, group: 'proposta' },
  { key: 'observacoes', label: 'Observações', shortLabel: 'Obs', icon: MessageSquareText, group: 'proposta' },

  { key: 'clientes', label: 'Clientes', shortLabel: 'Cli', icon: Users, group: 'cadastro' },
  { key: 'empresas', label: 'Empresas', shortLabel: 'Emp', icon: Building2, group: 'cadastro' },
  { key: 'notas', label: 'Notas', shortLabel: 'Notas', icon: StickyNote, group: 'cadastro' },
  { key: 'historico', label: 'Histórico', shortLabel: 'Hist', icon: Clock, group: 'cadastro' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export function PropostaUnificada({ 
  proposalId, 
  initialData, 
  onSaveSuccess, 
  onClose 
}: PropostaUnificadaProps) {
  const router = useRouter();
  
  // ============================================
  // STATE
  // ============================================
  
  const [activeTab, setActiveTab] = useState<TabKey>('principal');
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ProposalData['status']>(initialData?.status || 'draft');
  const [creationDate] = useState(new Date());
  
  // Ref for PDF editor
  const editorRef = useRef<ProposalDocumentEditorRef>(null);
  
  // ============================================
  // FORM
  // ============================================
  
  const defaultValues: ProposalFormData = initialData ? {
    code: initialData.code,
    name: initialData.name,
    date: initialData.date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    paymentMode: initialData.paymentMode,
    validity: initialData.validity?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    clientId: initialData.clientId,
    clientName: initialData.clientName,
    companyId: initialData.companyId,
    companyName: initialData.companyName,
    companyCnpj: initialData.companyCnpj,
    companyAddress: initialData.companyAddress,
    companyNeighborhood: initialData.companyNeighborhood,
    companyCity: initialData.companyCity,
    companyState: initialData.companyState,
    companyZip: initialData.companyZip,
    companyEmail: initialData.companyEmail,
    companyPhone: initialData.companyPhone,
    responsibleName: initialData.responsibleName,
    contactName: initialData.contactName,
    items: (initialData.items || []).map(item => ({
      ...item,
      unit: item.unit || 'hora',
    })),
    observations: initialData.observations,
    internalNotes: initialData.internalNotes,
    logoUrl: initialData.logoUrl,
  } : {
    code: generateProposalCode(),
    name: DEFAULT_PROPOSAL_DATA.name,
    date: new Date().toISOString().split('T')[0],
    validity: new Date().toISOString().split('T')[0],
    companyName: DEFAULT_PROPOSAL_DATA.companyName,
    companyCnpj: DEFAULT_PROPOSAL_DATA.companyCnpj,
    companyAddress: DEFAULT_PROPOSAL_DATA.companyAddress,
    companyNeighborhood: DEFAULT_PROPOSAL_DATA.companyNeighborhood,
    companyCity: DEFAULT_PROPOSAL_DATA.companyCity,
    companyState: DEFAULT_PROPOSAL_DATA.companyState,
    companyZip: DEFAULT_PROPOSAL_DATA.companyZip,
    companyEmail: DEFAULT_PROPOSAL_DATA.companyEmail,
    companyPhone: DEFAULT_PROPOSAL_DATA.companyPhone,
    responsibleName: DEFAULT_PROPOSAL_DATA.responsibleName,
    items: [],
    observations: DEFAULT_PROPOSAL_DATA.observations,
    internalNotes: DEFAULT_PROPOSAL_DATA.internalNotes,
    logoUrl: undefined,
  };
  
  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues,
  });
  
  const { watch, handleSubmit, formState: { isDirty } } = form;
  const watchedData = watch();
  
  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const totalValue = (watchedData.items || []).reduce(
    (acc, item) => acc + (item.quantity * item.unitValue), 
    0
  );
  
  const status = currentStatus;
  
  // ============================================
  // HANDLERS
  // ============================================
  
  const handleClose = useCallback(() => {
    if (isDirty) {
      const confirm = window.confirm("Você tem alterações não salvas. Deseja sair mesmo assim?");
      if (!confirm) return;
    }
    
    if (onClose) {
      onClose();
    } else {
      router.push('/gs-propostas/dashboard');
    }
  }, [isDirty, onClose, router]);
  
  const handleSave = useCallback(() => {
    return handleSubmit(async (data: any) => {
      const formData = data as ProposalFormData;
      setIsSubmitting(true);
      try {
        let savedProposal;

        if (proposalId) {
          savedProposal = await proposalsApi.update(proposalId, formData);
        } else {
          savedProposal = await proposalsApi.create(formData);
        }
        
        toast.success(proposalId ? "Proposta atualizada!" : "Proposta criada com sucesso!");

        if (onSaveSuccess) {
          onSaveSuccess({
            ...DEFAULT_PROPOSAL_DATA,
            ...formData,
            id: savedProposal.id,
            items: formData.items || [],
            date: formData.date ? new Date(formData.date) : undefined,
            validity: formData.validity ? new Date(formData.validity) : undefined,
            status: (savedProposal.status as ProposalData['status']) || 'draft',
          });
        }
      } catch (error: any) {
        console.error("Erro ao salvar proposta:", error);
        toast.error(`Erro ao salvar: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    });
  }, [handleSubmit, proposalId, onSaveSuccess]);
  
  const handleExportPdf = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.exportToPdf();
    } else {
      toast.info("Editor de PDF não disponível");
    }
  }, []);
  
  const handleTogglePreview = useCallback(() => {
    if (isPreviewFullscreen) {
      setIsPreviewFullscreen(false);
    } else {
      setIsPreviewVisible(!isPreviewVisible);
    }
  }, [isPreviewFullscreen, isPreviewVisible]);

  const applyCompanyToForm = useCallback((company: Company | null) => {
    if (!company) {
      form.setValue('companyId', '');
      return;
    }

    const isJuridica = company.tipo === 'juridica';
    const displayName = isJuridica
      ? (company.nomeFantasia || company.razaoSocial || 'Empresa sem nome')
      : (company.nome || 'Pessoa sem nome');

    const addressLine = `${company.endereco}, ${company.numero}${company.complemento ? ` - ${company.complemento}` : ''}`;

    form.setValue('companyId', company.id);
    form.setValue('companyName', displayName);
    form.setValue('companyCnpj', company.cpfCnpj);
    form.setValue('companyAddress', addressLine);
    form.setValue('companyNeighborhood', company.bairro);
    form.setValue('companyCity', company.cidade);
    form.setValue('companyState', company.estado);
    form.setValue('companyZip', company.cep);
    form.setValue('companyEmail', company.contatoEmail);
    form.setValue('companyPhone', company.contatoTelefone);
    form.setValue('responsibleName', company.contatoNome);
  }, [form]);
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <FormProvider {...form}>
      <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Header */}
      <PropostaHeader
        code={watchedData.code || '...'}
        name={watchedData.name || 'Nova Proposta'}
        totalValue={totalValue}
        status={status}
        isPreviewFullscreen={isPreviewFullscreen}
        onTogglePreview={handleTogglePreview}
        onClose={handleClose}
      />

      {/* Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Left: Document Preview */}
          {isPreviewVisible && !isPreviewFullscreen && (
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70} className="border-r border-border flex flex-col min-h-0 relative">
              {/* Preview Header */}
              <div className="h-10 border-b border-border bg-muted/30 flex items-center justify-between px-3 shrink-0">
                <span className="text-xs font-medium text-muted-foreground">Visualização do Documento</span>
                <div className="flex items-center gap-1">
                  <button 
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                    title={isPreviewFullscreen ? "Sair do modo tela cheia" : "Tela cheia"}
                  >
                    {isPreviewFullscreen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              

              {/* Preview Content - ProposalDocumentEditor */}
              <ProposalDocumentEditor 
                ref={editorRef}
                className="flex-1" 
                data={{
                  code: watchedData.code,
                  name: watchedData.name,
                  clientName: watchedData.clientName,
                  contactName: watchedData.contactName,
                  companyName: watchedData.companyName,
                  companyCnpj: watchedData.companyCnpj,
                  companyAddress: watchedData.companyAddress,
                  companyNeighborhood: watchedData.companyNeighborhood,
                  companyCity: watchedData.companyCity,
                  companyState: watchedData.companyState,
                  companyZip: watchedData.companyZip,
                  companyEmail: watchedData.companyEmail,
                  companyPhone: watchedData.companyPhone,
                  responsibleName: watchedData.responsibleName,
                  validity: watchedData.validity ? new Date(watchedData.validity + 'T12:00:00') : undefined,
                  date: watchedData.date ? new Date(watchedData.date + 'T12:00:00') : creationDate,
                  status: currentStatus === 'won' ? 'Ganha' : currentStatus === 'lost' ? 'Perdida' : 'Aberto',
                  items: (watchedData.items || []).map((item, index) => ({
                    id: item.id || index.toString(),
                    description: item.description,
                    quantity: item.quantity || 0,
                    unitValue: item.unitValue || 0,
                    unit: item.unit || 'hora',
                    itemObservation: item.itemObservation
                  })),
                  observations: watchedData.observations,
                  logoUrl: watchedData.logoUrl
                }}
                isFullscreen={isPreviewFullscreen}
                onFullscreenChange={setIsPreviewFullscreen}
              />
            </ResizablePanel>
          )}

          {isPreviewFullscreen && (
            <div className="flex-1 flex flex-col min-h-0 border-r border-border">
              {/* Preview Header */}
              <div className="h-10 border-b border-border bg-muted/30 flex items-center justify-between px-3 shrink-0">
                <span className="text-xs font-medium text-muted-foreground">Visualização do Documento</span>
                <div className="flex items-center gap-1">
                  <button 
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsPreviewFullscreen(!isPreviewFullscreen)}
                    title={isPreviewFullscreen ? "Sair do modo tela cheia" : "Tela cheia"}
                  >
                    {isPreviewFullscreen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              {/* Preview Content - ProposalDocumentEditor */}
              <ProposalDocumentEditor 
                ref={editorRef}
                className="flex-1" 
                data={{
                  code: watchedData.code,
                  name: watchedData.name,
                  clientName: watchedData.clientName,
                  contactName: watchedData.contactName,
                  companyName: watchedData.companyName,
                  companyCnpj: watchedData.companyCnpj,
                  companyAddress: watchedData.companyAddress,
                  companyNeighborhood: watchedData.companyNeighborhood,
                  companyCity: watchedData.companyCity,
                  companyState: watchedData.companyState,
                  companyZip: watchedData.companyZip,
                  companyEmail: watchedData.companyEmail,
                  companyPhone: watchedData.companyPhone,
                  responsibleName: watchedData.responsibleName,
                  validity: watchedData.validity ? new Date(watchedData.validity + 'T12:00:00') : undefined,
                  date: watchedData.date ? new Date(watchedData.date + 'T12:00:00') : creationDate,
                  status: currentStatus === 'won' ? 'Ganha' : currentStatus === 'lost' ? 'Perdida' : 'Aberto',
                  items: (watchedData.items || []).map((item, index) => ({
                    id: item.id || index.toString(),
                    description: item.description,
                    quantity: item.quantity || 0,
                    unitValue: item.unitValue || 0,
                    unit: item.unit || 'hora',
                    itemObservation: item.itemObservation
                  })),
                  observations: watchedData.observations,
                  logoUrl: watchedData.logoUrl
                }}
                isFullscreen={isPreviewFullscreen}
                onFullscreenChange={setIsPreviewFullscreen}
              />
            </div>
          )}

          {isPreviewVisible && !isPreviewFullscreen && <ResizableHandle withHandle />}

          {/* Right: Tabs */}
          {!isPreviewFullscreen && (
            <ResizablePanel defaultSize={50} minSize={30} className="flex flex-col bg-background min-h-0 relative">
              <Tabs 
                value={activeTab} 
                onValueChange={(v) => setActiveTab(v as TabKey)} 
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                {/* Tabs Header */}
                <div className="px-4 md:px-6 pt-3 border-b border-border bg-card/50">
                  <TabsList className="bg-transparent h-auto p-0 gap-2 flex-wrap justify-start w-full">
                    {/* Primary Tabs (first 6) */}
                    {TABS.slice(0, 6).map((tab, index) => (
                      <div key={tab.key} className="flex items-center shrink-0">
                        {/* Separator between proposta and cadastro groups */}
                        {index === 3 && (
                          <div className="w-px h-4 bg-border mx-2 hidden md:block" />
                        )}
                        <TabsTrigger 
                          value={tab.key} 
                          className={cn(
                            "data-[state=active]:bg-transparent data-[state=active]:shadow-none",
                            "data-[state=active]:border-b-2 data-[state=active]:border-primary",
                            "rounded-none px-2 py-2 pb-3 flex-shrink-0",
                            "text-xs md:text-sm text-muted-foreground",
                            "data-[state=active]:text-primary font-medium",
                            "transition-colors hover:text-foreground",
                            "gap-2"
                          )}
                        >
                          <tab.icon className="h-4 w-4 shrink-0" />
                          <span>{tab.label}</span>
                        </TabsTrigger>
                      </div>
                    ))}
                    
                    {/* Overflow Tabs Dropdown */}
                    {TABS.length > 6 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            className={cn(
                              "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200",
                              "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                              TABS.slice(6).some(t => t.key === activeTab) && "text-primary bg-primary/10 ring-1 ring-primary/20",
                              "ml-1"
                            )}
                            title="Mais opções"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {TABS.slice(6).map((tab) => (
                            <DropdownMenuItem 
                              key={tab.key}
                              onClick={() => setActiveTab(tab.key)}
                              className={cn(
                                "gap-2 cursor-pointer",
                                activeTab === tab.key && "bg-primary/10 text-primary"
                              )}
                            >
                              <tab.icon className="h-4 w-4" />
                              {tab.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TabsList>
                </div>

                {/* Tab Content */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 pb-28">
                  {/* Tab Principal - IMPLEMENTADA */}
                  <TabsContent value="principal" className="mt-0">
                    <PrincipalTab
                      formData={{
                        ...DEFAULT_PROPOSAL_DATA,
                        code: watchedData.code || '',
                        name: watchedData.name || '',
                        // Fix: Convert string from form to Date for component
                        date: watchedData.date ? new Date(watchedData.date) : undefined,
                        paymentMode: watchedData.paymentMode,
                        // Fix: Convert string from form to Date for component
                        validity: watchedData.validity ? new Date(watchedData.validity) : undefined,
                        clientId: watchedData.clientId,
                        clientName: watchedData.clientName,
                        companyId: watchedData.companyId,
                        companyName: watchedData.companyName || '',
                        companyCnpj: watchedData.companyCnpj || '',
                        companyAddress: watchedData.companyAddress || '',
                        companyNeighborhood: watchedData.companyNeighborhood || '',
                        companyCity: watchedData.companyCity || '',
                        companyState: watchedData.companyState || '',
                        companyZip: watchedData.companyZip || '',
                        companyEmail: watchedData.companyEmail || '',
                        companyPhone: watchedData.companyPhone || '',
                        responsibleName: watchedData.responsibleName || '',
                        contactName: watchedData.contactName,
                        items: watchedData.items || [],
                        status: status,
                        logoUrl: watchedData.logoUrl
                      }}
                      onDataChange={(data) => {
                        Object.entries(data).forEach(([key, value]) => {
                          // Fix: If value is a Date, convert to ISO string (YYYY-MM-DD)
                          // This ensures consistency with ProposalFormData schema which expects strings
                          if (value instanceof Date) {
                            form.setValue(key as keyof ProposalFormData, value.toISOString().split('T')[0]);
                          } else {
                            form.setValue(key as keyof ProposalFormData, value as string | number);
                          }
                        });
                      }}
                      onStatusChange={setCurrentStatus}
                      onNavigateToClients={() => setActiveTab('clientes')}
                      onNavigateToCompanies={() => setActiveTab('empresas')}
                    />
                  </TabsContent>
                  
                  {/* Tab Clientes - IMPLEMENTADA */}
                  <TabsContent value="clientes" className="mt-0 h-full">
                    {activeTab === 'clientes' && (
                      <ClientesTab
                        selectedClientId={watchedData.clientId}
                        onClientSelect={(client: Cliente | null) => {
                          if (client) {
                            form.setValue('clientId', client.id);
                            form.setValue('clientName', client.nome);
                            setActiveTab('principal');
                          } else {
                            form.setValue('clientId', '');
                            form.setValue('clientName', '');
                          }
                        }}
                      />
                    )}
                  </TabsContent>
                  
                  {/* Tab Empresas - IMPLEMENTADA */}
                  <TabsContent value="empresas" className="mt-0 h-full">
                    {activeTab === 'empresas' && (
                      <EmpresasTab
                        selectedCompanyId={watchedData.companyId}
                        onCompanySelect={(company: Company | null) => {
                          applyCompanyToForm(company);
                          if (company) {
                            setActiveTab('principal');
                          }
                        }}
                      />
                    )}
                  </TabsContent>

                  
                  {/* Tab Itens - IMPLEMENTADA */}
                  <TabsContent value="itens" className="mt-0 h-full">
                    <ItensTab />
                  </TabsContent>

                  {/* Tab Observações - IMPLEMENTADA */}
                  <TabsContent value="observacoes" className="mt-0 h-full">
                    <ObservacoesTab 
                      observations={watchedData.observations || ''}
                      onChange={(val) => form.setValue('observations', val, { shouldDirty: true })}
                    />
                  </TabsContent>

                  {/* Tab Documentos - IMPLEMENTADA */}


                  {/* Tab Notas - IMPLEMENTADA */}
                  <TabsContent value="notas" className="mt-0 h-full">
                     {activeTab === 'notas' && <NotasTab />}
                  </TabsContent>

                   {/* Tab Assinaturas - IMPLEMENTADA */}
                   <TabsContent value="assinaturas" className="mt-0 h-full">
                    {activeTab === 'assinaturas' && <AssinaturasTab proposalId={proposalId} />}
                  </TabsContent>

                  {/* Tab Histórico - IMPLEMENTADA */}
                  <TabsContent value="historico" className="mt-0 h-full">
                    {activeTab === 'historico' && <HistoricoTab proposalId={proposalId} />}
                  </TabsContent>

                  {/* Outras tabs - PLACEHOLDERS */}
                  {TABS.filter(tab => 
                    tab.key !== 'principal' && 
                    tab.key !== 'clientes' && 
                    tab.key !== 'empresas' &&

                    tab.key !== 'itens' &&
                    tab.key !== 'observacoes' &&

                    tab.key !== 'notas' &&
                    tab.key !== 'assinaturas' &&
                    tab.key !== 'historico'
                  ).map((tab) => (
                    <TabsContent key={tab.key} value={tab.key} className="mt-0 h-full">
                      <div className="flex items-center justify-center h-full min-h-[300px] border border-dashed border-border rounded-lg bg-card">
                        <div className="text-center text-muted-foreground p-6">
                          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                            <tab.icon className="h-8 w-8 opacity-50" />
                          </div>
                          <p className="font-semibold text-lg">{tab.label}</p>
                          <p className="text-sm mt-2 max-w-sm mx-auto">
                            {tab.group === 'proposta' 
                              ? 'Conteúdo desta tab será implementado nas próximas specs.'
                              : 'Cadastros inline para uso durante a criação da proposta.'}
                          </p>
                          <p className="text-xs mt-3 text-muted-foreground/70">
                            @see SPEC-00{3 + TABS.findIndex(t => t.key === tab.key)}-{tab.key}.md
                          </p>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </ResizablePanel>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Footer */}
      <PropostaFooter
        onExportPdf={handleExportPdf}
        onClose={handleClose}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
      />
      </div>
    </FormProvider>
  );
}

// ============================================
// HELPERS
// ============================================


// Re-export types
export type { ProposalData, ProposalFormData, TabKey };
