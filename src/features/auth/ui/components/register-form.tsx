'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { PasswordInput } from '@/shared/ui/password-input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';

import { registerSchema, type RegisterFormData } from '../../domain/validators';
import { signUpWithEmail } from '../../api/auth';
import { PendingApprovalCard } from './pending-approval-card';

export function RegisterForm() {
  const [isPending, setIsPending] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (isRegistered) {
    return <PendingApprovalCard />;
  }

  const handleRegister = async (data: RegisterFormData) => {
    setIsPending(true);

    try {
      await signUpWithEmail({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      // Notifica admin por email (fire-and-forget — falha não bloqueia cadastro)
      fetch('/api/auth/notify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: data.fullName, email: data.email }),
      }).catch((err) => console.error('[register] Falha ao notificar admin:', err));

      toast.success('Conta criada com sucesso!');
      setIsRegistered(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar conta';

      if (message.includes('already registered')) {
        toast.error('Este email já está cadastrado.');
      } else {
        toast.error(message);
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Card className="w-full border-border/40 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Criar Conta
        </CardTitle>
        <CardDescription>
          Preencha os dados para acessar a intranet
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(handleRegister)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Seu nome completo"
              autoComplete="name"
              disabled={isPending}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              {...register('fullName')}
            />
            {errors.fullName && (
              <p id="fullName-error" className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={isPending}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <PasswordInput
              id="password"
              placeholder="••••••"
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
              {...register('password')}
            />
            {errors.password && (
              <p id="password-error" className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••"
              autoComplete="new-password"
              disabled={isPending}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Criar Conta
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{' '}
            <Link
              href="/login"
              className="font-medium text-primary underline-offset-4 hover:underline"
              tabIndex={0}
            >
              Faça login
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
