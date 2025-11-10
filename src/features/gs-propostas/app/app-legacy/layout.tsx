import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { GsPropostasProviders } from './providers';
import { GsPropostasLayout } from './components/gs-propostas-layout';

export const metadata: Metadata = {
  title: 'GS Propostas | Plataforma Comercial',
  description: 'Gestão completa do ciclo de vendas com pipeline, propostas e analytics',
};

export default function GsPropostasSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <GsPropostasProviders>
      <GsPropostasLayout>{children}</GsPropostasLayout>
    </GsPropostasProviders>
  );
}
