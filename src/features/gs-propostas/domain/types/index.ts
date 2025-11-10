export type OpportunityStatus = 'OPEN' | 'IN_PROGRESS' | 'WON' | 'LOST';
export type ProposalStatus = 'DRAFT' | 'OPEN' | 'SENT' | 'WON' | 'LOST';
export type ActivityStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ActivityPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Opportunity {
  id: string;
  title: string;
  description?: string | null;
  value: string;
  status: OpportunityStatus;
  probability?: number | null;
  nextStep?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  responsibleUser?: string | null;
  tags?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpportunityActivity {
  id: string;
  opportunityId: string;
  action: string;
  fromStatus?: OpportunityStatus | null;
  toStatus?: OpportunityStatus | null;
  notes?: string | null;
  userId?: string | null;
  createdAt: Date;
}

export interface Proposal {
  id: string;
  code: string;
  title: string;
  opportunityId?: string | null;
  status: ProposalStatus;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  companyName?: string | null;
  paymentMode?: string | null;
  validUntil?: Date | null;
  totalValue: string;
  discount?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  responsibleUser?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalItem {
  id: string;
  proposalId: string;
  type: string;
  name: string;
  description?: string | null;
  quantity: string;
  unitPrice: string;
  discount?: string | null;
  total: string;
  order: number;
  createdAt: Date;
}

export interface Activity {
  id: string;
  title: string;
  description?: string | null;
  status: ActivityStatus;
  priority: ActivityPriority;
  proposalId?: string | null;
  opportunityId?: string | null;
  assignedTo?: string | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  notes?: string | null;
  tags?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  id: string;
  type: string;
  name: string;
  description?: string | null;
  defaultPrice: string;
  category?: string | null;
  active: number;
  createdAt: Date;
  updatedAt: Date;
}
