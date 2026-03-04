import { NextResponse } from 'next/server';

export interface ApiErrorBody {
  detail: string;
  code?: string;
  errors?: unknown;
}

/**
 * Return raw data — backward-compatible with the existing frontend fetchApi
 * which expects response.json() to directly contain the data (array or object).
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Return error in FastAPI-compatible format (uses `detail` key)
 * so the existing frontend api-client.ts can parse it.
 */
export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      detail: message,
      code,
      ...(details !== undefined && { errors: details }),
    },
    { status }
  );
}

export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}
