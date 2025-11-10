'use server';

import { db } from '@/lib/db/client';
import { opportunities, opportunityActivities } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { OpportunityStatus } from '@/app/gs-propostas/types';

export async function getOpportunities() {
  try {
    const result = await db
      .select()
      .from(opportunities)
      .orderBy(desc(opportunities.createdAt));
    
    return result;
  } catch (error) {
    console.error('Erro ao buscar oportunidades:', error);
    throw new Error('Falha ao carregar oportunidades');
  }
}

export async function getOpportunityById(id: string) {
  try {
    const result = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.id, id))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error('Erro ao buscar oportunidade:', error);
    throw new Error('Falha ao carregar oportunidade');
  }
}

export async function updateOpportunityStatus(
  id: string,
  newStatus: OpportunityStatus,
  userId?: string
) {
  try {
    // Buscar status atual
    const current = await getOpportunityById(id);
    if (!current) {
      throw new Error('Oportunidade não encontrada');
    }

    // Atualizar status
    await db
      .update(opportunities)
      .set({
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(opportunities.id, id));

    // Registrar atividade
    await db.insert(opportunityActivities).values({
      opportunityId: id,
      action: 'status_changed',
      fromStatus: current.status,
      toStatus: newStatus,
      userId: userId || 'system',
      createdAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status da oportunidade:', error);
    throw new Error('Falha ao atualizar status');
  }
}

export async function createOpportunity(data: {
  title: string;
  description?: string;
  value: string;
  clientName?: string;
  clientEmail?: string;
  probability?: number;
  nextStep?: string;
  responsibleUser?: string;
  tags?: string[];
}) {
  try {
    const result = await db
      .insert(opportunities)
      .values({
        ...data,
        status: 'OPEN',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Registrar atividade de criação
    await db.insert(opportunityActivities).values({
      opportunityId: result[0].id,
      action: 'created',
      toStatus: 'OPEN',
      userId: data.responsibleUser || 'system',
      createdAt: new Date(),
    });

    return result[0];
  } catch (error) {
    console.error('Erro ao criar oportunidade:', error);
    throw new Error('Falha ao criar oportunidade');
  }
}

export async function deleteOpportunity(id: string) {
  try {
    await db.delete(opportunities).where(eq(opportunities.id, id));
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar oportunidade:', error);
    throw new Error('Falha ao deletar oportunidade');
  }
}
