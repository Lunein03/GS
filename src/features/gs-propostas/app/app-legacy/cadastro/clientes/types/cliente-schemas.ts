import { z, type ZodRawShape } from 'zod';
import { validateCPF, validateCNPJ } from '@/shared/lib/validators';

// ============================================
// SHARED SCHEMAS
// ============================================

export const cpfSchema = z
    .string()
    .min(11, 'CPF deve ter 11 dígitos')
    .max(14, 'CPF inválido')
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'Formato de CPF inválido');

export const cnpjSchema = z
    .string()
    .min(14, 'CNPJ deve ter 14 dígitos')
    .max(18, 'CNPJ inválido')
    .regex(/^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/, 'Formato de CNPJ inválido');

export const cepSchema = z
    .string()
    .min(8, 'CEP deve ter 8 dígitos')
    .max(9, 'CEP inválido')
    .regex(/^\d{5}-?\d{3}$/, 'Formato de CEP inválido');

export const emailSchema = z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido');

export const telefoneSchema = z
    .string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(15, 'Telefone inválido')
    .regex(/^\+?55\s?\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/, 'Formato de telefone inválido');

// Validação de documento com lógica centralizada
const validateDocumento = (data: any) => {
    const cleanDoc = data.cpfCnpj.replace(/\D/g, '');
    if (data.tipo === 'fisica') {
        return validateCPF(cleanDoc);
    }
    return validateCNPJ(cleanDoc);
};

// Schema para contato secundário
export const contatoSecundarioSchema = z.object({
    id: z.string().uuid().optional(),
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: emailSchema.optional(),
    telefone: telefoneSchema.optional(),
    cargo: z.string().optional(),
});

export const clienteFormSchema = z
    .object({
        tipo: z.enum(['fisica', 'juridica'], {
            required_error: 'Tipo de pessoa é obrigatório',
        }),
        cpfCnpj: z.string().min(1, 'Documento é obrigatório'),
        nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
        cargo: z.string().optional().nullable(),
        // Endereço
        cep: cepSchema,
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
            .regex(/^[A-Z]{2}$/, 'Estado deve conter apenas letras maiúsculas'),
        // Contato Principal
        contatoNome: z
            .string()
            .min(3, 'Nome do contato deve ter no mínimo 3 caracteres')
            .max(255, 'Nome do contato muito longo'),
        contatoEmail: emailSchema,
        contatoTelefone: telefoneSchema,
        // Status
        ativo: z.number().int().min(0).max(1).default(1),
        // Contatos Secundários
        contatosSecundarios: z.array(contatoSecundarioSchema).optional(),
    })
    .refine(validateDocumento, {
        message: 'Documento inválido',
        path: ['cpfCnpj'],
    });

export const filterSchema = z.object({
    search: z.string().default(''),
    tipo: z.enum(['fisica', 'juridica', 'all']).optional(),
    status: z.enum(['ativo', 'inativo', 'all']).optional(),
    estado: z.string().length(2).optional(),
});

// ============================================
// SERVER ACTION SCHEMAS
// ============================================

const clienteBaseShape: ZodRawShape = {
    tipo: z.enum(['fisica', 'juridica']),
    cpfCnpj: z.string().min(11, 'Documento inválido'),
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    cargo: z.string().optional(),
    cep: z.string().length(8, 'CEP deve ter 8 dígitos'),
    endereco: z.string().min(3, 'Endereço é obrigatório'),
    numero: z.string().min(1, 'Número é obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(2, 'Bairro é obrigatório'),
    cidade: z.string().min(2, 'Cidade é obrigatória'),
    estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
    contatoNome: z.string().min(3, 'Nome do contato é obrigatório'),
    contatoEmail: emailSchema,
    contatoTelefone: telefoneSchema,
    ativo: z.number().int().min(0).max(1).default(1),
};

const buildClienteSchema = (shape: ZodRawShape) =>
    z.object(shape).refine(validateDocumento, {
        message: 'Documento inválido',
        path: ['cpfCnpj'],
    });

export const createClienteSchema = buildClienteSchema(clienteBaseShape);

export const updateClienteSchema = buildClienteSchema({
    id: z.string().uuid('ID inválido'),
    ...clienteBaseShape,
});

export const deleteClienteSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

export const getClienteByIdSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

export const checkDocumentExistsSchema = z.object({
    cpfCnpj: z.string().min(11, 'Documento inválido'),
    excludeId: z.string().uuid().optional(),
});

export const getClientesSchema = z.object({
    search: z.string().optional(),
    tipo: z.enum(['fisica', 'juridica']).optional(),
    status: z.enum(['ativo', 'inativo']).optional(),
    estado: z.string().length(2).optional(),
    page: z.number().int().positive().default(1),
    pageSize: z.number().int().positive().default(10),
});

// Schemas para contatos secundários
export const createContatoSecundarioSchema = z.object({
    clientId: z.string().uuid('ID do cliente inválido'),
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: emailSchema.optional(),
    telefone: telefoneSchema.optional(),
    cargo: z.string().optional(),
});

export const updateContatoSecundarioSchema = z.object({
    id: z.string().uuid('ID inválido'),
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: emailSchema.optional(),
    telefone: telefoneSchema.optional(),
    cargo: z.string().optional(),
});

export const deleteContatoSecundarioSchema = z.object({
    id: z.string().uuid('ID inválido'),
});

// ============================================
// TYPES
// ============================================

export type ClienteFormSchema = z.infer<typeof clienteFormSchema>;
export type FilterSchema = z.infer<typeof filterSchema>;
export type CreateClienteInput = z.infer<typeof createClienteSchema>;
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>;
export type DeleteClienteInput = z.infer<typeof deleteClienteSchema>;
export type GetClienteByIdInput = z.infer<typeof getClienteByIdSchema>;
export type CheckDocumentExistsInput = z.infer<typeof checkDocumentExistsSchema>;
export type GetClientesInput = z.infer<typeof getClientesSchema>;
export type ContatoSecundarioSchema = z.infer<typeof contatoSecundarioSchema>;
export type CreateContatoSecundarioInput = z.infer<typeof createContatoSecundarioSchema>;
export type UpdateContatoSecundarioInput = z.infer<typeof updateContatoSecundarioSchema>;
export type DeleteContatoSecundarioInput = z.infer<typeof deleteContatoSecundarioSchema>;

// ============================================
// FILTER TYPES
// ============================================

export type FilterState = {
    search: string;
    tipo: 'fisica' | 'juridica' | 'all';
    status: 'ativo' | 'inativo' | 'all';
    estado?: string;
};

