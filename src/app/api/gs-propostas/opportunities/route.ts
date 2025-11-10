import { NextResponse } from 'next/server';

// Importação dinâmica para garantir que só rode no servidor
export async function GET() {
  try {
    // Importar dinamicamente para evitar bundle no client
    const { getOpportunities } = await import('@/lib/services/opportunity-service');
    const opportunities = await getOpportunities();
    return NextResponse.json(opportunities);
  } catch (error) {
    console.error('Erro na API de oportunidades:', error);
    return NextResponse.json(
      { error: 'Falha ao carregar oportunidades' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
