export type AppErrorCode =
  | 'UNEXPECTED_ERROR'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'UNAUTHORIZED';

export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type ActionResponse<TData, TError extends AppError = AppError> =
  | { success: true; data: TData }
  | { success: false; error: TError };

export const appErrors: Record<AppErrorCode, AppError> = {
  UNEXPECTED_ERROR: {
    code: 'UNEXPECTED_ERROR',
    message: 'Ocorreu um erro inesperado. Tente novamente ou contate o suporte.',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: 'O recurso solicitado não foi encontrado.',
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Os dados enviados são inválidos. Verifique os campos e tente novamente.',
  },
  CONFLICT: {
    code: 'CONFLICT',
    message: 'O recurso já existe ou entrou em conflito com outro registro.',
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: 'Você não tem permissão para executar esta ação.',
  },
};
