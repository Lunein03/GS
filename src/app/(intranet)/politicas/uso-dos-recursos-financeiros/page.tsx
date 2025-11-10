import type { Metadata } from 'next';
import PoliticaUsoRecursosFinanceiros from '@/shared/components/politicas/PoliticaUsoRecursosFinanceiros';

export const metadata: Metadata = {
  title: getPoliticaUsoRecursosTitle(),
  description: getPoliticaUsoRecursosDescription(),
};

export default function PoliticaUsoRecursosFinanceirosPage() {
  return <PoliticaUsoRecursosFinanceiros />;
}

function getPoliticaUsoRecursosTitle(): string {
  return 'Política de Uso dos Recursos Financeiros';
}

function getPoliticaUsoRecursosDescription(): string {
  return 'Diretrizes oficiais para utilização responsável dos recursos financeiros da organização.';
}

