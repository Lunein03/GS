import '@/lib/polyfills/node-file';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { extractDriveMetadata } from '@/app/drive-qr/lib/google-drive';
import type { DriveExtractionResult } from '@/app/drive-qr/lib/google-drive';
import type { ActionResponse } from '@/types/actions';
import { appErrors } from '@/types/actions';

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
