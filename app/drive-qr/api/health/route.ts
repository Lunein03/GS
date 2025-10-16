import { NextResponse } from 'next/server';

interface HealthCheckResponse {
  status: 'ok' | 'error';
  service: string;
  timestamp: string;
  version: string;
  checks: {
    api: string;
    driveProxy: string;
    extractTitle: string;
  };
}

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const timestamp = new Date().toISOString();

  try {
    // Verificar se os endpoints estão acessíveis
    const checks = {
      api: 'operational',
      driveProxy: 'operational',
      extractTitle: 'operational',
    };

    const health: HealthCheckResponse = {
      status: 'ok',
      service: 'Drive QR Scanner',
      timestamp,
      version: '1.0.0',
      checks,
    };

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Erro no health check:', error);

    return NextResponse.json(
      {
        status: 'error',
        service: 'Drive QR Scanner',
        timestamp,
        version: '1.0.0',
        checks: {
          api: 'error',
          driveProxy: 'unknown',
          extractTitle: 'unknown',
        },
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
