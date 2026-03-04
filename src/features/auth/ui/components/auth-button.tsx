'use client';

import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useAuth } from '../../hooks/use-auth';
import { UserDropdown } from './user-dropdown';

interface AuthButtonProps {
  /** Texto do botão quando não autenticado */
  label?: string;
  /** Variante do botão quando não autenticado */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** Tamanho do botão quando não autenticado */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Classes adicionais para o botão quando não autenticado */
  className?: string;
  /** Mostrar ícone de login */
  showIcon?: boolean;
}

export function AuthButton({
  label = 'Entrar',
  variant = 'default',
  size = 'default',
  className,
  showIcon = true,
}: AuthButtonProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return <UserDropdown />;
  }

  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href="/login" aria-label="Fazer login na plataforma">
        {showIcon && <LogIn className="mr-2 h-4 w-4" />}
        {label}
      </Link>
    </Button>
  );
}
