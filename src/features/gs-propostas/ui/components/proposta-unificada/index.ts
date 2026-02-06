// Barrel export for proposta-unificada components
export { PropostaUnificada } from './proposta-unificada';
export { PropostaHeader } from './header';
export { PropostaFooter } from './footer';

// Types
export type { 
  ProposalData, 
  ProposalItem, 
  ProposalFormData,
  ProposalStatus,
  TabKey,
  TabDefinition,
  PropostaUnificadaProps,
  PropostaHeaderProps,
  PropostaFooterProps,
} from './types';

export {
  proposalFormSchema,
  proposalItemSchema,
  DEFAULT_PROPOSAL_DATA,
  DEFAULT_PROPOSAL_ITEM,
  PROPOSAL_STATUS_LABELS,
  PROPOSAL_STATUS_COLORS,
} from './types';

// Re-export tabs
export * from './tabs';
