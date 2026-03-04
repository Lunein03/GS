import { apiSuccess } from '../../../_lib/response';
import { handleApiError } from '../../../_lib/errors';
import * as service from '../service';

export async function GET() {
  try {
    const data = service.getStatuses();
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}
