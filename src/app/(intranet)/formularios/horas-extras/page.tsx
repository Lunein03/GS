import type { Metadata } from 'next';
import FormularioHorasExtras from '@/shared/components/formularios/FormularioHorasExtras';

export const metadata: Metadata = {
  title: getHorasExtrasTitle(),
  description: getHorasExtrasDescription(),
};

export default function FormularioHorasExtrasPage() {
  return <FormularioHorasExtras />;
}

function getHorasExtrasTitle(): string {
  return 'Solicitação de Horas Extras';
}

function getHorasExtrasDescription(): string {
  return 'Formulário destinado ao registro e aprovação de horas extras realizadas pelos colaboradores.';
}

