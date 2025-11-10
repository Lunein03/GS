'use client';

import type { ReactNode } from 'react';

import { TooltipProvider } from '@/shared/ui/tooltip';
import { Toaster } from '@/shared/ui/toaster';

export function PatrimonioProviders({ children }: PatrimonioProvidersProps) {
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={400}>
      {children}
      <Toaster />
    </TooltipProvider>
  );
}

interface PatrimonioProvidersProps {
  children: ReactNode;
}


