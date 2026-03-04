export interface OvertimeRequest {
  id: string;
  employee_name: string;
  overtime_date: string;
  start_time: string;
  end_time: string;
  justification: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateOvertimeInput = Pick<
  OvertimeRequest,
  'employee_name' | 'overtime_date' | 'start_time' | 'end_time' | 'justification'
>;

export type UpdateOvertimeInput = Partial<
  Pick<OvertimeRequest, 'status' | 'approved_by' | 'rejection_reason'>
>;
