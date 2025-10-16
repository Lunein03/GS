import { NextResponse } from 'next/server';

import {
  createEquipmentAction,
  listEquipmentAction,
} from '@/app/patrimonio/actions/equipment';
import { equipmentFiltersSchema } from '@/app/patrimonio/lib/validators';
import { mapErrorToStatus, validationErrorResponse } from '@/app/api/_utils/responses';
import { appErrors, type ActionResponse } from '@/types/actions';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const filtersRaw = {
    status: searchParams.get('status') ?? undefined,
    category: searchParams.get('category') ?? undefined,
    search: searchParams.get('search') ?? undefined,
    includeDeleted: searchParams.get('includeDeleted') === 'true' ? true : undefined,
  } satisfies Record<string, string | undefined | boolean>;

  const parsed = equipmentFiltersSchema.safeParse(filtersRaw);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error.flatten());
  }

  const execution = await listEquipmentAction(parsed.data);
  if (execution.validationError) {
    return validationErrorResponse(execution.validationError);
  }

  if (execution.serverError) {
    console.error('Erro inesperado ao listar equipamentos', execution.serverError);
    return NextResponse.json(
      { success: false, error: appErrors.UNEXPECTED_ERROR },
      { status: mapErrorToStatus(appErrors.UNEXPECTED_ERROR) }
    );
  }

  const result = execution.data as ActionResponse<unknown> | undefined;
  if (!result) {
    console.error('Ação de listagem não retornou dados', execution);
    return NextResponse.json(
      { success: false, error: appErrors.UNEXPECTED_ERROR },
      { status: mapErrorToStatus(appErrors.UNEXPECTED_ERROR) }
    );
  }
  if (!result.success) {
    return NextResponse.json(result, { status: mapErrorToStatus(result.error) });
  }

  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const execution = await createEquipmentAction(body);

  if (execution.validationError) {
    return validationErrorResponse(execution.validationError);
  }

  if (execution.serverError) {
    console.error('Erro inesperado ao criar equipamento', execution.serverError);
    return NextResponse.json(
      { success: false, error: appErrors.UNEXPECTED_ERROR },
      { status: mapErrorToStatus(appErrors.UNEXPECTED_ERROR) }
    );
  }

  const result = execution.data as ActionResponse<unknown> | undefined;
  if (!result) {
    console.error('Ação de criação não retornou dados', execution);
    return NextResponse.json(
      { success: false, error: appErrors.UNEXPECTED_ERROR },
      { status: mapErrorToStatus(appErrors.UNEXPECTED_ERROR) }
    );
  }
  if (!result.success) {
    return NextResponse.json(result, { status: mapErrorToStatus(result.error) });
  }

  return NextResponse.json(result, { status: 201 });
}
