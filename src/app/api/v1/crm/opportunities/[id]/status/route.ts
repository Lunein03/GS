import { NextRequest } from 'next/server';
import { apiSuccess } from '../../../../_lib/response';
import { handleApiError } from '../../../../_lib/errors';
import { validateBody } from '../../../../_lib/validate';
import { changeStatusSchema } from '../../schemas';
import * as service from '../../service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await validateBody(req, changeStatusSchema);
    const data = await service.changeStatus(id, body.new_status, body.user_id, body.notes);
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
