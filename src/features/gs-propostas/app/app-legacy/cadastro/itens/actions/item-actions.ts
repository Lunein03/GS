'use server';

import { z } from 'zod';
import type { ActionResponse } from '@/types/actions';
import { itemFormSchema, type Item } from '../types/item.types';

// TODO (HIGH): [Database] Implementar integração com Drizzle ORM para persistência de dados
// TODO (HIGH): [Database] Criar queries para buscar, criar, atualizar e deletar itens
// TODO (MEDIUM): [Validation] Adicionar validação de SKU único ao criar/editar item
// TODO (MEDIUM): [Business Logic] Verificar se item está em uso antes de deletar

/**
 * Server action para criar um novo item
 */
export async function createItem(
  data: z.infer<typeof itemFormSchema>
): Promise<ActionResponse<Item>> {
  try {
    // Validar dados
    const validatedData = itemFormSchema.parse(data);

    // TODO: Implementar lógica de criação no banco de dados
    // const newItem = await db.insert(items).values({
    //   ...validatedData,
    //   active: true,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // }).returning();

    // Mock temporário para desenvolvimento
    const mockItem: Item = {
      id: crypto.randomUUID(),
      ...validatedData,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: mockItem,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos. Verifique os campos e tente novamente.',
          details: { errors: error.errors },
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'Erro ao criar item. Tente novamente.',
      },
    };
  }
}

/**
 * Server action para atualizar um item existente
 */
export async function updateItem(
  id: string,
  data: z.infer<typeof itemFormSchema>
): Promise<ActionResponse<Item>> {
  try {
    // Validar ID
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID do item é obrigatório',
        },
      };
    }

    // Validar dados
    const validatedData = itemFormSchema.parse(data);

    // TODO: Implementar lógica de atualização no banco de dados
    // const updatedItem = await db.update(items)
    //   .set({
    //     ...validatedData,
    //     updatedAt: new Date(),
    //   })
    //   .where(eq(items.id, id))
    //   .returning();

    // Mock temporário para desenvolvimento
    const mockItem: Item = {
      id,
      ...validatedData,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: mockItem,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos. Verifique os campos e tente novamente.',
          details: { errors: error.errors },
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'Erro ao atualizar item. Tente novamente.',
      },
    };
  }
}

/**
 * Server action para deletar um item (soft delete)
 */
export async function deleteItem(id: string): Promise<ActionResponse<void>> {
  try {
    // Validar ID
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID do item é obrigatório',
        },
      };
    }

    // TODO: Implementar verificação se item está em uso
    // const isInUse = await db.query.proposalItems.findFirst({
    //   where: eq(proposalItems.itemId, id),
    // });
    //
    // if (isInUse) {
    //   return {
    //     success: false,
    //     error: {
    //       code: 'ITEM_IN_USE',
    //       message: 'Item está sendo utilizado em propostas ativas',
    //     },
    //   };
    // }

    // TODO: Implementar soft delete no banco de dados
    // await db.update(items)
    //   .set({
    //     active: false,
    //     deletedAt: new Date(),
    //   })
    //   .where(eq(items.id, id));

    // Mock temporário para desenvolvimento
    // Simula sucesso da deleção
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'Erro ao deletar item. Tente novamente.',
      },
    };
  }
}
