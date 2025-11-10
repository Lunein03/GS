'use server';

import { actionClient } from '@/app/actions/safe-action';
import { db } from '@/lib/db/client';
import { clients, clientSecondaryContacts } from '@/lib/db/schema';
import { eq, and, or, like, isNull, sql } from 'drizzle-orm';
import type { ActionResponse } from '@/types/actions';
import {
  checkDocumentExistsSchema,
  createClienteSchema,
  deleteClienteSchema,
  getClienteByIdSchema,
  getClientesSchema,
  updateClienteSchema,
  createContatoSecundarioSchema,
  updateContatoSecundarioSchema,
  deleteContatoSecundarioSchema,
  type CheckDocumentExistsInput,
  type CreateClienteInput,
  type DeleteClienteInput,
  type GetClienteByIdInput,
  type GetClientesInput,
  type UpdateClienteInput,
  type CreateContatoSecundarioInput,
  type UpdateContatoSecundarioInput,
  type DeleteContatoSecundarioInput,
} from '../types/cliente-schemas';

type ClienteData = typeof clients.$inferSelect;
type ContatoSecundarioData = typeof clientSecondaryContacts.$inferSelect;

// ============================================
// HELPER FUNCTIONS
// ============================================

function sanitizeDocument(doc: string): string {
  return doc.replace(/\D/g, '');
}

// ============================================
// SERVER ACTIONS - CLIENTES
// ============================================

/**
 * Cria um novo cliente no sistema
 * Valida se o CPF/CNPJ já existe antes de criar
 */
export const createCliente = actionClient(
  createClienteSchema,
  async (input: CreateClienteInput): Promise<ActionResponse<ClienteData>> => {
    try {
      // Sanitizar documento
      const cleanCpfCnpj = sanitizeDocument(input.cpfCnpj);

      // Verificar se documento já existe
      const existing = await db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.cpfCnpj, cleanCpfCnpj),
            isNull(clients.deletedAt)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'CPF/CNPJ já cadastrado',
          },
        };
      }

      // Criar cliente
      const [newCliente] = await db
        .insert(clients)
        .values({
          tipo: input.tipo,
          cpfCnpj: cleanCpfCnpj,
          nome: input.nome,
          cargo: input.cargo || null,
          cep: input.cep,
          endereco: input.endereco,
          numero: input.numero,
          complemento: input.complemento || null,
          bairro: input.bairro,
          cidade: input.cidade,
          estado: input.estado,
          contatoNome: input.contatoNome,
          contatoEmail: input.contatoEmail,
          contatoTelefone: input.contatoTelefone,
          ativo: input.ativo ? 1 : 0,
        })
        .returning();

      return {
        success: true,
        data: newCliente,
      };
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      
      // Verificar erro de unique constraint
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'CPF/CNPJ já cadastrado',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao criar cliente. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Atualiza um cliente existente
 * Valida se o CPF/CNPJ já existe em outro registro
 */
export const updateCliente = actionClient(
  updateClienteSchema,
  async (input: UpdateClienteInput): Promise<ActionResponse<ClienteData>> => {
    try {
      const { id, ...data } = input;

      // Sanitizar documento
      const cleanCpfCnpj = sanitizeDocument(data.cpfCnpj);

      // Verificar se documento já existe em outro registro
      const existing = await db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.cpfCnpj, cleanCpfCnpj),
            sql`${clients.id} != ${id}`,
            isNull(clients.deletedAt)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'CPF/CNPJ já cadastrado em outro cliente',
          },
        };
      }

      // Atualizar cliente
      const [updatedCliente] = await db
        .update(clients)
        .set({
          tipo: data.tipo,
          cpfCnpj: cleanCpfCnpj,
          nome: data.nome,
          cargo: data.cargo || null,
          cep: data.cep,
          endereco: data.endereco,
          numero: data.numero,
          complemento: data.complemento || null,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          contatoNome: data.contatoNome,
          contatoEmail: data.contatoEmail,
          contatoTelefone: data.contatoTelefone,
          ativo: data.ativo ? 1 : 0,
          updatedAt: new Date(),
        })
        .where(eq(clients.id, id))
        .returning();

      if (!updatedCliente) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cliente não encontrado',
          },
        };
      }

      return {
        success: true,
        data: updatedCliente,
      };
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);

      // Verificar erro de unique constraint
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'CPF/CNPJ já cadastrado em outro cliente',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao atualizar cliente. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Remove um cliente (soft delete)
 * Marca o cliente como deletado sem remover do banco
 */
export const deleteCliente = actionClient(
  deleteClienteSchema,
  async (input: DeleteClienteInput): Promise<ActionResponse<{ id: string }>> => {
    try {
      const { id } = input;

      // Soft delete - marcar como deletado
      const [deletedCliente] = await db
        .update(clients)
        .set({
          deletedAt: new Date(),
          ativo: 0,
        })
        .where(
          and(
            eq(clients.id, id),
            isNull(clients.deletedAt)
          )
        )
        .returning();

      if (!deletedCliente) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cliente não encontrado',
          },
        };
      }

      return {
        success: true,
        data: { id },
      };
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao remover cliente. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Busca clientes com filtros e paginação
 */
export const getClientes = actionClient(
  getClientesSchema,
  async (input: GetClientesInput): Promise<ActionResponse<{
    clientes: ClienteData[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }>> => {
    try {
      const { search, tipo, status, estado, page, pageSize } = input;

      // Construir condições de filtro
      const conditions = [isNull(clients.deletedAt)];

      if (search) {
        conditions.push(
          or(
            like(clients.nome, `%${search}%`),
            like(clients.cpfCnpj, `%${search}%`),
            like(clients.contatoNome, `%${search}%`),
            like(clients.contatoEmail, `%${search}%`)
          )!
        );
      }

      if (tipo) {
        conditions.push(eq(clients.tipo, tipo));
      }

      if (status) {
        conditions.push(eq(clients.ativo, status === 'ativo' ? 1 : 0));
      }

      if (estado) {
        conditions.push(eq(clients.estado, estado));
      }

      // Buscar clientes com paginação
      const offset = (page - 1) * pageSize;

      const [results, countResult] = await Promise.all([
        db
          .select()
          .from(clients)
          .where(and(...conditions))
          .orderBy(clients.createdAt)
          .limit(pageSize)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(clients)
          .where(and(...conditions)),
      ]);

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / pageSize);

      return {
        success: true,
        data: {
          clientes: results,
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao buscar clientes. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Busca um cliente específico por ID
 */
export const getClienteById = actionClient(
  getClienteByIdSchema,
  async (input: GetClienteByIdInput): Promise<ActionResponse<ClienteData>> => {
    try {
      const { id } = input;

      const [cliente] = await db
        .select()
        .from(clients)
        .where(
          and(
            eq(clients.id, id),
            isNull(clients.deletedAt)
          )
        )
        .limit(1);

      if (!cliente) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Cliente não encontrado',
          },
        };
      }

      return {
        success: true,
        data: cliente,
      };
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao buscar cliente. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Verifica se um CPF/CNPJ já existe no sistema
 * Útil para validação em tempo real no formulário
 */
export const checkDocumentExists = actionClient(
  checkDocumentExistsSchema,
  async (input: CheckDocumentExistsInput): Promise<ActionResponse<{ exists: boolean }>> => {
    try {
      const { cpfCnpj, excludeId } = input;

      // Sanitizar documento
      const cleanCpfCnpj = sanitizeDocument(cpfCnpj);

      // Construir condições
      const conditions = [
        eq(clients.cpfCnpj, cleanCpfCnpj),
        isNull(clients.deletedAt),
      ];

      if (excludeId) {
        conditions.push(sql`${clients.id} != ${excludeId}`);
      }

      const [existing] = await db
        .select()
        .from(clients)
        .where(and(...conditions))
        .limit(1);

      return {
        success: true,
        data: {
          exists: !!existing,
        },
      };
    } catch (error) {
      console.error('Erro ao verificar documento:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao verificar documento. Tente novamente.',
        },
      };
    }
  }
);

// ============================================
// SERVER ACTIONS - CONTATOS SECUNDÁRIOS
// ============================================

/**
 * Cria um novo contato secundário para um cliente
 */
export const createContatoSecundario = actionClient(
  createContatoSecundarioSchema,
  async (input: CreateContatoSecundarioInput): Promise<ActionResponse<ContatoSecundarioData>> => {
    try {
      const [newContato] = await db
        .insert(clientSecondaryContacts)
        .values({
          clientId: input.clientId,
          nome: input.nome,
          email: input.email || null,
          telefone: input.telefone || null,
          cargo: input.cargo || null,
        })
        .returning();

      return {
        success: true,
        data: newContato,
      };
    } catch (error) {
      console.error('Erro ao criar contato secundário:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao criar contato secundário. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Atualiza um contato secundário existente
 */
export const updateContatoSecundario = actionClient(
  updateContatoSecundarioSchema,
  async (input: UpdateContatoSecundarioInput): Promise<ActionResponse<ContatoSecundarioData>> => {
    try {
      const { id, ...data } = input;

      const [updatedContato] = await db
        .update(clientSecondaryContacts)
        .set({
          nome: data.nome,
          email: data.email || null,
          telefone: data.telefone || null,
          cargo: data.cargo || null,
          updatedAt: new Date(),
        })
        .where(eq(clientSecondaryContacts.id, id))
        .returning();

      if (!updatedContato) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Contato secundário não encontrado',
          },
        };
      }

      return {
        success: true,
        data: updatedContato,
      };
    } catch (error) {
      console.error('Erro ao atualizar contato secundário:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao atualizar contato secundário. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Remove um contato secundário
 */
export const deleteContatoSecundario = actionClient(
  deleteContatoSecundarioSchema,
  async (input: DeleteContatoSecundarioInput): Promise<ActionResponse<{ id: string }>> => {
    try {
      const { id } = input;

      await db
        .delete(clientSecondaryContacts)
        .where(eq(clientSecondaryContacts.id, id));

      return {
        success: true,
        data: { id },
      };
    } catch (error) {
      console.error('Erro ao remover contato secundário:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao remover contato secundário. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Busca todos os contatos secundários de um cliente
 */
export const getContatosSecundarios = async (
  clientId: string
): Promise<ActionResponse<ContatoSecundarioData[]>> => {
  try {
    const contatos = await db
      .select()
      .from(clientSecondaryContacts)
      .where(eq(clientSecondaryContacts.clientId, clientId))
      .orderBy(clientSecondaryContacts.createdAt);

    return {
      success: true,
      data: contatos,
    };
  } catch (error) {
    console.error('Erro ao buscar contatos secundários:', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'Erro ao buscar contatos secundários. Tente novamente.',
      },
    };
  }
};
