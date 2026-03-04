'use client';

import { Clock } from 'lucide-react';
import { StatusCard } from './status-card';

export function PendingApprovalCard() {
  return (
    <StatusCard
      icon={Clock}
      iconColorClass="text-yellow-500"
      iconBgClass="bg-yellow-500/10"
      borderClass="border-yellow-500/20"
      title="Aguardando Aprovação"
      description="Sua conta foi criada com sucesso! Um administrador precisa aprovar seu acesso antes que você possa utilizar a intranet."
      actionLabel="Voltar ao login"
      actionHref="/login"
    />
  );
}
