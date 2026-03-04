import { NextRequest } from 'next/server';
import { apiSuccess } from '../../_lib/response';
import { handleApiError } from '../../_lib/errors';
import { validateBody } from '../../_lib/validate';
import { createExpenseSchema } from './schemas';
import * as service from './service';

export async function GET() {
  try {
    const data = await service.listExpenseReports();
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await validateBody(req, createExpenseSchema);
    const data = await service.createExpenseReport(body);
    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
