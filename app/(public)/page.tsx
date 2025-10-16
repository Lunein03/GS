import type { ReactNode } from 'react';
import { HeroSection } from '@/components/hero-section';
import { PatrimonioSection } from '@/components/patrimonio-section';
import { DriveQrSection } from '@/components/drive-qr-section';

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
