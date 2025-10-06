import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: {
    default: 'Intranet | Área Interna',
    template: '%s | Intranet GS Produções',
  },
  description: getIntranetAreaDescription(),
};

export default function IntranetLayout({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label={getIntranetAriaLabel()}
      role="region"
      className="flex w-full flex-col"
    >
      {children}
    </section>
  );
}

function getIntranetAreaDescription(): string {
  return 'Conteúdo interno com formulários, políticas e materiais restritos aos colaboradores.';
}

function getIntranetAriaLabel(): string {
  return 'Área interna da intranet GS Produções';
}
