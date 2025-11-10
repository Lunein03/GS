import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { PatrimonioLayout } from '@/features/patrimonio/ui/components/patrimonio-layout';
import { PatrimonioProviders } from './providers';

export const metadata: Metadata = {
  title: 'Patrimônio | GS Produções',
  description: 'Gestão e controle de patrimônio corporativo na intranet da GS Produções.',
};

export default function PatrimonioSegmentLayout({ children }: PatrimonioSegmentLayoutProps) {
  return (
    <PatrimonioProviders>
      <PatrimonioLayout>{children}</PatrimonioLayout>
    </PatrimonioProviders>
  );
}

interface PatrimonioSegmentLayoutProps {
  children: ReactNode;
}
