import type { Metadata } from 'next';
import PoliticasDocumentacao from '@/shared/components/politicas/PoliticasDocumentacao';

export const metadata: Metadata = {
  title: getPoliticasTitle(),
  description: getPoliticasDescription(),
};

export default function PoliticasPage() {
  return <PoliticasDocumentacao />;
}

function getPoliticasTitle(): string {
  return 'Políticas Corporativas';
}

function getPoliticasDescription(): string {
  return 'Documentação oficial das políticas internas vigentes na GS Produções.';
}

