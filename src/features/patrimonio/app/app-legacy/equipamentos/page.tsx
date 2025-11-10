import type { Metadata } from 'next';

import { EquipmentListContent } from '@/features/patrimonio/ui/components/equipment-list-content';

export const metadata: Metadata = {
  title: 'Patrimônio | Equipamentos',
  description: 'Lista e gerenciamento de todos os equipamentos cadastrados no patrimônio.',
};

export default function PatrimonioEquipmentPage() {
  return <EquipmentListContent />;
}

