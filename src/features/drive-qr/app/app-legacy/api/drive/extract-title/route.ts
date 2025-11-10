import '@/shared/lib/polyfills/node-file';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { extractDriveMetadata } from '@/features/drive-qr/server/google-drive';
import type { DriveExtractionResult } from '@/features/drive-qr/server/google-drive';
import type { ActionResponse } from '@/shared/lib/types/actions';
import { appErrors } from '@/shared/lib/types/actions';

const schema = z.object({
  url: z.string().url(),
});

export async function POST(request: Request): Promise<NextResponse<ActionResponse<DriveExtractionResult>>> {
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

    const result = await extractDriveMetadata(parsed.data.url);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Erro inesperado ao extrair título do Drive', error);
    return NextResponse.json(
      {
        success: false,
        error: appErrors.UNEXPECTED_ERROR,
      },
      { status: 500 }
    );
  }
}



