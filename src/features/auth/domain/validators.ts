import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'Nome deve ter ao menos 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    email: z
      .string()
      .min(1, 'Email é obrigatório')
      .email('Email inválido'),
    password: z
      .string()
      .min(6, 'Senha deve ter ao menos 6 caracteres')
      .max(72, 'Senha deve ter no máximo 72 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
