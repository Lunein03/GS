"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  FileSignature, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCheck 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

// Types derived from backend schema
type SignatureType = "govbr" | "custom";
type SignatureStatus = "pending" | "verified" | "revoked";

interface ProposalSignature {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone?: string;
  signature_type: SignatureType;
  status: SignatureStatus;
  govbr_identifier?: string;
  created_at: string;
}

const signatureFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  signature_type: z.enum(["govbr", "custom"]),
});

type SignatureFormData = z.infer<typeof signatureFormSchema>;

interface AssinaturasTabProps {
  proposalId?: string;
}

export function AssinaturasTab({ proposalId }: AssinaturasTabProps) {
  const [signatures, setSignatures] = useState<ProposalSignature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignatureFormData>({
    resolver: zodResolver(signatureFormSchema),
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      phone: "",
      signature_type: "custom",
    },
  });

  const fetchSignatures = useCallback(async () => {
    if (!proposalId) return;
    
    try {
      setIsLoading(true);
      // Using the global signatures list filtered by logic or expecting backend to support filtering
      // Since the backend route generic list_signatures returns ALL, we should ideally have filtering.
      // However, looking at the backend code, list_signatures returns ALL non-deleted signatures. 
      // There is NO filter by proposal_id in 'list_signatures' in proposals.py!
      // We must filter client-side for now or Fix the backend.
      // Let's filter client-side as a temporary fix, but ideally backend should accept query param.
      
      const response = await fetch(`http://localhost:8000/proposals/signatures`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      // Filter by proposal_id
      const proposalSignatures = data.filter((s: any) => s.proposal_id === proposalId);
      setSignatures(proposalSignatures);
      
    } catch (error) {
      console.error("Erro ao carregar assinaturas:", error);
      toast.error("Erro ao carregar assinaturas.");
    } finally {
      setIsLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    fetchSignatures();
  }, [fetchSignatures]);

  const onSubmit = async (data: SignatureFormData) => {
    if (!proposalId) {
      toast.error("Salve a proposta antes de adicionar assinaturas.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8000/proposals/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          proposal_id: proposalId
        })
      });
      
      if (!response.ok) throw new Error('Falha ao criar assinatura');
      const savedSignature = await response.json();
      
      setSignatures(prev => [savedSignature, ...prev]);
      toast.success("Assinatura adicionada com sucesso!");
      setIsDialogOpen(false);
      form.reset();

    } catch (error) {
      console.error("Erro ao adicionar assinatura:", error);
      toast.error("Erro ao adicionar assinatura.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta assinatura?")) return;
    
    try {
      const response = await fetch(`http://localhost:8000/proposals/signatures/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Falha ao deletar");
      
      setSignatures(prev => prev.filter(s => s.id !== id));
      toast.success("Assinatura removida.");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao remover assinatura");
    }
  };

  if (!proposalId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg bg-muted/30">
        <FileSignature className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Salvar Proposta Necessário</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Você precisa salvar a proposta pela primeira vez antes de gerenciar assinaturas digitais.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Assinaturas Digitais</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie os signatários e status das assinaturas desta proposta.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Assinatura
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adicionar Signatário</DialogTitle>
              <DialogDescription>
                Adicione um responsável para assinar esta proposta digitalmente.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="signature_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Assinatura</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="custom">
                            <span className="flex items-center gap-2">
                              <FileSignature className="h-4 w-4" />
                              Assinatura Interna (GS Produções)
                            </span>
                          </SelectItem>
                          <SelectItem value="govbr">
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-green-600" />
                              Assinatura Gov.br (ICP-Brasil)
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                         {field.value === 'govbr' 
                           ? "Certificado digital ICP-Brasil via integração Gov.br."
                           : "Assinatura eletrônica simples com registro de IP e timestamp."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="cliente@empresa.com" {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('signature_type') === 'govbr' && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md flex gap-3 text-sm text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-medium">Integração Gov.br</p>
                      <p className="mt-1 text-xs">O signatário receberá um link seguro para autenticar e assinar via Gov.br.</p>
                    </div>
                  </div>
                )}
                
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Adicionar Signatário
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : signatures.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mb-4 shadow-sm">
              <ShieldCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">Nenhuma assinatura ainda</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Adicione signatários para iniciar o processo de assinatura eletrônica.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {signatures.map((sig) => (
            <Card key={sig.id} className="overflow-hidden transition-all hover:shadow-md border-l-4 border-l-transparent hover:border-l-primary">
              <div className="flex items-center p-4 gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  sig.status === 'verified' 
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                    : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                )}>
                  {sig.status === 'verified' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Clock className="h-5 w-5" /> // Using a simpler icon if loader not imported, checking imports... Clock added below
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{sig.name}</h4>
                    <Badge variant={sig.signature_type === 'govbr' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5">
                      {sig.signature_type === 'govbr' ? 'Gov.br' : 'Interno'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-4">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="opacity-70">CPF:</span> {sig.cpf}
                    </span>
                    <span className="hidden sm:flex items-center gap-1.5 truncate">
                      <span className="opacity-70">Email:</span> {sig.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className={cn(
                      "text-sm font-medium",
                       sig.status === 'verified' ? "text-emerald-600" : "text-amber-600"
                    )}>
                      {sig.status === 'verified' ? 'Assinado' : 'Pendente'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(sig.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(sig.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Footer / Actions Bar if needed */}
              {sig.status === 'pending' && (
                <div className="bg-muted/30 px-4 py-2 flex justify-end">
                   <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                     Reenviar link de assinatura
                   </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
        <FileCheck className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">Sobre a Assinatura Digital</p>
          <p className="opacity-90 mt-1">
            As assinaturas coletadas possuem validade jurídica conforme MP 2.200-2/2001. 
            Todas as ações são registradas com IP, timestamp e hash do documento.
          </p>
        </div>
      </div>
    </div>
  );
}

// Icon helper
function Clock({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
