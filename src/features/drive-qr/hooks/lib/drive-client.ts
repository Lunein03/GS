'use client';

import type { ActionResponse } from '@/shared/lib/types/actions';

export interface DriveMetadataPayload {
  success: boolean;
  fileId: string | null;
  title: string;
  method: string;
  audio: {
    isAudio: boolean;
    proxyPath: string | null;
    downloadUrl: string | null;
    mimeType: string | null;
  };
}

type ExtractTitleResponse = ActionResponse<DriveMetadataPayload>;

export async function fetchDriveMetadata(url: string, signal?: AbortSignal): Promise<DriveMetadataPayload> {
  const response = await fetch('/drive-qr/api/drive/extract-title', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
    signal,
  });

  if (!response.ok) {
    throw new Error('Falha ao consultar metadados do Google Drive');
  }

  const data = (await response.json()) as ExtractTitleResponse;

  if (!data.success) {
    const message = data.error?.message ?? 'Não foi possível extrair informações do Google Drive.';
    const reason = data.error?.details?.reason ? ` (${String(data.error.details.reason)})` : '';
    throw new Error(`${message}${reason}`);
  }

  return data.data;
}

