import type { Metadata } from 'next';

import { DriveQrContent } from '@/features/drive-qr/ui/components/drive-qr-content';

export const metadata: Metadata = {
  title: 'QR Code Drive Scanner',
  description: 'Processamento em lote de QR codes com extração inteligente de títulos do Google Drive.',
};

export default function DriveQrPage() {
  return <DriveQrContent />;
}

