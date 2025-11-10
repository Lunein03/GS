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
      className="flex w-full flex-col noise-background relative"
    >
      {/* Luzes flutuantes */}
      <div className="floating-lights-container">
        <div className="floating-light floating-light-1" />
        <div className="floating-light floating-light-2" />
        <div className="floating-light floating-light-3" />
        <div className="floating-light floating-light-4" />
        <div className="floating-light floating-light-5" />
      </div>

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
