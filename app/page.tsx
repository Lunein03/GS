import { HeroSection } from "@/components/hero-section";
import { TrustedBySection } from "@/components/trusted-by-section";
import { ServicesSection } from "@/components/services-section";
import { PortfolioPreview } from "@/components/portfolio-preview";
import { StudioPreview } from "@/components/studio-preview";
import { CtaSection } from "@/components/cta-section";
import { ContactSection } from "@/components/contact-section";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intranet | Página Inicial',
  description: 'Estrutura de página inicial para intranet com seções de destaque, serviços, portfólio e contato.'
};

export default function Home() {
  return (
    <>
      <HeroSection />
      {/* <ServicesSection /> */}
      {/* <PortfolioPreview />
      <StudioPreview />
      <TrustedBySection />
      <CtaSection />
      <ContactSection /> */}
    </>
  );
}