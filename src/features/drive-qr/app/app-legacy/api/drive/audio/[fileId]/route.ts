import '@/shared/lib/polyfills/node-file';

import { NextRequest, NextResponse } from 'next/server';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
): Promise<NextResponse> {
  const { fileId } = await params;

  if (!fileId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parâmetro fileId é obrigatório',
      },
      { status: 400 }
    );
  }

  try {
    const driveUrl = `https://drive.usercontent.google.com/uc?id=${fileId}&export=download`;
    const headers: Record<string, string> = {
      'User-Agent': USER_AGENT,
    };

    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      headers['Range'] = rangeHeader;
    }

    const response = await fetch(driveUrl, {
      method: 'GET',
      headers,
      redirect: 'follow',
    });

    if (!response.ok && response.status !== 206) {
      return NextResponse.json(
        {
          success: false,
          error: `Google Drive respondeu com status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const body = response.body;
    if (!body) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fluxo de áudio indisponível',
        },
        { status: 502 }
      );
    }

    const nextResponse = new NextResponse(body, {
      status: response.status,
    });

    const contentType = response.headers.get('content-type') ?? 'audio/mpeg';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges') ?? 'bytes';

    nextResponse.headers.set('Content-Type', contentType);
    nextResponse.headers.set('Cache-Control', 'public, max-age=3600');
    nextResponse.headers.set('Accept-Ranges', acceptRanges);
    nextResponse.headers.set('Access-Control-Allow-Origin', '*');
    nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    nextResponse.headers.set('Access-Control-Allow-Headers', 'Range, Content-Type');
    nextResponse.headers.set('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Range, Content-Length');

    if (contentLength) {
      nextResponse.headers.set('Content-Length', contentLength);
    }

    if (contentRange) {
      nextResponse.headers.set('Content-Range', contentRange);
    }

    return nextResponse;
  } catch (error) {
    console.error('Erro ao fazer proxy do áudio do Google Drive', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erro ao acessar o arquivo de áudio do Google Drive',
      },
      { status: 500 }
    );
  }
}

// Suporte a OPTIONS para CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}

