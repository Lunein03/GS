import { NextRequest, NextResponse } from 'next/server';
import { getProposal, listSignatures } from '../../../../proposals/service';
import { compileProposalHtml, generatePdfFromHtml } from '@/features/gs-propostas/server/pdf-service';
import { handleApiError, AppError } from '../../../../_lib/errors';
import type { ProposalDocumentRequest, ProposalItemData } from '@/features/gs-propostas/server/pdf-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ proposalId: string }> }
) {
  try {
    const { proposalId } = await params;
    
    // Busca dados no BD via service existente
    const proposalData = await getProposal(proposalId);
    const signatures = await listSignatures(proposalId);
    
    const signature = signatures[0];
    
    // Mapear itens para o formato esperado pelo template
    const items: ProposalItemData[] = proposalData.items.map((i: { id: string; description?: string; name?: string; quantity: number; unit_price: number; total?: number }) => ({
      id: i.id,
      description: i.description || i.name || '',
      quantity: i.quantity,
      unitValue: i.unit_price,
      total: i.total
    }));

    const docRequest: ProposalDocumentRequest = {
      code: proposalData.code,
      name: proposalData.title,
      status: proposalData.status,
      date: proposalData.created_at,
      validity: proposalData.valid_until || undefined,
      client: {
        name: proposalData.client_name,
        email: proposalData.client_email || undefined,
        phone: proposalData.client_phone || undefined,
      },
      signature: signature ? {
        name: signature.name,
        role: "Cliente",
      } : undefined,
      items: items,
      observations: proposalData.notes || undefined,
    };
    
    const html = compileProposalHtml(docRequest);
    const pdfBuffer = await generatePdfFromHtml(html);
    
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="proposta-${proposalData.code || proposalId}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
