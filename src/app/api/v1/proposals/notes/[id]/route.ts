import { NextRequest } from 'next/server';
import { apiSuccess, apiNoContent } from '../../../_lib/response';
import { handleApiError } from '../../../_lib/errors';
import { validateBody } from '../../../_lib/validate';
import { updateNoteSchema } from '../../schemas';
import * as service from '../../service';

interface RouteParams { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await validateBody(req, updateNoteSchema);
    const data = await service.updateNote(id, body as Record<string, unknown>);
    return apiSuccess(data);
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    await service.deleteNote(id);
    return apiNoContent();
  } catch (error) { return handleApiError(error); }
}
