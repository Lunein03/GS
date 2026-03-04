import { NextRequest } from 'next/server';
import { apiSuccess } from '../../../_lib/response';
import { handleApiError } from '../../../_lib/errors';
import { validateBody } from '../../../_lib/validate';
import { changeProposalStatusSchema } from '../../schemas';
import * as service from '../../service';

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await validateBody(req, changeProposalStatusSchema);
    const data = await service.changeProposalStatus(id, body.new_status, body.user_id);
    return apiSuccess(data);
  } catch (error) { return handleApiError(error); }
}
