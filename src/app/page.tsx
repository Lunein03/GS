import { DriveQrSection } from "@/shared/components/drive-qr-section";
import { HeroSection } from "@/shared/components/hero-section";
import { PatrimonioSection } from "@/shared/components/patrimonio-section";
import { GsPropostasSection } from "@/shared/components/gs-propostas-section";
import { ProtectedSection } from "@/features/auth/ui/components/protected-section";
import { HOME_MODULES } from "@/features/auth/config/auth-config";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intranet | Página Inicial',
  description: 'Estrutura de página inicial para intranet com seções de destaque, serviços, portfólio e contato.'
};

export default function Home() {
  return (
    <>
      <HeroSection />
      <div id="modules">
        <ProtectedSection allowedRoles={HOME_MODULES['drive-qr']}>
          <DriveQrSection />
        </ProtectedSection>
        <ProtectedSection allowedRoles={HOME_MODULES['gs-propostas']}>
          <GsPropostasSection />
        </ProtectedSection>
        <ProtectedSection allowedRoles={HOME_MODULES['patrimonio']}>
          <PatrimonioSection />
        </ProtectedSection>
      </div>
    </>
  );
}
