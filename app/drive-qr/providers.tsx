'use client';

import type { ReactNode } from 'react';

import { DriveQrProvider } from './context/drive-qr-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';

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
