import { NextRequest } from 'next/server';
import { apiSuccess } from '../../_lib/response';
import { handleApiError } from '../../_lib/errors';
import { validateBody } from '../../_lib/validate';
import { createPaymentModeSchema } from '../schemas';
import * as service from '../service';

export async function GET() {
  try {
    const data = await service.listPaymentModes();
    return apiSuccess(data);
  } catch (error) { return handleApiError(error); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await validateBody(req, createPaymentModeSchema);
    const data = await service.createPaymentMode(body as Record<string, unknown>);
    return apiSuccess(data, 201);
  } catch (error) { return handleApiError(error); }
}
