import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  deleteEquipmentAction,
  updateEquipmentAction,
} from '@/app/patrimonio/actions/equipment';
import { deleteEquipmentSchema, updateEquipmentSchema } from '@/app/patrimonio/lib/validators';
import { mapErrorToStatus, validationErrorResponse } from '@/app/api/_utils/responses';
import { findEquipmentById } from '@/app/patrimonio/lib/repositories/equipment-repository';
import { mapEquipmentEntity } from '@/app/patrimonio/lib/mappers';
import { appErrors, type ActionResponse } from '@/types/actions';

type RouteParams = Promise<{ id: string }>;

export async function GET(_: NextRequest, context: { params: RouteParams }) {
  const { id } = await context.params;
  const record = await findEquipmentById(id);

  if (!record) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Equipamento não encontrado.',
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: mapEquipmentEntity(record),
    },
    { status: 200 }
  );
}

export async function PATCH(request: NextRequest, context: { params: RouteParams }) {
  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateEquipmentSchema.safeParse({ id, data: body });

  if (!parsed.success) {
    return validationErrorResponse(parsed.error.flatten());
  }

  const execution = await updateEquipmentAction(parsed.data);

  if (execution.validationError) {
    return validationErrorResponse(execution.validationError);
  }

  if (execution.serverError) {
    console.error('Erro inesperado ao atualizar equipamento', execution.serverError);
    return NextResponse.json(
      { success: false, error: appErrors.UNEXPECTED_ERROR },
      { status: mapErrorToStatus(appErrors.UNEXPECTED_ERROR) }
    );
  }

  const result = execution.data as ActionResponse<unknown> | undefined;
  if (!result) {
    console.error('Ação de atualização não retornou dados', execution);
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

export async function DELETE(request: NextRequest, context: { params: RouteParams }) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const softDeleteParam = url.searchParams.get('soft');
  const softDelete = softDeleteParam === 'false' ? false : true;

  const parsed = deleteEquipmentSchema.safeParse({ id, softDelete });
  if (!parsed.success) {
    return validationErrorResponse(parsed.error.flatten());
  }

  const execution = await deleteEquipmentAction(parsed.data);

  if (execution.validationError) {
    return validationErrorResponse(execution.validationError);
  }

  if (execution.serverError) {
    console.error('Erro inesperado ao excluir equipamento', execution.serverError);
    return NextResponse.json(
      { success: false, error: appErrors.UNEXPECTED_ERROR },
      { status: mapErrorToStatus(appErrors.UNEXPECTED_ERROR) }
    );
  }

  const result = execution.data as ActionResponse<unknown> | undefined;
  if (!result) {
    console.error('Ação de exclusão não retornou dados', execution);
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
