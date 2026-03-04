import { NextRequest } from 'next/server';
import { apiSuccess } from '../../../_lib/response';
import { handleApiError } from '../../../_lib/errors';
import { validateBody } from '../../../_lib/validate';
import { createItemSchema } from '../../schemas';
import * as service from '../../service';

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await validateBody(req, createItemSchema);
    const data = await service.addItem(id, body as Record<string, unknown>);
    return apiSuccess(data, 201);
  } catch (error) { return handleApiError(error); }
}
