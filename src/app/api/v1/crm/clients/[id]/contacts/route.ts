import { NextRequest } from 'next/server';
import { apiSuccess } from '../../../../_lib/response';
import { handleApiError } from '../../../../_lib/errors';
import { validateBody } from '../../../../_lib/validate';
import { createContactSchema } from '../../schemas';
import * as service from '../../service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await service.listContacts(id);
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await validateBody(req, createContactSchema);
    const data = await service.createContact(id, body);
    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
