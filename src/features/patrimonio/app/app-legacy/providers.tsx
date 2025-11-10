'use client';

import type { ReactNode } from 'react';

import { EquipmentProvider } from '@/app/patrimonio/context/equipment-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

export function PatrimonioProviders({ children }: PatrimonioProvidersProps) {
  return (
    <EquipmentProvider>
      <TooltipProvider delayDuration={200} skipDelayDuration={400}>
        {children}
        <Toaster />
      </TooltipProvider>
    </EquipmentProvider>
  );
}

interface PatrimonioProvidersProps {
  children: ReactNode;
}
