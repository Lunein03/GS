import { z } from 'zod';

const empresaTipo = ['fisica', 'juridica'] as const;

export const createClientSchema = z.object({
  tipo: z.enum(empresaTipo),
  cpf_cnpj: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  nome: z.string().nullable().default(null),
  cargo: z.string().nullable().default(null),
  cep: z.string().min(1, 'CEP é obrigatório'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().nullable().default(null),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().min(1, 'Estado é obrigatório'),
  contato_nome: z.string().min(1, 'Nome do contato é obrigatório'),
  contato_email: z.string().min(1, 'Email do contato é obrigatório'),
  contato_telefone: z.string().min(1, 'Telefone do contato é obrigatório'),
});

export const updateClientSchema = createClientSchema.partial();

export const createContactSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  cargo: z.string().nullable().optional(),
});

export const updateContactSchema = createContactSchema.partial();
