'use client';

import { ShieldAlert } from 'lucide-react';
import { StatusCard } from './status-card';

export function AccessDenied() {
  return (
    <StatusCard
      icon={ShieldAlert}
      iconColorClass="text-destructive"
      iconBgClass="bg-destructive/10"
      borderClass="border-destructive/20"
      title="Acesso Restrito"
      description="Você não tem permissão para acessar esta área. Entre em contato com o administrador caso acredite que isso é um erro."
      actionLabel="Voltar para início"
      actionHref="/"
      className="mx-auto max-w-md"
    />
  );
}
