"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { DocumentPreview } from "./document-preview";
import { Plus, Maximize2, RotateCw, FileText, Sparkles, X, Save } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const formSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Nome é obrigatório"),
  paymentMode: z.string().optional(),
  validity: z.string().optional(),
  clientName: z.string().optional(),
  contactName: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface NewOpportunityModalProps {
  children: React.ReactNode;
}

export function NewOpportunityModal({ children }: NewOpportunityModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "251203-1",
      name: "Nova Proposta",
      paymentMode: "",
      validity: new Date().toISOString().split('T')[0],
      clientName: "",
      contactName: "",
    },
  });

  const { register, control, watch, handleSubmit } = form;
  const watchedData = watch();

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    toast.success("Oportunidade salva com sucesso!");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 gap-0 flex flex-col bg-background overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-bold text-blue-600">#{watchedData.code || "..."}</span>
                <span>{watchedData.name.toUpperCase()} (VERSÃO INICIAL)</span>
                <span className="bg-muted px-2 py-0.5 rounded text-xs">R$ 0,00</span>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Maximize2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
            {/* Left: Preview */}
            <div className="w-[400px] border-r border-border bg-muted/30 p-4 hidden lg:block overflow-hidden flex-col">
                <DocumentPreview 
                    className="h-full shadow-sm" 
                    data={{
                        code: watchedData.code,
                        clientName: watchedData.clientName,
                        contactName: watchedData.contactName,
                        validity: watchedData.validity ? new Date(watchedData.validity) : undefined,
                        date: new Date(),
                    }}
                />
                <div className="flex justify-center gap-2 mt-4 shrink-0">
                     <Button size="icon" className="rounded-full bg-blue-600 hover:bg-blue-700 h-10 w-10">
                        <span className="sr-only">Chat</span>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                     </Button>
                     <Button size="icon" className="rounded-full bg-blue-500 hover:bg-blue-600 h-10 w-10">
                        <Sparkles className="w-5 h-5" />
                     </Button>
                     <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                        <RotateCw className="w-5 h-5" />
                     </Button>
                     <Button size="icon" variant="secondary" className="rounded-full h-10 w-10">
                        <Maximize2 className="w-5 h-5" />
                     </Button>
                </div>
            </div>

            {/* Right: Form */}
            <div className="flex-1 flex flex-col bg-background overflow-hidden">
                <Tabs defaultValue="principal" className="flex-1 flex flex-col">
                    <div className="px-6 pt-4 border-b border-border">
                        <TabsList className="bg-transparent h-auto p-0 gap-6">
                            <TabsTrigger value="principal" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium">Principal</TabsTrigger>
                            <TabsTrigger value="atividades" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium">Atividades</TabsTrigger>
                            <TabsTrigger value="itens" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium">Itens</TabsTrigger>
                            <TabsTrigger value="notas" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium">Notas</TabsTrigger>
                            <TabsTrigger value="anotacoes" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium">Anotações</TabsTrigger>
                            <TabsTrigger value="utilitarios" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium">Utilitários</TabsTrigger>
                            <TabsTrigger value="layout" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium">Layout</TabsTrigger>
                            <TabsTrigger value="historico" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium">Histórico</TabsTrigger>
                            <TabsTrigger value="documentos" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none px-0 pb-2 text-muted-foreground data-[state=active]:text-blue-600 font-medium">Documentos</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 bg-muted/10">
                        <TabsContent value="principal" className="mt-0 space-y-6">
                            {/* Status Bar */}
                            <div className="flex items-center rounded-lg overflow-hidden border border-border bg-card">
                                <div className="flex-1 bg-amber-400 text-white font-bold text-center py-2 text-sm uppercase tracking-wide">
                                    Aberto
                                </div>
                                <div className="flex-1 bg-muted text-muted-foreground font-medium text-center py-2 text-sm uppercase tracking-wide">
                                    Concluído
                                </div>
                                <div className="px-2 flex gap-2">
                                     <Button size="sm" variant="destructive" className="h-8">Perder</Button>
                                     <Button size="sm" className="h-8 bg-green-500 hover:bg-green-600">Ganhar</Button>
                                </div>
                            </div>

                            {/* Dados da Proposta */}
                            <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
                                <h3 className="text-lg font-medium text-foreground">Dados da Proposta</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div className="space-y-2">
                                        <Label>Código</Label>
                                        <Input {...register("code")} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Nome</Label>
                                        <Input {...register("name")} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Modo de Pagamento</Label>
                                        <Controller
                                            control={control}
                                            name="paymentMode"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger>
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
                                    <div className="space-y-2">
                                        <Label>Validade</Label>
                                        <Input type="date" {...register("validity")} />
                                    </div>
                                </div>
                            </div>

                            {/* Dados da Empresa e Cliente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Empresa */}
                                <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
                                    <h3 className="text-lg font-medium text-foreground">Dados da Empresa</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Empresa</Label>
                                            <div className="p-2 bg-muted border border-border rounded text-sm text-muted-foreground">
                                                GS PRODUÇÕES E ACESSIBILIDADE
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Responsável (Assinatura)</Label>
                                            <Input defaultValue="Contato Principal" disabled />
                                        </div>
                                    </div>
                                </div>

                                {/* Cliente */}
                                <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
                                    <h3 className="text-lg font-medium text-foreground">Dados do Cliente</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Cliente</Label>
                                            <Controller
                                                control={control}
                                                name="clientName"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <SelectTrigger className="text-muted-foreground">
                                                            <SelectValue placeholder="Clique para selecionar" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="cliente1">Cliente 1</SelectItem>
                                                            <SelectItem value="cliente2">Cliente 2</SelectItem>
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
                                                        <SelectTrigger>
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

                             {/* Collapsibles */}
                            <div className="space-y-2">
                                <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex items-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/50">
                                    <Plus className="w-4 h-4" />
                                    <span className="font-medium">Tags</span>
                                </div>
                                <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex items-center gap-2 text-muted-foreground cursor-pointer hover:bg-muted/50">
                                    <Plus className="w-4 h-4" />
                                    <span className="font-medium">Outras Informações</span>
                                </div>
                            </div>

                        </TabsContent>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-border bg-card flex justify-end gap-2 shrink-0">
                        <Button variant="outline" className="gap-2 bg-zinc-800 text-white hover:bg-zinc-700 hover:text-white border-zinc-800">
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
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={handleSubmit(onSubmit)}>
                            Salvar
                        </Button>
                    </div>
                </Tabs>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
