'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

interface StatusCardProps {
  /** Ícone Lucide a ser exibido */
  icon: LucideIcon;
  /** Classe de cor do ícone e fundo (ex: 'text-yellow-500', 'text-destructive') */
  iconColorClass: string;
  /** Classe de cor do background do ícone (ex: 'bg-yellow-500/10', 'bg-destructive/10') */
  iconBgClass: string;
  /** Classe de cor da borda do card (ex: 'border-yellow-500/20', 'border-destructive/20') */
  borderClass?: string;
  /** Título do card */
  title: string;
  /** Mensagem descritiva */
  description: string;
  /** Texto do botão de ação */
  actionLabel: string;
  /** Destino do botão de ação */
  actionHref: string;
  /** Classes adicionais para o Card */
  className?: string;
}

export function StatusCard({
  icon: Icon,
  iconColorClass,
  iconBgClass,
  borderClass,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: StatusCardProps) {
  return (
    <Card className={cn('w-full bg-card/80 backdrop-blur-sm', borderClass, className)}>
      <CardHeader className="text-center">
        <div
          className={cn(
            'mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full',
            iconBgClass
          )}
        >
          <Icon className={cn('h-8 w-8', iconColorClass)} aria-hidden="true" />
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-center text-muted-foreground">{description}</p>
      </CardContent>

      <CardFooter className="justify-center">
        <Button asChild variant="outline">
          <Link href={actionHref} tabIndex={0} aria-label={actionLabel}>
            {actionLabel}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
