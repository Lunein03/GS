import { HeroSection } from "@/components/hero-section";
import { PatrimonioSection } from "@/components/patrimonio-section";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intranet | Página Inicial',
  description: 'Estrutura de página inicial para intranet com seções de destaque, serviços, portfólio e contato.'
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <PatrimonioSection />
    </>
  );
}ss