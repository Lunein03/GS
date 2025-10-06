import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Intranet | Área Pública',
    template: '%s | Intranet GS Produções',
  },
  description: getAreaPublicaDescription(),
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label={getAreaPublicaAriaLabel()}
      role="region"
      className="flex w-full flex-col"
    >
      {children}
    </section>
  );
}

function getAreaPublicaDescription(): string {
  return 'Conteúdo institucional e informativo disponível para todos os colaboradores.';
}

function getAreaPublicaAriaLabel(): string {
  return 'Conteúdo público da intranet GS Produções';
}
