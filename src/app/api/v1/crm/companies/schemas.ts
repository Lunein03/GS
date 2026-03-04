import { z } from 'zod';

const empresaTipo = ['fisica', 'juridica'] as const;

export const createCompanySchema = z.object({
  tipo: z.enum(empresaTipo),
  cpf_cnpj: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  nome: z.string().nullable().optional(),
  razao_social: z.string().nullable().optional(),
  nome_fantasia: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  contato_nome: z.string().min(1, 'Nome do contato é obrigatório'),
  contato_email: z.string().min(1, 'Email do contato é obrigatório'),
  contato_telefone: z.string().min(1, 'Telefone do contato é obrigatório'),
  cep: z.string().min(1, 'CEP é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().nullable().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
});

export const updateCompanySchema = createCompanySchema.partial().extend({
  ativo: z.number().int().min(0).max(1).optional(),
  assinatura_tipo: z.string().nullable().optional(),
  assinatura_status: z.string().nullable().optional(),
  assinatura_cpf_titular: z.string().nullable().optional(),
  assinatura_nome_titular: z.string().nullable().optional(),
  assinatura_govbr_identifier: z.string().nullable().optional(),
  assinatura_validado_em: z.string().nullable().optional(),
});
