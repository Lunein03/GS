import { NextResponse } from 'next/server';

import type { AppError } from '@/types/actions';

export function mapErrorToStatus(error: AppError): number {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return 422;
    case 'CONFLICT':
      return 409;
    case 'NOT_FOUND':
      return 404;
    case 'UNAUTHORIZED':
      return 401;
    default:
      return 500;
  }
}

export function validationErrorResponse(details: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Os dados enviados são inválidos.',
        details,
      },
    },
    { status: 422 }
  );
}
