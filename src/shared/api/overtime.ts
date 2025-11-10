import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { ActionResponse } from '@/shared/lib/types/actions';

export type OvertimeRequest = {
  id: string;
  employeeName: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOvertimeInput = {
  employeeName: string;
  overtimeDate: string;
  startTime: string;
  endTime: string;
  justification: string;
};

type ApiOvertimeRequest = {
  id: string;
  employee_name: string;
  overtime_date: string;
  start_time: string;
  end_time: string;
  justification: string;
  status: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
};

const API_BASE = '/forms/overtime';

const success = <T>(data: T): ActionResponse<T> => ({
  success: true,
  data,
});

const failure = <T>(
  message: string,
  code: 'UNEXPECTED_ERROR' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'CONFLICT' | 'UNAUTHORIZED' = 'UNEXPECTED_ERROR',
): ActionResponse<T> => ({
  success: false,
  error: { code, message },
});

const mapOvertimeRequest = (input: ApiOvertimeRequest): OvertimeRequest => ({
  id: input.id,
  employeeName: input.employee_name,
  overtimeDate: input.overtime_date,
  startTime: input.start_time,
  endTime: input.end_time,
  justification: input.justification,
  status: input.status as 'pending' | 'approved' | 'rejected',
  approvedBy: input.approved_by ?? undefined,
  approvedAt: input.approved_at ?? undefined,
  rejectionReason: input.rejection_reason ?? undefined,
  createdAt: input.created_at,
  updatedAt: input.updated_at,
});

export async function getOvertimeRequests(): Promise<
  ActionResponse<{ requests: OvertimeRequest[] }>
> {
  try {
    const response = await fetchApi<ApiOvertimeRequest[]>(API_BASE);
    return success({ requests: response.map(mapOvertimeRequest) });
  } catch (error) {
    const message =
      error instanceof HttpError ? error.message : 'Erro ao listar solicitacoes de hora extra.';
    return failure(message);
  }
}

export async function createOvertimeRequest(
  input: CreateOvertimeInput,
): Promise<ActionResponse<OvertimeRequest>> {
  try {
    const response = await fetchApi<ApiOvertimeRequest>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        employee_name: input.employeeName,
        overtime_date: input.overtimeDate,
        start_time: input.startTime,
        end_time: input.endTime,
        justification: input.justification,
      }),
    });

    return success(mapOvertimeRequest(response));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao criar solicitacao de hora extra.';
    return failure(message);
  }
}
