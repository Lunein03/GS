'use client';

import type { ReactNode } from 'react';

import { DriveQrProvider } from '@/features/drive-qr/hooks/drive-qr-provider';
import { TooltipProvider } from '@/shared/ui/tooltip';
import { Toaster } from '@/shared/ui/toaster';

export function DriveQrProviders({ children }: DriveQrProvidersProps) {
  return (
    <DriveQrProvider>
      <TooltipProvider delayDuration={200} skipDelayDuration={400}>
        {children}
        <Toaster />
      </TooltipProvider>
    </DriveQrProvider>
  );
}

interface DriveQrProvidersProps {
  children: ReactNode;
}



