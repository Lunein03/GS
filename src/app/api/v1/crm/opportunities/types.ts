export type OpportunityStatus = 'OPEN' | 'IN_PROGRESS' | 'WON' | 'LOST';

export interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  value: number;
  status: OpportunityStatus;
  probability: number | null;
  next_step: string | null;
  client_name: string | null;
  client_email: string | null;
  responsible_user: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface OpportunityActivity {
  id: string;
  opportunity_id: string;
  action: string;
  from_status: OpportunityStatus | null;
  to_status: OpportunityStatus | null;
  notes: string | null;
  user_id: string | null;
  created_at: string;
}

export type CreateOpportunityInput = {
  title: string;
  description?: string | null;
  value: number | string;
  probability?: number | null;
  next_step?: string | null;
  client_name?: string | null;
  client_email?: string | null;
  responsible_user?: string | null;
  tags?: string[];
};

export type UpdateOpportunityInput = Partial<CreateOpportunityInput>;
