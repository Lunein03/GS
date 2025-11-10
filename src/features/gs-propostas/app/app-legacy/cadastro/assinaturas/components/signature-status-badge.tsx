'use client';

import { Badge } from '@/shared/ui/badge';
import type { SignatureStatus } from '../types';

type SignatureStatusBadgeProps = {
  status: SignatureStatus;
};

const STATUS_LABEL: Record<SignatureStatus, string> = {
  pending: 'Pendente',
  verified: 'Verificada',
  revoked: 'Revogada',
};

const STATUS_CLASS: Record<SignatureStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-700 border-amber-500/40',
  verified: 'bg-emerald-500/20 text-emerald-700 border-emerald-500/40',
  revoked: 'bg-destructive/20 text-destructive border-destructive/40',
};

export function SignatureStatusBadge({ status }: SignatureStatusBadgeProps) {
  return (
    <Badge variant="outline" className={STATUS_CLASS[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

