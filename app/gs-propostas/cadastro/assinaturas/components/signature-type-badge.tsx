'use client';

import { Badge } from '@/components/ui/badge';
import type { SignatureType } from '../types';

const TYPE_LABEL: Record<SignatureType, string> = {
  govbr: 'Assinatura Gov.br',
  custom: 'Assinatura Personalizada',
};

const TYPE_CLASS: Record<SignatureType, string> = {
  govbr: 'bg-primary/15 text-primary border-primary/40',
  custom: 'bg-sky-500/15 text-sky-700 border-sky-500/40',
};

type SignatureTypeBadgeProps = {
  type: SignatureType;
};

export function SignatureTypeBadge({ type }: SignatureTypeBadgeProps) {
  return (
    <Badge variant="outline" className={TYPE_CLASS[type]}>
      {TYPE_LABEL[type]}
    </Badge>
  );
}
