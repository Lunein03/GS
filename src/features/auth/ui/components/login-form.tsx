'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { PasswordInput } from '@/shared/ui/password-input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';

import { loginSchema, type LoginFormData } from '../../domain/validators';
import { signInWithEmail } from '../../api/auth';
import { getUserProfile } from '../../api/profiles';
import { PendingApprovalCard } from './pending-approval-card';

export function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const [showPendingApproval, setShowPendingApproval] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (showPendingApproval) {
    return <PendingApprovalCard />;
  }

  const handleLogin = async (data: LoginFormData) => {
    setIsPending(true);

    try {
      const result = await signInWithEmail(data);

      if (!result.user) {
        toast.error('Erro ao fazer login. Tente novamente.');
        return;
      }

      // Verificar se o perfil está aprovado
      const profile = await getUserProfile(result.user.id);

      if (!profile) {
        toast.error('Perfil não encontrado. Contate o administrador.');
        return;
      }

      if (!profile.isApproved) {
        // Fazer logout e mostrar card de aprovação pendente
        const { supabase } = await import('@/shared/lib/supabase-client');
        await supabase.auth.signOut();
        setShowPendingApproval(true);
        return;
      }

      toast.success(`Bem-vindo, ${profile.fullName}!`);
      router.push('/');
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao fazer login';

      if (message.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos.');
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
          Entrar
        </CardTitle>
        <CardDescription>
          Acesse sua conta na intranet
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(handleLogin)}>
        <CardContent className="space-y-4">
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
              autoComplete="current-password"
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
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Entrar
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{' '}
            <Link
              href="/register"
              className="font-medium text-primary underline-offset-4 hover:underline"
              tabIndex={0}
            >
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
