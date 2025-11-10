"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createOpportunity } from "@/features/gs-propostas/api/opportunities";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Loader2 } from "lucide-react";

interface OpportunityFormData {
  title: string;
  description: string;
  value: string;
  clientName: string;
  clientEmail: string;
  probability: number;
  nextStep: string;
  responsibleUser: string;
}

export function CreateOpportunityForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpportunityFormData>({
    defaultValues: {
      probability: 50,
    },
  });

  const onSubmit = async (data: OpportunityFormData) => {
    setIsSubmitting(true);

    try {
      await createOpportunity({
        title: data.title,
        description: data.description?.trim() || null,
        value: data.value,
        probability: Number.isFinite(data.probability) ? data.probability : null,
        nextStep: data.nextStep?.trim() || null,
        clientName: data.clientName?.trim() || null,
        clientEmail: data.clientEmail?.trim() || null,
        responsibleUser: data.responsibleUser?.trim() || null,
      });

      toast.success("Oportunidade criada com sucesso!");
      router.push("/gs-propostas/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar oportunidade");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Informações da Oportunidade</CardTitle>
          <CardDescription>
            Preencha os dados principais da oportunidade comercial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Ex: Projeto de Produção Audiovisual"
              {...register("title", {
                required: "Título é obrigatório",
                minLength: {
                  value: 3,
                  message: "Título deve ter no mínimo 3 caracteres",
                },
              })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva os detalhes da oportunidade..."
              rows={4}
              {...register("description")}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="value">
                Valor Estimado (R$) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("value", {
                  required: "Valor é obrigatório",
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: "Valor inválido",
                  },
                })}
              />
              {errors.value && (
                <p className="text-sm text-destructive">{errors.value.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">Probabilidade (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                placeholder="50"
                {...register("probability", {
                  valueAsNumber: true,
                  min: { value: 0, message: "Mínimo 0%" },
                  max: { value: 100, message: "Máximo 100%" },
                })}
              />
              {errors.probability && (
                <p className="text-sm text-destructive">{errors.probability.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <Input
              id="clientName"
              placeholder="Ex: Empresa XYZ Ltda"
              {...register("clientName")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email do Cliente</Label>
            <Input
              id="clientEmail"
              type="email"
              placeholder="contato@empresa.com"
              {...register("clientEmail")}
            />
            {errors.clientEmail && (
              <p className="text-sm text-destructive">{errors.clientEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsibleUser">Responsável</Label>
            <Input
              id="responsibleUser"
              placeholder="Nome do responsável"
              {...register("responsibleUser")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextStep">Próximo Passo</Label>
            <Input
              id="nextStep"
              placeholder="Ex: Agendar reunião de apresentação"
              {...register("nextStep")}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Oportunidade
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}


