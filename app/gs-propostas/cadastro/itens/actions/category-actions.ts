'use server';

import { z } from 'zod';
import type { ActionResponse } from '@/types/actions';
import { categoryFormSchema, type Category, itemErrors } from '../types/item.types';

// TODO (HIGH): [Database] Implementar integração com Drizzle ORM para persistência de categorias
// TODO (HIGH): [Database] Criar queries para buscar, criar, atualizar e deletar categorias
// TODO (MEDIUM): [Validation] Adicionar validação de nome único ao criar/editar categoria
// TODO (MEDIUM): [Business Logic] Verificar se categoria está em uso antes de deletar

/**
 * Server action para criar uma nova categoria
 */
export async function createCategory(
  data: z.infer<typeof categoryFormSchema>
): Promise<ActionResponse<Category>> {
  try {
    // Validar dados
    const validatedData = categoryFormSchema.parse(data);

    // TODO: Implementar verificação de nome único
    // const existingCategory = await db.query.categories.findFirst({
    //   where: eq(categories.name, validatedData.name),
    // });
    //
    // if (existingCategory) {
    //   return {
    //     success: false,
    //     error: itemErrors.DUPLICATE_CATEGORY_NAME,
    //   };
    // }

    // TODO: Implementar lógica de criação no banco de dados
    // const newCategory = await db.insert(categories).values({
    //   ...validatedData,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // }).returning();

    // Mock temporário para desenvolvimento
    const mockCategory: Category = {
      id: crypto.randomUUID(),
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: mockCategory,
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
        message: 'Erro ao criar categoria. Tente novamente.',
      },
    };
  }
}

/**
 * Server action para atualizar uma categoria existente
 */
export async function updateCategory(
  id: string,
  data: z.infer<typeof categoryFormSchema>
): Promise<ActionResponse<Category>> {
  try {
    // Validar ID
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID da categoria é obrigatório',
        },
      };
    }

    // Validar dados
    const validatedData = categoryFormSchema.parse(data);

    // TODO: Implementar verificação de nome único (exceto para a própria categoria)
    // const existingCategory = await db.query.categories.findFirst({
    //   where: and(
    //     eq(categories.name, validatedData.name),
    //     ne(categories.id, id)
    //   ),
    // });
    //
    // if (existingCategory) {
    //   return {
    //     success: false,
    //     error: itemErrors.DUPLICATE_CATEGORY_NAME,
    //   };
    // }

    // TODO: Implementar lógica de atualização no banco de dados
    // const updatedCategory = await db.update(categories)
    //   .set({
    //     ...validatedData,
    //     updatedAt: new Date(),
    //   })
    //   .where(eq(categories.id, id))
    //   .returning();

    // Mock temporário para desenvolvimento
    const mockCategory: Category = {
      id,
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: mockCategory,
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
        message: 'Erro ao atualizar categoria. Tente novamente.',
      },
    };
  }
}

/**
 * Server action para deletar uma categoria (soft delete)
 */
export async function deleteCategory(id: string): Promise<ActionResponse<void>> {
  try {
    // Validar ID
    if (!id || id.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ID da categoria é obrigatório',
        },
      };
    }

    // TODO: Implementar verificação se categoria está em uso
    // const itemsUsingCategory = await db.query.items.findMany({
    //   where: eq(items.categoryId, id),
    // });
    //
    // if (itemsUsingCategory.length > 0) {
    //   return {
    //     success: false,
    //     error: {
    //       code: 'CATEGORY_IN_USE',
    //       message: `Categoria está sendo utilizada por ${itemsUsingCategory.length} item(ns)`,
    //     },
    //   };
    // }

    // TODO: Implementar soft delete no banco de dados
    // await db.update(categories)
    //   .set({
    //     deletedAt: new Date(),
    //   })
    //   .where(eq(categories.id, id));

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
        message: 'Erro ao deletar categoria. Tente novamente.',
      },
    };
  }
}

/**
 * Função auxiliar para buscar todas as categorias ativas
 * (não é uma server action, mas uma função auxiliar)
 */
export async function getCategories(): Promise<Category[]> {
  // TODO: Implementar busca no banco de dados
  // const categories = await db.query.categories.findMany({
  //   where: isNull(categories.deletedAt),
  //   orderBy: [asc(categories.name)],
  // });
  //
  // return categories;

  // Mock temporário para desenvolvimento
  return [];
}
