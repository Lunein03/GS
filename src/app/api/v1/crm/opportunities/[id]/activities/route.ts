import { NextRequest } from 'next/server';
import { apiSuccess } from '../../../../_lib/response';
import { handleApiError } from '../../../../_lib/errors';
import * as service from '../../service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await service.getActivities(id);
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
