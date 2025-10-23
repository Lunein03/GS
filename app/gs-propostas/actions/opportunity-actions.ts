"use server";

import { actionClient } from "@/app/actions/safe-action";
import { z } from "zod";
import { 
  updateOpportunityStatus, 
  createOpportunity, 
  deleteOpportunity 
} from "@/lib/services/opportunity-service";
import { revalidatePath } from "next/cache";

const updateStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WON', 'LOST']),
  userId: z.string().optional(),
});

export const updateOpportunityStatusAction = actionClient
  .schema(updateStatusSchema)
  .action(async ({ parsedInput }) => {
    try {
      await updateOpportunityStatus(
        parsedInput.id,
        parsedInput.status,
        parsedInput.userId
      );

      revalidatePath('/gs-propostas/dashboard');

      return {
        success: true,
        message: 'Status atualizado com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao atualizar status',
      };
    }
  });

const createOpportunitySchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  value: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Valor inválido'),
  clientName: z.string().optional(),
  clientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  probability: z.number().min(0).max(100).optional(),
  nextStep: z.string().optional(),
  responsibleUser: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const createOpportunityAction = actionClient
  .schema(createOpportunitySchema)
  .action(async ({ parsedInput }) => {
    try {
      const opportunity = await createOpportunity(parsedInput);

      revalidatePath('/gs-propostas/dashboard');

      return {
        success: true,
        message: 'Oportunidade criada com sucesso',
        data: opportunity,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao criar oportunidade',
      };
    }
  });

const deleteOpportunitySchema = z.object({
  id: z.string().uuid(),
});

export const deleteOpportunityAction = actionClient
  .schema(deleteOpportunitySchema)
  .action(async ({ parsedInput }) => {
    try {
      await deleteOpportunity(parsedInput.id);

      revalidatePath('/gs-propostas/dashboard');

      return {
        success: true,
        message: 'Oportunidade removida com sucesso',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao remover oportunidade',
      };
    }
  });
