export interface ExpenseReport {
  id: string;
  employee_name: string;
  expense_date: string;
  category: string;
  category_other: string | null;
  event_name: string;
  transport_type: string | null;
  transport_other: string | null;
  amount: number;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateExpenseInput = Pick<
  ExpenseReport,
  | 'employee_name'
  | 'expense_date'
  | 'category'
  | 'event_name'
  | 'amount'
> &
  Partial<Pick<ExpenseReport, 'category_other' | 'transport_type' | 'transport_other'>>;

export type UpdateExpenseInput = Partial<
  Pick<ExpenseReport, 'status' | 'approved_by' | 'rejection_reason'>
>;
