import { fetchApi, HttpError } from '@/shared/lib/api-client';
import type { ActionResponse } from '@/shared/lib/types/actions';

export type ExpenseReport = {
  id: string;
  employeeName: string;
  expenseDate: string;
  category: string;
  categoryOther?: string;
  eventName: string;
  transportType?: string;
  transportOther?: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateExpenseInput = {
  employeeName: string;
  expenseDate: string;
  category: string;
  categoryOther?: string;
  eventName: string;
  transportType?: string;
  transportOther?: string;
  amount: string;
};

type ApiExpenseReport = {
  id: string;
  employee_name: string;
  expense_date: string;
  category: string;
  category_other?: string | null;
  event_name: string;
  transport_type?: string | null;
  transport_other?: string | null;
  amount: string;
  status: string;
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
};

const API_BASE = '/forms/expenses';

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

const mapExpenseReport = (input: ApiExpenseReport): ExpenseReport => ({
  id: input.id,
  employeeName: input.employee_name,
  expenseDate: input.expense_date,
  category: input.category,
  categoryOther: input.category_other ?? undefined,
  eventName: input.event_name,
  transportType: input.transport_type ?? undefined,
  transportOther: input.transport_other ?? undefined,
  amount: input.amount,
  status: input.status as 'pending' | 'approved' | 'rejected',
  approvedBy: input.approved_by ?? undefined,
  approvedAt: input.approved_at ?? undefined,
  rejectionReason: input.rejection_reason ?? undefined,
  createdAt: input.created_at,
  updatedAt: input.updated_at,
});

export async function getExpenseReports(): Promise<
  ActionResponse<{ reports: ExpenseReport[] }>
> {
  try {
    const response = await fetchApi<ApiExpenseReport[]>(API_BASE);
    return success({ reports: response.map(mapExpenseReport) });
  } catch (error) {
    const message =
      error instanceof HttpError ? error.message : 'Erro ao listar prestacoes de contas.';
    return failure(message);
  }
}

export async function createExpenseReport(
  input: CreateExpenseInput,
): Promise<ActionResponse<ExpenseReport>> {
  try {
    const response = await fetchApi<ApiExpenseReport>(API_BASE, {
      method: 'POST',
      body: JSON.stringify({
        employee_name: input.employeeName,
        expense_date: input.expenseDate,
        category: input.category,
        category_other: input.categoryOther ?? null,
        event_name: input.eventName,
        transport_type: input.transportType ?? null,
        transport_other: input.transportOther ?? null,
        amount: input.amount,
      }),
    });

    return success(mapExpenseReport(response));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro ao criar prestacao de contas.';
    return failure(message);
  }
}
