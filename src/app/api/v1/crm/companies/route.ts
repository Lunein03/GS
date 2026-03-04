import { NextRequest } from 'next/server';
import { apiSuccess } from '../../_lib/response';
import { handleApiError } from '../../_lib/errors';
import { validateBody } from '../../_lib/validate';
import { createCompanySchema } from './schemas';
import * as service from './service';
import type { CreateCompanyInput } from './types';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') ?? undefined;
    const data = await service.listCompanies(search);
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await validateBody(req, createCompanySchema);
    const data = await service.createCompany(body as unknown as CreateCompanyInput);
    return apiSuccess(data, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
