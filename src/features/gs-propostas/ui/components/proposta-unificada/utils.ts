/**
 * Utilitários para o componente PropostaUnificada
 */

import { ProposalData, DEFAULT_PROPOSAL_DATA, ProposalItem } from "./types";

/**
 * Gera um código de proposta baseado na data atual e um sufixo aleatório
 * Formato: YYMMDD-X (ex: 260203-4)
 */
export function generateProposalCode(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const dd = now.getDate().toString().padStart(2, '0');
  const seq = Math.floor(Math.random() * 9) + 1;
  return `${yy}${mm}${dd}-${seq}`;
}

export const DEFAULT_PROPOSAL_ITEMS: ProposalItem[] = [];

/**
 * Cria os dados iniciais para uma nova proposta
 */
export function createNewProposalData(): ProposalData {
  return {
    ...DEFAULT_PROPOSAL_DATA,
    code: generateProposalCode(),
    validity: new Date(),
    items: DEFAULT_PROPOSAL_ITEMS,
  };
}
