import { DriveQrSection } from "@/shared/components/drive-qr-section";
import { HeroSection } from "@/shared/components/hero-section";
import { PatrimonioSection } from "@/shared/components/patrimonio-section";
import { GsPropostasSection } from "@/shared/components/gs-propostas-section";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intranet | Página Inicial',
  description: 'Estrutura de página inicial para intranet com seções de destaque, serviços, portfólio e contato.'
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <DriveQrSection />
  <GsPropostasSection />
      <PatrimonioSection />
    </>
  );
}
