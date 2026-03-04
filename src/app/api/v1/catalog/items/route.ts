import { NextRequest } from 'next/server';
import { apiSuccess } from '../../_lib/response';
import { handleApiError } from '../../_lib/errors';
import { validateBody } from '../../_lib/validate';
import { createItemSchema } from './schemas';
import * as service from './service';

export async function GET() {
  try {
    const data = await service.listItems();
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await validateBody(req, createItemSchema);
    const data = await service.createItem(body);
    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
