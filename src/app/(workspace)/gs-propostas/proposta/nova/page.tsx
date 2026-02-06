import { PropostaUnificada } from "@/features/gs-propostas/ui/components/proposta-unificada/proposta-unificada";
import { generateProposalCode, DEFAULT_PROPOSAL_ITEMS } from "@/features/gs-propostas/ui/components/proposta-unificada/utils";
import { DEFAULT_PROPOSAL_DATA } from "@/features/gs-propostas/ui/components/proposta-unificada/types";

export default function NovaPropostaPage() {
  const initialData = {
    ...DEFAULT_PROPOSAL_DATA,
    code: generateProposalCode(),
    items: DEFAULT_PROPOSAL_ITEMS,
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <PropostaUnificada initialData={initialData} />
    </div>
  );
}
