import { apiSuccess } from '../../../_lib/response';
import { handleApiError } from '../../../_lib/errors';
import * as service from '../../service';

export async function POST() {
  try {
    const result = await service.reconcileAll();
    return apiSuccess(result);
  } catch (error) { return handleApiError(error); }
}
