'use server';

import { actionClient } from '@/app/actions/safe-action';
import { db } from '@/lib/db/client';
import { empresas } from '@/lib/db/schema';
import { eq, and, or, like, isNull, sql } from 'drizzle-orm';
import type { ActionResponse } from '@/types/actions';
import {
  checkDocumentExistsSchema,
  createEmpresaSchema,
  deleteEmpresaSchema,
  getEmpresaByIdSchema,
  getEmpresasSchema,
  updateEmpresaSchema,
  type CheckDocumentExistsInput,
  type CreateEmpresaInput,
  type DeleteEmpresaInput,
  type GetEmpresaByIdInput,
  type GetEmpresasInput,
  type UpdateEmpresaInput,
} from '../types/empresa';

type EmpresaData = typeof empresas.$inferSelect;

// ============================================
// HELPER FUNCTIONS
// ============================================

function sanitizeDocument(doc: string): string {
  return doc.replace(/\D/g, '');
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Cria uma nova empresa no sistema
 * Valida se o CPF/CNPJ já existe antes de criar
 */
export const createEmpresa = actionClient(
  createEmpresaSchema,
  async (input: CreateEmpresaInput): Promise<ActionResponse<EmpresaData>> => {
    try {
      // Sanitizar documento
      const cleanCpfCnpj = sanitizeDocument(input.cpfCnpj);

      // Verificar se documento já existe
      const existing = await db
        .select()
        .from(empresas)
        .where(
          and(
            eq(empresas.cpfCnpj, cleanCpfCnpj),
            isNull(empresas.deletedAt)
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

      // Criar empresa
      const [newEmpresa] = await db
        .insert(empresas)
        .values({
          tipo: input.tipo,
          cpfCnpj: cleanCpfCnpj,
          nome: input.nome || null,
          razaoSocial: input.razaoSocial || null,
          nomeFantasia: input.nomeFantasia || null,
          logo: input.logo || null,
          contatoNome: input.contatoNome,
          contatoEmail: input.contatoEmail,
          contatoTelefone: input.contatoTelefone,
          cep: input.cep,
          endereco: input.endereco,
          numero: input.numero,
          complemento: input.complemento || null,
          bairro: input.bairro,
          cidade: input.cidade,
          estado: input.estado,
          ativo: input.ativo ? 1 : 0,
        })
        .returning();

      return {
        success: true,
        data: newEmpresa,
      };
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      
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
          message: 'Erro ao criar empresa. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Atualiza uma empresa existente
 * Valida se o CPF/CNPJ já existe em outro registro
 */
export const updateEmpresa = actionClient(
  updateEmpresaSchema,
  async (input: UpdateEmpresaInput): Promise<ActionResponse<EmpresaData>> => {
    try {
      const { id, ...data } = input;

      // Sanitizar documento
      const cleanCpfCnpj = sanitizeDocument(data.cpfCnpj);

      // Verificar se documento já existe em outro registro
      const existing = await db
        .select()
        .from(empresas)
        .where(
          and(
            eq(empresas.cpfCnpj, cleanCpfCnpj),
            sql`${empresas.id} != ${id}`,
            isNull(empresas.deletedAt)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'CPF/CNPJ já cadastrado em outra empresa',
          },
        };
      }

      // Atualizar empresa
      const [updatedEmpresa] = await db
        .update(empresas)
        .set({
          tipo: data.tipo,
          cpfCnpj: cleanCpfCnpj,
          nome: data.nome || null,
          razaoSocial: data.razaoSocial || null,
          nomeFantasia: data.nomeFantasia || null,
          logo: data.logo || null,
          contatoNome: data.contatoNome,
          contatoEmail: data.contatoEmail,
          contatoTelefone: data.contatoTelefone,
          cep: data.cep,
          endereco: data.endereco,
          numero: data.numero,
          complemento: data.complemento || null,
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          ativo: data.ativo ? 1 : 0,
          updatedAt: new Date(),
        })
        .where(eq(empresas.id, id))
        .returning();

      if (!updatedEmpresa) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Empresa não encontrada',
          },
        };
      }

      return {
        success: true,
        data: updatedEmpresa,
      };
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);

      // Verificar erro de unique constraint
      if (error instanceof Error && 'code' in error && error.code === '23505') {
        return {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'CPF/CNPJ já cadastrado em outra empresa',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao atualizar empresa. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Remove uma empresa (soft delete)
 * Marca a empresa como deletada sem remover do banco
 */
export const deleteEmpresa = actionClient(
  deleteEmpresaSchema,
  async (input: DeleteEmpresaInput): Promise<ActionResponse<{ id: string }>> => {
    try {
      const { id } = input;

      // Soft delete - marcar como deletado
      const [deletedEmpresa] = await db
        .update(empresas)
        .set({
          deletedAt: new Date(),
          ativo: 0,
        })
        .where(
          and(
            eq(empresas.id, id),
            isNull(empresas.deletedAt)
          )
        )
        .returning();

      if (!deletedEmpresa) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Empresa não encontrada',
          },
        };
      }

      return {
        success: true,
        data: { id },
      };
    } catch (error) {
      console.error('Erro ao remover empresa:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao remover empresa. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Busca empresas com filtros e paginação
 */
export const getEmpresas = actionClient(
  getEmpresasSchema,
  async (input: GetEmpresasInput): Promise<ActionResponse<{
    empresas: EmpresaData[];
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
      const conditions = [isNull(empresas.deletedAt)];

      if (search) {
        conditions.push(
          or(
            like(empresas.nome, `%${search}%`),
            like(empresas.razaoSocial, `%${search}%`),
            like(empresas.nomeFantasia, `%${search}%`),
            like(empresas.cpfCnpj, `%${search}%`)
          )!
        );
      }

      if (tipo) {
        conditions.push(eq(empresas.tipo, tipo));
      }

      if (status) {
        conditions.push(eq(empresas.ativo, status === 'ativo' ? 1 : 0));
      }

      if (estado) {
        conditions.push(eq(empresas.estado, estado));
      }

      // Buscar empresas com paginação
      const offset = (page - 1) * pageSize;

      const [results, countResult] = await Promise.all([
        db
          .select()
          .from(empresas)
          .where(and(...conditions))
          .orderBy(empresas.createdAt)
          .limit(pageSize)
          .offset(offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(empresas)
          .where(and(...conditions)),
      ]);

      const total = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(total / pageSize);

      return {
        success: true,
        data: {
          empresas: results,
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao buscar empresas. Tente novamente.',
        },
      };
    }
  }
);

/**
 * Busca uma empresa específica por ID
 */
export const getEmpresaById = actionClient(
  getEmpresaByIdSchema,
  async (input: GetEmpresaByIdInput): Promise<ActionResponse<EmpresaData>> => {
    try {
      const { id } = input;

      const [empresa] = await db
        .select()
        .from(empresas)
        .where(
          and(
            eq(empresas.id, id),
            isNull(empresas.deletedAt)
          )
        )
        .limit(1);

      if (!empresa) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Empresa não encontrada',
          },
        };
      }

      return {
        success: true,
        data: empresa,
      };
    } catch (error) {
      console.error('Erro ao buscar empresa:', error);
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: 'Erro ao buscar empresa. Tente novamente.',
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
        eq(empresas.cpfCnpj, cleanCpfCnpj),
        isNull(empresas.deletedAt),
      ];

      if (excludeId) {
        conditions.push(sql`${empresas.id} != ${excludeId}`);
      }

      const [existing] = await db
        .select()
        .from(empresas)
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
