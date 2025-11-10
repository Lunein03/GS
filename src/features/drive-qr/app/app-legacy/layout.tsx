import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { DriveQrLayout } from '@/features/drive-qr/ui/components/drive-qr-layout';
import { DriveQrProviders } from './providers';

export const metadata: Metadata = {
  title: 'Drive QR | Intranet GS Produções',
  description: 'Scanner de QR codes do Google Drive integrado à intranet GS Produções.',
};

export default function DriveQrSegmentLayout({ children }: DriveQrSegmentLayoutProps) {
  return (
    <DriveQrProviders>
      <DriveQrLayout>{children}</DriveQrLayout>
    </DriveQrProviders>
  );
}

interface DriveQrSegmentLayoutProps {
  children: ReactNode;
}

