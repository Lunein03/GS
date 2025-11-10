import type { Metadata } from 'next';

import { EventsContent } from '@/features/patrimonio/ui/components/events-content';

export const metadata: Metadata = {
  title: 'Patrimônio | Eventos',
  description: 'Planejamento de eventos com equipamentos externos da GS Produções.',
};

export default function PatrimonioEventsPage() {
  return <EventsContent />;
}

