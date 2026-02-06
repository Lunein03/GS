"use client";

/**
 * @deprecated Este componente foi substituído pelo Centro de Propostas Unificado.
 * 
 * O novo fluxo de criação de propostas está em:
 * - Rota: /gs-propostas/proposta/nova
 * - Componente: proposta-unificada/proposta-unificada.tsx
 * 
 * Este wrapper mantém compatibilidade com código existente, redirecionando
 * cliques para a nova página em vez de abrir o modal antigo.
 * 
 * @see docs/specs/SPEC-007-migration.md
 * @see src/features/gs-propostas/app/app-legacy/DEPRECATED.md
 * 
 * Data de deprecação: 2026-02-03
 * Remoção prevista: 2026-03-01
 */

import { useRouter } from "next/navigation";
import React from "react";

interface NewOpportunityModalProps {
  children: React.ReactNode;
}

/**
 * @deprecated Use navegação direta para /gs-propostas/proposta/nova
 */
export function NewOpportunityModal({ children }: NewOpportunityModalProps) {
  const router = useRouter();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/gs-propostas/proposta/nova");
  };

  // Clone children and add onClick handler
  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
    </div>
  );
}
