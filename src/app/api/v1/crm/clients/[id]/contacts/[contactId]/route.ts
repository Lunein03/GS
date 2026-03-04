import { NextRequest } from 'next/server';
import { apiSuccess, apiNoContent } from '../../../../../_lib/response';
import { handleApiError } from '../../../../../_lib/errors';
import { validateBody } from '../../../../../_lib/validate';
import { updateContactSchema } from '../../../schemas';
import * as service from '../../../service';

interface RouteParams {
  params: Promise<{ id: string; contactId: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { contactId } = await params;
    const body = await validateBody(req, updateContactSchema);
    const data = await service.updateContact(contactId, body);
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { contactId } = await params;
    await service.deleteContact(contactId);
    return apiNoContent();
  } catch (error) {
    return handleApiError(error);
  }
}
