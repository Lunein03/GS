"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Opportunity } from "@/features/gs-propostas/domain/types";
import { updateOpportunity } from "@/features/gs-propostas/api/opportunities";
import { useQueryClient } from "@tanstack/react-query";
import { opportunityQueryKeys } from "@/features/gs-propostas/domain/query-keys";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  value: z.string().min(1, "Valor é obrigatório"),
  probability: z.coerce.number().min(0).max(100).optional(),
  nextStep: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email("Email inválido").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

interface EditOpportunityDialogProps {
  opportunity: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOpportunityDialog({ opportunity, open, onOpenChange }: EditOpportunityDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: opportunity.title,
      description: opportunity.description || "",
      value: opportunity.value || "0",
      probability: opportunity.probability || undefined,
      nextStep: opportunity.nextStep || "",
      clientName: opportunity.clientName || "",
      clientEmail: opportunity.clientEmail || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await updateOpportunity(opportunity.id, data);
      await queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.lists() });
      toast.success("Oportunidade atualizada com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao atualizar oportunidade");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Oportunidade</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" {...form.register("description")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input id="value" type="number" step="0.01" {...form.register("value")} />
              {form.formState.errors.value && (
                <p className="text-sm text-destructive">{form.formState.errors.value.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="probability">Probabilidade (%)</Label>
              <Input id="probability" type="number" min="0" max="100" {...form.register("probability")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextStep">Próximo Passo</Label>
            <Input id="nextStep" {...form.register("nextStep")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input id="clientName" {...form.register("clientName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Email do Cliente</Label>
              <Input id="clientEmail" type="email" {...form.register("clientEmail")} />
              {form.formState.errors.clientEmail && (
                <p className="text-sm text-destructive">{form.formState.errors.clientEmail.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
