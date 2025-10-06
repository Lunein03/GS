import type { ReactNode } from 'react';
import { HeroSection } from '@/components/hero-section';

export default function HomePage() {
  return <>{getHomeSections()}</>;
}

function getHomeSections(): ReactNode[] {
  return [<HeroSection key="hero" />];
}
