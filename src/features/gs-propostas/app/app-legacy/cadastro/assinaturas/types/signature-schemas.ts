import { z } from 'zod';
import { removeNonNumeric, validateCPF } from '@/shared/lib/validators';

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 160;
const MAX_PHONE_LENGTH = 20;
const MAX_GOVBR_IDENTIFIER_LENGTH = 160;
const MAX_SIGNATURE_IMAGE_SIZE = 500 * 1024; // 500 KB
const MAX_SIGNATURE_DIMENSION = 2000;

const signatureImagePattern = /^data:image\/(png|jpeg|jpg);base64,/;

function countDigits(value: string): number {
  return removeNonNumeric(value).length;
}

function calculateDataUrlSize(dataUrl: string): number {
  const [, base64Content] = dataUrl.split(',');
  if (!base64Content) {
    return 0;
  }

  const padding = (base64Content.match(/=+$/) ?? [''])[0].length;
  const size = (base64Content.length * 3) / 4 - padding;
  return Math.ceil(size);
}

export const signatureTypeField = z.enum(['govbr', 'custom']);
export const signatureStatusField = z.enum(['pending', 'verified', 'revoked']);

const emailField = z
  .string({ required_error: 'Email e obrigatorio' })
  .trim()
  .min(5, 'Email invalido')
  .max(MAX_EMAIL_LENGTH, 'Email excede limite de caracteres')
  .email('Email invalido');

const phoneField = z
  .string({ required_error: 'Telefone e obrigatorio' })
  .trim()
  .min(10, 'Telefone invalido')
  .max(MAX_PHONE_LENGTH, 'Telefone excede limite de caracteres')
  .refine((value) => countDigits(value) >= 10, 'Telefone deve ter pelo menos 10 digitos');

const cpfField = z
  .string({ required_error: 'CPF e obrigatorio' })
  .trim()
  .min(11, 'CPF deve ter 11 digitos')
  .max(14, 'CPF excede limite de caracteres')
  .refine((value) => validateCPF(value), 'CPF invalido');

const govbrIdentifierField = z
  .string()
  .trim()
  .min(5, 'Informe o identificador utilizado no Gov.br')
  .max(MAX_GOVBR_IDENTIFIER_LENGTH, 'Identificador excede limite de caracteres');

const signatureImageDataField = z
  .string()
  .trim()
  .regex(signatureImagePattern, 'Formato de imagem invalido. Utilize PNG ou JPEG.')
  .superRefine((dataUrl, ctx) => {
    const sizeInBytes = calculateDataUrlSize(dataUrl);
    if (sizeInBytes === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Imagem da assinatura invalida',
      });
      return;
    }

    if (sizeInBytes > MAX_SIGNATURE_IMAGE_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Imagem deve ter no maximo 500KB',
      });
    }
  });

const signatureDimensionsField = z
  .number()
  .int()
  .min(1)
  .max(MAX_SIGNATURE_DIMENSION);

export const signatureSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(MAX_NAME_LENGTH, 'Nome excede limite de caracteres'),
  cpf: cpfField,
  email: emailField,
  phone: phoneField,
  signatureType: signatureTypeField,
  status: signatureStatusField,
  govbrIdentifier: govbrIdentifierField.optional(),
  govbrLastValidatedAt: z.coerce.date().optional(),
  signatureImage: signatureImageDataField.optional(),
  signatureImageMime: z
    .string()
    .trim()
    .max(50, 'Formato de imagem excede limite')
    .optional(),
  signatureImageWidth: signatureDimensionsField.optional(),
  signatureImageHeight: signatureDimensionsField.optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().optional().nullable(),
});

const signatureFormBaseSchema = z.object({
  name: signatureSchema.shape.name,
  cpf: cpfField,
  email: emailField,
  phone: phoneField,
  signatureType: signatureTypeField,
  govbrIdentifier: govbrIdentifierField.optional(),
  signatureImageData: signatureImageDataField.optional(),
  signatureImageMime: signatureSchema.shape.signatureImageMime,
  signatureImageWidth: signatureDimensionsField.optional(),
  signatureImageHeight: signatureDimensionsField.optional(),
});

const signatureFormRefinement = (data: z.infer<typeof signatureFormBaseSchema>, ctx: z.RefinementCtx) => {
  if (data.signatureType === 'govbr' && !data.govbrIdentifier) {
    ctx.addIssue({
      path: ['govbrIdentifier'],
      code: z.ZodIssueCode.custom,
      message: 'Informe o identificador utilizado no Gov.br',
    });
  }

  if (data.signatureType === 'custom' && !data.signatureImageData) {
    ctx.addIssue({
      path: ['signatureImageData'],
      code: z.ZodIssueCode.custom,
      message: 'Envie ou desenhe a assinatura personalizada',
    });
  }
};

export const signatureFormSchema = signatureFormBaseSchema.superRefine(signatureFormRefinement);

export const createSignatureSchema = signatureFormSchema;

export const updateSignatureSchema = signatureFormBaseSchema
  .extend({
    id: z.string().uuid(),
  })
  .superRefine((data, ctx) => {
    signatureFormRefinement(data, ctx);
  });

export const deleteSignatureSchema = z.object({
  id: z.string().uuid(),
});

export const getSignaturesSchema = z.object({
  search: z
    .string()
    .trim()
    .max(120, 'Busca deve ter no maximo 120 caracteres')
    .optional(),
});

export const requestGovbrValidationSchema = z.object({
  id: z.string().uuid(),
});

export const completeGovbrValidationSchema = z.object({
  id: z.string().uuid(),
});

export type SignatureSchema = z.infer<typeof signatureSchema>;
export type SignatureFormSchema = z.infer<typeof signatureFormSchema>;
export type CreateSignatureInput = z.infer<typeof createSignatureSchema>;
export type UpdateSignatureInput = z.infer<typeof updateSignatureSchema>;
export type DeleteSignatureInput = z.infer<typeof deleteSignatureSchema>;
export type GetSignaturesInput = z.infer<typeof getSignaturesSchema>;
export type SignatureType = z.infer<typeof signatureTypeField>;
export type SignatureStatus = z.infer<typeof signatureStatusField>;
export type RequestGovbrValidationInput = z.infer<typeof requestGovbrValidationSchema>;
export type CompleteGovbrValidationInput = z.infer<typeof completeGovbrValidationSchema>;

// TODO (MEDIUM): [Assinaturas Validacao] Implementar testes unitarios para validacao condicional de assinaturas Gov.br e personalizadas.

