import type { Metadata } from 'next';
import FormulariosCorporativos from '@/shared/components/formularios/FormulariosCorporativos';

export const metadata: Metadata = {
  title: getFormulariosTitle(),
  description: getFormulariosDescription(),
};

export default function FormulariosCorporativosPage() {
  return <FormulariosCorporativos />;
}

function getFormulariosTitle(): string {
  return 'Formulários Corporativos';
}

function getFormulariosDescription(): string {
  return 'Catálogo de formulários institucionais disponíveis para solicitações internas.';
}

