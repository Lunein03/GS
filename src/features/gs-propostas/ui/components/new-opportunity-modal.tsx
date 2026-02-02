"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ProposalDocumentEditor, ProposalDocumentEditorRef } from "./proposal-document-editor";
import { Plus, Maximize2, Minimize2, RotateCw, FileText, Sparkles, X, Save, ChevronLeft, ChevronRight, UserPlus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { createOpportunity } from "@/features/gs-propostas/api/opportunities";
import { getClientes, createCliente } from "@/features/gs-propostas/api/clients";
import { Cliente, ClienteFormData } from "@/features/gs-propostas/app/app-legacy/cadastro/clientes/types/cliente";
import { ClienteForm } from "@/features/gs-propostas/app/app-legacy/cadastro/clientes/components/forms/cliente-form";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Textarea } from "@/shared/ui/textarea";

import ClientesPage from "@/features/gs-propostas/app/app-legacy/cadastro/clientes/page";
import EmpresasPage from "@/features/gs-propostas/app/app-legacy/cadastro/empresas/page";
import CategoriasPage from "@/features/gs-propostas/app/app-legacy/cadastro/categorias/page";
import PagamentosPage from "@/features/gs-propostas/app/app-legacy/cadastro/pagamentos/page";
import AssinaturasPage from "@/features/gs-propostas/app/app-legacy/cadastro/assinaturas/page";
import NotasCadastroPage from "@/features/gs-propostas/app/app-legacy/cadastro/notas/page";

const formSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  paymentMode: z.string().optional(),
  validity: z.string().optional(),
  clientName: z.string().optional(),
  contactName: z.string().optional(),
  items: z.array(z.object({
      description: z.string(),
      quantity: z.coerce.number(), 
      unitValue: z.coerce.number(),
  })).optional(),
  observations: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewOpportunityModalProps {
  children: React.ReactNode;
}

export function NewOpportunityModal({ children }: NewOpportunityModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  
  const editorRef = useRef<ProposalDocumentEditorRef>(null);
  const router = useRouter();

  const fetchClients = () => {
      setIsLoadingClients(true);
      getClientes({ page: 1, pageSize: 100 })
          .then(response => {
              if (response.success) {
                  setClients(response.data.clientes);
              }
          })
          .finally(() => setIsLoadingClients(false));
  };

  useEffect(() => {
      if (isOpen) {
          fetchClients();
      }
  }, [isOpen]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "251203-1",
      name: "Nova Proposta",
      paymentMode: "",
      validity: new Date().toISOString().split('T')[0],
      clientName: "",
      contactName: "",
      items: [
          { description: "Serviço de Intérprete de Libras - Diária", quantity: 2, unitValue: 1200 },
      ],
      observations: "Os objetivos na contratação dos intérpretes de Libras - português foram logrados, visando uma estrutura operacional para dar apoio a esse nicho da população.",
    },
  });

  const { register, control, watch, handleSubmit, setValue } = form;
  const { fields, append, remove } = useFieldArray({
      control,
      name: "items",
  });
  
  const watchedData = watch();

  const handleCreateClient = async (data: ClienteFormData) => {
    try {
        const response = await createCliente(data);
        if (response.success) {
            toast.success("Cliente cadastrado com sucesso!");
            setIsNewClientModalOpen(false);
            fetchClients(); // Refresh list
            setValue("clientName", response.data.nome); // Select new client
        } else {
            toast.error(response.error?.message || "Erro ao cadastrar cliente");
        }
    } catch (error) {
        console.error(error);
        toast.error("Erro inesperado ao criar cliente");
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
        await createOpportunity({
            title: data.name,
            value: data.items?.reduce((acc, item) => acc + (item.quantity * item.unitValue), 0).toString() || "0.00", 
            probability: 50,
            clientName: data.clientName,
            responsibleUser: data.contactName,
            description: `Código: ${data.code}\nValidade: ${data.validity}\nModo Pagamento: ${data.paymentMode}\n\nItens: ${JSON.stringify(data.items)}`,
        });
        toast.success("Oportunidade salva com sucesso!");
        setIsOpen(false);
        router.refresh();
    } catch (error) {
        console.error(error);
        toast.error("Erro ao salvar oportunidade");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      {/* Main Modal Content */}
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 gap-0 flex flex-col bg-background overflow-hidden [&>button]:hidden">
        <DialogTitle className="sr-only">Nova Proposta Comercial</DialogTitle>
        {/* Header */}
        <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-bold text-blue-600">#{watchedData.code || "..."}</span>
                <span>{watchedData.name.toUpperCase()} <span className="text-xs opacity-70">(VERSÃO INICIAL)</span></span>
                <span className="bg-muted px-2 py-0.5 rounded text-xs">R$ 0,00</span>
            </div>
            <div className="flex items-center gap-2">
                {/* Toggle Form Panel */}
                {isPreviewFullscreen && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsPreviewFullscreen(false)}
                    >
                        <ChevronRight className="h-4 w-4" />
                        Mostrar Formulário
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
            {/* Left: Document Editor */}
            <div className={cn(
                "border-r border-border hidden lg:flex flex-col overflow-hidden transition-all duration-300",
                isPreviewFullscreen ? "flex-1" : "w-[450px]",
                isFormCollapsed && !isPreviewFullscreen && "w-[450px]"
            )}>
                <ProposalDocumentEditor 
                    ref={editorRef}
                    className="h-full" 
                    data={{
                        code: watchedData.code,
                        name: watchedData.name,
                        clientName: watchedData.clientName,
                        contactName: watchedData.contactName,
                        validity: watchedData.validity ? new Date(watchedData.validity) : undefined,
                        date: new Date(),
                        status: "Aberto",
                        items: watchedData.items?.map((item, index) => ({
                            id: index.toString(),
                            description: item.description,
                            quantity: item.quantity || 0,
                            unitValue: item.unitValue || 0
                        })),
                        observations: watchedData.observations
                    }}
                    isFullscreen={isPreviewFullscreen}
                    onFullscreenChange={setIsPreviewFullscreen}
                />
            </div>

            {/* Right: Form */}
            <div className={cn(
                "flex flex-col bg-background overflow-hidden transition-all duration-300",
                isPreviewFullscreen ? "w-0 hidden" : "flex-1"
            )}>
                <Tabs defaultValue="principal" className="flex-1 flex flex-col">
                    <div className="px-6 pt-4 border-b border-border">
                        <TabsList className="bg-transparent h-auto p-0 gap-6 overflow-x-auto no-scrollbar justify-start w-full">
                            <TabsTrigger value="principal" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Principal</TabsTrigger>
                            <TabsTrigger value="itens" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Itens</TabsTrigger>
                            <TabsTrigger value="notas" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Obs.</TabsTrigger>
                            <TabsTrigger value="anotacoes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Anotações Int.</TabsTrigger>
                            <TabsTrigger value="documentos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Documentos</TabsTrigger>
                            <div className="w-px h-4 bg-border mx-2 shrink-0" />
                            <TabsTrigger value="clientes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Clientes</TabsTrigger>
                            <TabsTrigger value="empresas" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Empresas</TabsTrigger>
                            <TabsTrigger value="categorias" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Categorias</TabsTrigger>
                            <TabsTrigger value="pagamentos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Pagamentos</TabsTrigger>
                            <TabsTrigger value="assinaturas" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Assinaturas</TabsTrigger>
                            <TabsTrigger value="cad_notas" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium shrink-0">Cad. Notas</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
                        {/* Tab: Principal */}
                        <TabsContent value="principal" className="mt-0 space-y-6">
                            {/* Status Bar */}
                            <div className="flex items-center rounded-lg overflow-hidden border border-border bg-card p-1 gap-1">
                                <div 
                                    className="flex-1 bg-amber-400 text-black font-bold text-center py-2 text-sm uppercase tracking-wide flex items-center justify-center relative"
                                    style={{ clipPath: "polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%)" }}
                                >
                                    Aberto
                                </div>
                                <div 
                                    className="flex-1 bg-muted/50 text-muted-foreground font-medium text-center py-2 text-sm uppercase tracking-wide flex items-center justify-center relative"
                                    style={{ clipPath: "polygon(15px 0, 100% 0, 100% 100%, 15px 100%, 0 50%)" }}
                                >
                                    Concluído
                                </div>
                                <div className="px-2 flex gap-2 ml-2">
                                     <Button size="sm" variant="destructive" className="h-8 shadow-sm">Perder</Button>
                                     <Button size="sm" className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm">Ganhar</Button>
                                </div>
                            </div>

                            {/* Dados da Proposta */}
                            <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
                                <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                                    <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                                    Dados da Proposta
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Código</Label>
                                        <Input {...register("code")} className="bg-muted/30" />
                                    </div>
                                    <div className="space-y-2 md:col-span-5">
                                        <Label>Nome</Label>
                                        <Input {...register("name")} className="bg-muted/30" />
                                    </div>
                                    <div className="space-y-2 md:col-span-3">
                                        <Label>Modo de Pagamento</Label>
                                        <Controller
                                            control={control}
                                            name="paymentMode"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="bg-muted/30">
                                                        <SelectValue placeholder="Selecione" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="boleto">Boleto</SelectItem>
                                                        <SelectItem value="pix">PIX</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Validade</Label>
                                        <Input type="date" {...register("validity")} className="bg-muted/30" />
                                    </div>
                                </div>
                            </div>

                            {/* Dados da Empresa e Cliente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Empresa */}
                                <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
                                    <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                                        <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                                        Dados da Empresa
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Empresa</Label>
                                            <div className="h-10 px-3 flex items-center bg-muted/30 border border-border rounded-md text-sm text-foreground">
                                                GS PRODUÇÕES E ACESSIBILIDADE
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Responsável (Assinatura)</Label>
                                            <Input defaultValue="Contato Principal" disabled className="bg-muted/30" />
                                        </div>
                                    </div>
                                </div>

                                {/* Cliente */}
                                <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                                            <span className="w-1 h-4 bg-pink-500 rounded-full"></span>
                                            Dados do Cliente
                                        </h3>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-7 gap-2 text-xs"
                                            onClick={() => setIsNewClientModalOpen(true)}
                                            type="button"
                                        >
                                            <UserPlus className="w-3 H-3" />
                                            Novo Cliente
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Cliente</Label>
                                            <Controller
                                                control={control}
                                                name="clientName"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingClients}>
                                                        <SelectTrigger className="text-muted-foreground bg-muted/30">
                                                            <SelectValue placeholder={isLoadingClients ? "Carregando..." : "Clique para selecionar"} />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {clients.map((client) => (
                                                                <SelectItem key={client.id} value={client.nome}>
                                                                    {client.nome}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contato</Label>
                                            <Controller
                                                control={control}
                                                name="contactName"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="bg-muted/30">
                                                            <SelectValue placeholder="Contato Principal" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="contato1">Contato Principal</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Itens */}
                        <TabsContent value="itens" className="mt-0 h-full flex flex-col">
                            <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col flex-1 overflow-hidden">
                                <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                        Itens da Proposta
                                    </h3>
                                    <Button size="sm" onClick={() => append({ description: "Novo Item", quantity: 1, unitValue: 0 })} className="gap-2">
                                        <Plus className="w-4 h-4" /> Adicionar Item
                                    </Button>
                                </div>
                                
                                <div className="flex-1 overflow-auto p-0">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 sticky top-0 z-10">
                                            <tr className="border-b border-border text-left">
                                                <th className="p-3 font-medium text-muted-foreground w-12">#</th>
                                                <th className="p-3 font-medium text-muted-foreground">Descrição</th>
                                                <th className="p-3 font-medium text-muted-foreground w-24">Qtd</th>
                                                <th className="p-3 font-medium text-muted-foreground w-32">Valor Unit.</th>
                                                <th className="p-3 font-medium text-muted-foreground w-32 text-right">Total</th>
                                                <th className="p-3 font-medium text-muted-foreground w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {fields.map((field, index) => {
                                                // Watch values for calculation
                                                const quantity = watchedData.items?.[index]?.quantity || 0;
                                                const unitValue = watchedData.items?.[index]?.unitValue || 0;
                                                const total = quantity * unitValue;

                                                return (
                                                    <tr key={field.id} className="group hover:bg-muted/20 transition-colors">
                                                        <td className="p-3 text-muted-foreground text-center">{index + 1}</td>
                                                        <td className="p-3">
                                                            <Input 
                                                                {...register(`items.${index}.description` as const)} 
                                                                className="h-8 bg-transparent border-transparent hover:border-border focus:border-primary focus:bg-background px-2"
                                                                placeholder="Descrição do serviço/produto"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                            <Input 
                                                                type="text" // using text to prevent scroll wheel changes
                                                                {...register(`items.${index}.quantity` as const)}
                                                                className="h-8 bg-transparent border-transparent hover:border-border focus:border-primary focus:bg-background px-2 text-center"
                                                            />
                                                        </td>
                                                        <td className="p-3">
                                                             <div className="relative">
                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
                                                                <Input 
                                                                    type="text"
                                                                    {...register(`items.${index}.unitValue` as const)}
                                                                    className="h-8 bg-transparent border-transparent hover:border-border focus:border-primary focus:bg-background pl-7 pr-2 text-right"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="p-3 text-right font-medium">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => remove(index)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {fields.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                        Nenhum item adicionado. Clique em "Adicionar Item" para começar.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot className="bg-muted/50 font-medium">
                                            <tr>
                                                <td colSpan={4} className="p-3 text-right text-muted-foreground">Total Geral:</td>
                                                <td className="p-3 text-right text-foreground">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                        watchedData.items?.reduce((acc, item) => acc + ((Number(item.quantity) || 0) * (Number(item.unitValue) || 0)), 0) || 0
                                                    )}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>

                        {/* Tab: Notas/Anotações */}
                         <TabsContent value="notas" className="mt-0 h-full flex flex-col">
                            <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col flex-1 overflow-hidden">
                                <div className="p-4 border-b border-border bg-muted/30">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
                                        Notas & Observações
                                    </h3>
                                </div>
                                <div className="flex-1 p-4">
                                    <Label className="mb-2 block">Observações do Documento</Label>
                                    <Textarea 
                                        {...register("observations")} 
                                        className="h-full min-h-[200px] resize-none bg-muted/30 font-mono text-sm leading-relaxed" 
                                        placeholder="Digite as observações que aparecerão no rodapé da proposta..."
                                    />
                                </div>
                            </div>
                        </TabsContent>

                         {/* Tab: Anotações (Renaming existing tab content if needed, or just reusing Layout/etc) */}
                         <TabsContent value="anotacoes" className="mt-0">
                            <div className="p-4 text-center text-muted-foreground">
                                Área para anotações internas (não visíveis ao cliente).
                            </div>
                         </TabsContent>

                        {/* TAB: Clientes (Imported) */}
                         <TabsContent value="clientes" className="mt-0">
                            <ClientesPage />
                         </TabsContent>

                         {/* TAB: Empresas (Imported) */}
                         <TabsContent value="empresas" className="mt-0">
                            <EmpresasPage />
                         </TabsContent>

                        {/* TAB: Categorias (Imported) */}
                        <TabsContent value="categorias" className="mt-0">
                            <CategoriasPage />
                        </TabsContent>

                        {/* TAB: Pagamentos (Imported) */}
                        <TabsContent value="pagamentos" className="mt-0">
                            <PagamentosPage />
                        </TabsContent>

                        {/* TAB: Assinaturas (Imported) */}
                        <TabsContent value="assinaturas" className="mt-0">
                            <AssinaturasPage />
                        </TabsContent>

                        {/* TAB: Cad. Notas (Imported) */}
                        <TabsContent value="cad_notas" className="mt-0">
                            <NotasCadastroPage />
                        </TabsContent>

                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border bg-card flex justify-end gap-2 shrink-0">
                        <Button 
                            variant="outline" 
                            className="gap-2 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white border-zinc-800"
                            onClick={() => editorRef.current?.exportToPdf()}
                        >
                            <FileText className="w-4 h-4" />
                            PDF
                        </Button>
                        <Button variant="outline" className="gap-2 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white border-zinc-800">
                            <Sparkles className="w-4 h-4" />
                            Assistente de IA
                        </Button>
                        <Button variant="destructive" onClick={() => setIsOpen(false)}>
                            Fechar
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Salvar
                        </Button>
                    </div>
                </Tabs>
            </div>
        </div>
      </DialogContent>

      {/* New Client Modal */}
      <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
        <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogTitle>Novo Cliente</DialogTitle>
            <div className="py-4">
                <ClienteForm
                    onSubmit={handleCreateClient}
                    onCancel={() => setIsNewClientModalOpen(false)}
                />
            </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
