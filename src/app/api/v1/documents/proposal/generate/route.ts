import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { compileProposalHtml, generatePdfFromHtml } from '@/features/gs-propostas/server/pdf-service';
import { validateBody } from '../../../_lib/validate';
import { handleApiError } from '../../../_lib/errors';

const generateProposalSchema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
  validity: z.string().optional(),
  company: z.record(z.unknown()).optional(),
  client: z.record(z.unknown()).optional(),
  signature: z.record(z.unknown()).optional(),
  items: z.array(z.object({
    id: z.string(),
    description: z.string(),
    quantity: z.number(),
    unitValue: z.number(),
    total: z.number().optional(),
  })).optional(),
  observations: z.string().optional(),
  internal_notes: z.string().optional(),
  include_watermark: z.boolean().optional(),
  include_signature_page: z.boolean().optional(),
  primary_color: z.string().optional(),
  secondary_color: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = await validateBody(req, generateProposalSchema);

    const html = compileProposalHtml(data);
    const pdfBuffer = await generatePdfFromHtml(html);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposta-${data.code || 'nova'}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
