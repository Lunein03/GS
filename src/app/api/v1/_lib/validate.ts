import { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';
import { AppError } from './errors';

export async function validateBody<T>(req: NextRequest, schema: ZodSchema<T>): Promise<T> {
  let raw: unknown;

  try {
    raw = await req.json();
  } catch {
    throw new AppError('BAD_REQUEST', 'Invalid or missing JSON body', 400);
  }

  return schema.parse(raw);
}

export function validateSearchParams<T>(
  params: URLSearchParams,
  schema: ZodSchema<T>
): T {
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return schema.parse(obj);
}
