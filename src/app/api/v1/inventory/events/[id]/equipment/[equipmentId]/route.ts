import { NextRequest } from 'next/server';
import { apiSuccess, apiNoContent } from '../../../../../_lib/response';
import { handleApiError } from '../../../../../_lib/errors';
import { validateBody } from '../../../../../_lib/validate';
import { addEquipmentToEventSchema } from '../../../../schemas';
import * as service from '../../../../service';

interface RouteParams { params: Promise<{ id: string; equipmentId: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id, equipmentId } = await params;
    const body = await validateBody(req, addEquipmentToEventSchema);
    const data = await service.addEquipmentToEventService(id, equipmentId, body.quantity ?? 1);
    return apiSuccess(data, 201);
  } catch (error) { return handleApiError(error); }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id, equipmentId } = await params;
    await service.removeEquipmentFromEventService(id, equipmentId);
    return apiNoContent();
  } catch (error) { return handleApiError(error); }
}
