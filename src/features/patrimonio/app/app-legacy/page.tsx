import type { Metadata } from 'next';

import { DashboardContent } from '@/app/patrimonio/components/dashboard-content';

export const metadata: Metadata = {
  title: 'Patrimônio | Dashboard',
  description: 'Resumo em tempo real do patrimônio da GS Produções.',
};

export default function PatrimonioDashboardPage() {
  return <DashboardContent />;
}
