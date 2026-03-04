import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { apiError } from './response';
import type { ApiErrorBody } from './response';

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(entity: string): AppError {
  return new AppError('NOT_FOUND', `${entity} não encontrado(a)`, 404);
}

export function conflict(message: string): AppError {
  return new AppError('CONFLICT', message, 409);
}

export function badRequest(message: string, details?: unknown): AppError {
  return new AppError('BAD_REQUEST', message, 400, details);
}

export function handleApiError(error: unknown): NextResponse<ApiErrorBody> {
  if (error instanceof AppError) {
    return apiError(error.code, error.message, error.statusCode, error.details);
  }

  if (error instanceof ZodError) {
    const fieldErrors = error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    return apiError('VALIDATION_ERROR', 'Dados inválidos', 422, fieldErrors);
  }

  if (error instanceof Error && 'code' in error) {
    const pgError = error as Error & { code: string };
    if (pgError.code === '23505') {
      return apiError('CONFLICT', 'Recurso já existe', 409);
    }
    if (pgError.code === '23503') {
      return apiError('BAD_REQUEST', 'Recurso referenciado não encontrado', 400);
    }
  }

  console.error('[API Error]', error);
  return apiError('INTERNAL_ERROR', 'Erro interno do servidor', 500);
}
