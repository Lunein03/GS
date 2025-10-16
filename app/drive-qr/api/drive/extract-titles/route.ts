import { NextResponse } from 'next/server';
import { z } from 'zod';

import { extractDriveMetadata } from '@/app/drive-qr/lib/google-drive';
import type { DriveExtractionResult } from '@/app/drive-qr/lib/google-drive';
import type { ActionResponse } from '@/types/actions';
import { appErrors } from '@/types/actions';

const schema = z.object({
  urls: z.array(z.string().url()).min(1).max(50),
});

interface BatchResult extends DriveExtractionResult {
  url: string;
}

export async function POST(request: Request): Promise<NextResponse<ActionResponse<BatchResult[]>>> {
  try {
    const payload = await request.json();
    const parsed = schema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            ...appErrors.VALIDATION_ERROR,
            details: { issues: parsed.error.flatten() },
          },
        },
        { status: 400 }
      );
    }

    // Processar todas as URLs em paralelo
    const results = await Promise.allSettled(
      parsed.data.urls.map(async (url) => {
        try {
          const metadata = await extractDriveMetadata(url);
          return { ...metadata, url };
        } catch (error) {
          return {
            success: false,
            fileId: null,
            title: 'Erro ao processar URL',
            method: 'error',
            audio: {
              isAudio: false,
              proxyPath: null,
              downloadUrl: null,
              mimeType: null,
            },
            url,
          };
        }
      })
    );

    // Transformar resultados
    const data: BatchResult[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }

      // Em caso de rejeição, retornar erro
      return {
        success: false,
        fileId: null,
        title: 'Falha ao processar',
        method: 'error',
        audio: {
          isAudio: false,
          proxyPath: null,
          downloadUrl: null,
          mimeType: null,
        },
        url: parsed.data.urls[index],
      };
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Erro ao processar URLs em lote', error);
    return NextResponse.json(
      {
        success: false,
        error: appErrors.UNEXPECTED_ERROR,
      },
      { status: 500 }
    );
  }
}
