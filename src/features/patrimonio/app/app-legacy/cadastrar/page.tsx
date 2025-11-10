import type { Metadata } from 'next';

import { AddEquipmentForm } from '@/features/patrimonio/ui/components/add-equipment-form';

export const metadata: Metadata = {
  title: 'Patrimônio | Cadastrar equipamento',
  description: 'Formulário para cadastrar novos equipamentos no patrimônio corporativo.',
};

export default function PatrimonioCreateEquipmentPage() {
  return <AddEquipmentForm />;
}

