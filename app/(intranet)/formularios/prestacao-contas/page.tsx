import type { Metadata } from 'next';
import FormularioPrestacaoContas from '@/components/formularios/FormularioPrestacaoContas';

export const metadata: Metadata = {
  title: getPrestacaoContasTitle(),
  description: getPrestacaoContasDescription(),
};

export default function PrestacaoContasPage() {
  return <FormularioPrestacaoContas />;
}

function getPrestacaoContasTitle(): string {
  return 'Prestação de Contas';
}

function getPrestacaoContasDescription(): string {
  return 'Formulário para submissão e acompanhamento de prestações de contas corporativas.';
}
