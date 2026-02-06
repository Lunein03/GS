/**
 * Editar Proposta - Página de edição
 * @see docs/specs/SPEC-001-project-structure.md
 */

import { PropostaUnificada } from "@/features/gs-propostas/ui/components/proposta-unificada/proposta-unificada";

interface PropostaPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropostaPage({ params }: PropostaPageProps) {
  const { id } = await params;
  
  // TODO: Buscar dados da proposta pelo ID
  // const proposalData = await getProposal(id);
  
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PropostaUnificada 
        proposalId={id}
        // initialData={proposalData}
      />
    </div>
  );
}
