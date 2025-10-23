import { z, type ZodRawShape } from 'zod';
import { validateCPF, validateCNPJ } from '@/lib/validators';

// ============================================
// SHARED SCHEMAS
// ============================================

export const cpfSchema = z
  .string()
  .min(11, 'CPF deve ter 11 dígitos')
  .max(14, 'CPF inválido')
  .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/); // Formato: 000.000.000-00

export const cnpjSchema = z
  .string()
  .min(14, 'CNPJ deve ter 14 dígitos')
  .max(18, 'CNPJ inválido')
  .regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/); // Formato: 00.000.000/0000-00

export const cepSchema = z
  .string()
  .length(8, 'CEP deve ter 8 dígitos')
  .regex(/^\d{5}-?\d{3}$/); // Formato: 00000-000

export const emailSchema = z
  .string()
  .min(1, 'E-mail é obrigatório')
  .email('E-mail inválido');

export const telefoneSchema = z
  .string()
  .min(10, 'Telefone deve ter no mínimo 10 dígitos')
  .max(15, 'Telefone inválido')
  .regex(/^\+?55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/); // Formato: +55 (00) 00000-0000

export const empresaFormSchema = z
  .object({
    tipo: z.enum(['fisica', 'juridica'], {
      required_error: 'Tipo de empresa é obrigatório',
    }),
    cpfCnpj: z.string().min(1, 'Documento é obrigatório'),
    nome: z.string().optional().nullable(),
    razaoSocial: z.string().optional().nullable(),
    nomeFantasia: z.string().optional().nullable(),
    logo: z.string().optional().nullable(),
    contatoNome: z
      .string()
      .min(3, 'Nome do contato deve ter no mínimo 3 caracteres')
      .max(255, 'Nome do contato muito longo'),
    contatoEmail: emailSchema,
    contatoTelefone: z.string().min(1, 'Telefone é obrigatório'),
    cep: z.string().min(1, 'CEP é obrigatório'),
    endereco: z
      .string()
      .min(3, 'Endereço deve ter no mínimo 3 caracteres')
      .max(255, 'Endereço muito longo'),
    numero: z.string().min(1, 'Número é obrigatório').max(20, 'Número muito longo'),
    complemento: z.string().max(100, 'Complemento muito longo').optional().nullable(),
    bairro: z
      .string()
      .min(2, 'Bairro deve ter no mínimo 2 caracteres')
      .max(100, 'Bairro muito longo'),
    cidade: z
      .string()
      .min(2, 'Cidade deve ter no mínimo 2 caracteres')
      .max(100, 'Cidade muito longa'),
    estado: z
      .string()
      .length(2, 'Estado deve ter 2 caracteres')
      .regex(/^[A-Z]{2}$/),
    ativo: z.number().int().min(0).max(1),
  })
  .refine((data) => {
    if (data.tipo === 'fisica') {
      return !!data.nome && data.nome.length >= 3;
    }
    return true;
  }, {
    message: 'Nome completo deve ter no mínimo 3 caracteres',
    path: ['nome'],
  })
  .refine((data) => {
    if (data.tipo === 'juridica') {
      return !!data.razaoSocial && data.razaoSocial.length >= 3;
    }
    return true;
  }, {
    message: 'Razão social deve ter no mínimo 3 caracteres',
    path: ['razaoSocial'],
  });

export const filterSchema = z.object({
  search: z.string().default(''),
  tipo: z.enum(['fisica', 'juridica', 'all']).optional(),
  status: z.enum(['ativo', 'inativo', 'all']).optional(),
  estado: z.string().length(2).optional(),
});

export const logoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 2 * 1024 * 1024, 'Arquivo deve ter no máximo 2MB')
    .refine(
      (file) => ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type),
      'Apenas arquivos PNG, JPG e JPEG são permitidos',
    ),
});

// ============================================
// SERVER ACTION SCHEMAS
// ============================================

const empresaBaseShape: ZodRawShape = {
  tipo: z.enum(['fisica', 'juridica']),
  cpfCnpj: z.string().min(11, 'Documento inválido'),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').optional(),
  razaoSocial: z.string().min(3, 'Razão social deve ter no mínimo 3 caracteres').optional(),
  nomeFantasia: z.string().optional(),
  logo: z.string().optional(),
  contatoNome: z.string().min(3, 'Nome do contato é obrigatório'),
  contatoEmail: z.string().email('E-mail inválido'),
  contatoTelefone: z.string().min(10, 'Telefone inválido'),
  cep: z.string().length(8, 'CEP deve ter 8 dígitos'),
  endereco: z.string().min(3, 'Endereço é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(2, 'Bairro é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  ativo: z.boolean().default(true),
};

const buildEmpresaSchema = (shape: ZodRawShape) =>
  z
    .object(shape)
    .refine((data) => {
      const cleanDoc = data.cpfCnpj.replace(/\D/g, '');
      if (data.tipo === 'fisica') {
        return validateCPF(cleanDoc);
      }
      return validateCNPJ(cleanDoc);
    }, {
      message: 'Documento inválido',
      path: ['cpfCnpj'],
    })
    .refine((data) => {
      if (data.tipo === 'fisica') {
        return !!data.nome;
      }
      return !!data.razaoSocial;
    }, {
      message: 'Campo obrigatório',
      path: ['nome'],
    });

export const createEmpresaSchema = buildEmpresaSchema(empresaBaseShape);

export const updateEmpresaSchema = buildEmpresaSchema({
  id: z.string().uuid('ID inválido'),
  ...empresaBaseShape,
});

export const deleteEmpresaSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const getEmpresaByIdSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const checkDocumentExistsSchema = z.object({
  cpfCnpj: z.string().min(11, 'Documento inválido'),
  excludeId: z.string().uuid().optional(),
});

export const getEmpresasSchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(['fisica', 'juridica']).optional(),
  status: z.enum(['ativo', 'inativo']).optional(),
  estado: z.string().length(2).optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
});

// ============================================
// TYPES
// ============================================

export type EmpresaFormSchema = z.infer<typeof empresaFormSchema>;
export type FilterSchema = z.infer<typeof filterSchema>;
export type LogoUploadSchema = z.infer<typeof logoUploadSchema>;
export type CreateEmpresaInput = z.infer<typeof createEmpresaSchema>;
export type UpdateEmpresaInput = z.infer<typeof updateEmpresaSchema>;
export type DeleteEmpresaInput = z.infer<typeof deleteEmpresaSchema>;
export type GetEmpresaByIdInput = z.infer<typeof getEmpresaByIdSchema>;
export type CheckDocumentExistsInput = z.infer<typeof checkDocumentExistsSchema>;
export type GetEmpresasInput = z.infer<typeof getEmpresasSchema>;
