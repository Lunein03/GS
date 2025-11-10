import type { ReactNode } from 'react';
import { HeroSection } from '@/shared/components/hero-section';
import { PatrimonioSection } from '@/shared/components/patrimonio-section';
import { DriveQrSection } from '@/shared/components/drive-qr-section';

export default function HomePage() {
  return <>{getHomeSections()}</>;
}

function getHomeSections(): ReactNode[] {
  return [
    <HeroSection key="hero" />,
    <DriveQrSection key="drive-qr" />,
    <PatrimonioSection key="patrimonio" />
  ];
}

