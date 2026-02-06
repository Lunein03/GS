import { z } from 'zod';
import {
  removeNonNumeric,
  validateCEP,
  validateCNPJ,
  validateCPF,
} from '@/shared/lib/validators';

const INVALID_MESSAGE = 'Campo inválido';

const brazilStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB',
  'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

type BrazilState = (typeof brazilStates)[number];

const optionalField = (schema: z.ZodTypeAny) => schema.optional().or(z.literal('').transform(() => undefined));

// Tipos de assinatura digital
export const assinaturaTipoEnum = z.enum(['govbr', 'certificado']);
export const assinaturaStatusEnum = z.enum(['pendente', 'verificado', 'expirado']);
export type AssinaturaTipo = z.infer<typeof assinaturaTipoEnum>;
export type AssinaturaStatus = z.infer<typeof assinaturaStatusEnum>;

export const companySchema = z.object({
  id: z.string().uuid(),
  tipo: z.enum(['fisica', 'juridica']),
  cpfCnpj: z.string(),
  nome: z.string().nullable().optional(),
  razaoSocial: z.string().nullable().optional(),
  nomeFantasia: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  contatoNome: z.string(),
  contatoEmail: z.string(),
  contatoTelefone: z.string(),
  cep: z.string(),
  endereco: z.string(),
  numero: z.string(),
  complemento: z.string().nullable().optional(),
  bairro: z.string(),
  cidade: z.string(),
  estado: z.string(),
  ativo: z.number().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().optional().nullable(),
  // Campos de assinatura digital
  assinaturaTipo: assinaturaTipoEnum.nullable().optional(),
  assinaturaStatus: assinaturaStatusEnum.nullable().optional(),
  assinaturaCpfTitular: z.string().nullable().optional(),
  assinaturaNomeTitular: z.string().nullable().optional(),
  assinaturaGovbrIdentifier: z.string().nullable().optional(),
  assinaturaValidadoEm: z.coerce.date().nullable().optional(),
});

const baseString = () => z.string().trim().min(1, INVALID_MESSAGE);

const optionalString = () => optionalField(z.string().trim().max(180, INVALID_MESSAGE));

const companyFormBaseSchema = z.object({
  cpfCnpj: baseString().max(18, INVALID_MESSAGE),
  nome: optionalString(),
  razaoSocial: optionalString(),
  nomeFantasia: optionalString(),
  logo: optionalField(
    z
      .string()
      .trim()
      .url(INVALID_MESSAGE),
  ),
  contatoNome: z.string().trim().min(2, INVALID_MESSAGE).max(180, INVALID_MESSAGE),
  contatoEmail: z.string().trim().email(INVALID_MESSAGE),
  contatoTelefone: z.string().trim().min(8, INVALID_MESSAGE).max(20, INVALID_MESSAGE),
  cep: z.string().trim().min(8, INVALID_MESSAGE).max(9, INVALID_MESSAGE),
  endereco: z.string().trim().min(2, INVALID_MESSAGE).max(200, INVALID_MESSAGE),
  numero: z.string().trim().min(1, INVALID_MESSAGE).max(20, INVALID_MESSAGE),
  complemento: optionalString(),
  bairro: z.string().trim().min(2, INVALID_MESSAGE).max(160, INVALID_MESSAGE),
  cidade: z.string().trim().min(2, INVALID_MESSAGE).max(160, INVALID_MESSAGE),
  estado: z
    .string()
    .trim()
    .min(2, INVALID_MESSAGE)
    .max(2, INVALID_MESSAGE)
    .transform((value) => value.toUpperCase() as BrazilState),
  // Campos de assinatura digital (opcionais no formulário)
  assinaturaTipo: optionalField(assinaturaTipoEnum),
  assinaturaCpfTitular: optionalField(z.string().trim().max(14, INVALID_MESSAGE)),
  assinaturaNomeTitular: optionalField(z.string().trim().max(180, INVALID_MESSAGE)),
});

const withCompanyRefinements = <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  schema.superRefine((data: z.infer<TSchema>, ctx) => {
    const typedData = data as z.infer<typeof companyFormBaseSchema>;
    const documentDigits = removeNonNumeric(typedData.cpfCnpj);

    if (documentDigits.length !== 11 && documentDigits.length !== 14) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_MESSAGE, path: ['cpfCnpj'] });
    }

    const isPessoaFisica = documentDigits.length === 11;

    if (isPessoaFisica) {
      if (!typedData.nome) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_MESSAGE, path: ['nome'] });
      }
      if (!validateCPF(documentDigits)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_MESSAGE, path: ['cpfCnpj'] });
      }
    } else {
      if (!typedData.razaoSocial) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_MESSAGE, path: ['razaoSocial'] });
      }
      if (!validateCNPJ(documentDigits)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_MESSAGE, path: ['cpfCnpj'] });
      }
    }

    const phoneDigits = removeNonNumeric(typedData.contatoTelefone);
    // Aceita: 10-11 (nacional) ou 12-13 (com código +55)
    if (phoneDigits.length < 10 || phoneDigits.length > 13) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_MESSAGE, path: ['contatoTelefone'] });
    }

    if (!validateCEP(typedData.cep)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_MESSAGE, path: ['cep'] });
    }

    if (!brazilStates.includes(typedData.estado)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: INVALID_MESSAGE, path: ['estado'] });
    }
  });

export const companyFormSchema = withCompanyRefinements(companyFormBaseSchema);

export const createCompanySchema = companyFormSchema;

export const updateCompanySchema = withCompanyRefinements(
  companyFormBaseSchema.extend({
    id: z.string().uuid(),
  }),
);

export const deleteCompanySchema = z.object({
  id: z.string().uuid(),
});

export const getCompaniesSchema = z.object({
  search: z
    .string()
    .trim()
    .max(120, INVALID_MESSAGE)
    .optional(),
});

export type CompanySchema = z.infer<typeof companySchema>;
export type CompanyFormSchema = z.infer<typeof companyFormSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type DeleteCompanyInput = z.infer<typeof deleteCompanySchema>;
export type GetCompaniesInput = z.infer<typeof getCompaniesSchema>;
export type CompanyState = BrazilState;

