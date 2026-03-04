import { NextRequest } from 'next/server';
import { apiSuccess } from '../../_lib/response';
import { handleApiError } from '../../_lib/errors';
import { validateBody } from '../../_lib/validate';
import { createSignatureSchema } from '../schemas';
import * as service from '../service';

export async function GET(req: NextRequest) {
  try {
    const proposalId = req.nextUrl.searchParams.get('proposal_id') ?? undefined;
    const data = await service.listSignatures(proposalId);
    return apiSuccess(data);
  } catch (error) { return handleApiError(error); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await validateBody(req, createSignatureSchema);
    const data = await service.createSignature(body as Record<string, unknown>);
    return apiSuccess(data, 201);
  } catch (error) { return handleApiError(error); }
}
