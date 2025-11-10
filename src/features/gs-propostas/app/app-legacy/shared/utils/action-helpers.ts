import type { ActionResponse } from '@/shared/lib/types/actions';

/**
 * Extrai dados de uma ActionResponse ou lança erro
 */
export function extractActionData<T>(
  result: ActionResponse<T>,
  errorMessage?: string,
): T {
  if (result.success) {
    return result.data;
  }
  throw new Error(result.error.message || errorMessage || 'Erro ao processar ação.');
}

/**
 * Extrai array de dados de uma ActionResponse ou lança erro
 */
export function extractActionArray<T, K extends keyof T>(
  result: ActionResponse<T>,
  key: K,
  errorMessage?: string,
): T[K] {
  if (result.success) {
    return result.data[key];
  }
  throw new Error(result.error.message || errorMessage || 'Erro ao processar ação.');
}
