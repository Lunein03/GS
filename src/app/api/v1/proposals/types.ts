export type ProposalStatus = 'DRAFT' | 'OPEN' | 'SENT' | 'WON' | 'LOST';

export type ProposalHistoryEventType =
  | 'create' | 'update' | 'status_change' | 'email_sent'
  | 'pdf_generated' | 'viewed' | 'note_added' | 'note_updated' | 'note_deleted';

export type ProposalNoteMode = 'manual' | 'automatic';
export type ProposalSignatureType = 'govbr' | 'custom';
export type ProposalSignatureStatus = 'pending' | 'verified' | 'revoked';

export interface Proposal {
  id: string;
  code: string;
  title: string;
  opportunity_id: string | null;
  status: ProposalStatus;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  company_name: string | null;
  payment_mode: string | null;
  valid_until: string | null;
  total_value: number;
  discount: number | null;
  notes: string | null;
  tags: string[];
  responsible_user: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalItem {
  id: string;
  proposal_id: string;
  type: string;
  name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  discount: number | null;
  total: number;
  order: number;
  created_at: string;
}

export interface ProposalNote {
  id: string;
  name: string;
  description: string | null;
  inclusion_mode: ProposalNoteMode;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PaymentMode {
  id: string;
  name: string;
  installments: number;
  interest_rate: number;
  adjustment_rate: number;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProposalSignature {
  id: string;
  proposal_id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string | null;
  signature_type: ProposalSignatureType;
  status: ProposalSignatureStatus;
  govbr_identifier: string | null;
  govbr_last_validated_at: string | null;
  signature_image: string | null;
  signature_image_mime: string | null;
  signature_image_width: number | null;
  signature_image_height: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProposalHistory {
  id: string;
  proposal_id: string;
  event_type: ProposalHistoryEventType;
  title: string;
  description: string | null;
  meta_data: Record<string, unknown> | null;
  user_id: string | null;
  created_at: string;
}
