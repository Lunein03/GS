"use client";

import { useFormContext } from "react-hook-form";
import { ProposalFormData } from "../types";
import { Textarea } from "@/shared/ui/textarea";

export function NotasTab() {
  const { register } = useFormContext<ProposalFormData>();

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Container principal */}
      <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-medium flex items-center gap-2">
            <span className="w-1 h-4 bg-orange-500 rounded-full"></span>
            Notas & Observações
          </h3>
        </div>
        
        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Seção: Observações da Proposta (Vai para o PDF) */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              Observações da Proposta
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded">
                Visível no PDF
              </span>
            </label>
            <p className="text-xs text-muted-foreground mb-1">
              Este texto será exibido no rodapé da proposta comercial. Use para condições gerais, prazos de entrega ou observações específicas.
            </p>
            <Textarea 
              {...register("observations")} 
              className="flex-1 min-h-[200px] resize-none bg-muted/10 font-mono text-sm leading-relaxed border-muted-foreground/20 focus:border-primary" 
              placeholder="Ex: Validade da proposta de 15 dias. Pagamento 50% na aprovação..."
            />
          </div>

          <div className="h-px bg-border my-2" />

          {/* Seção: Anotações Internas (Não vai para o PDF) */}
          <div className="flex-1 flex flex-col gap-2 opacity-90 hover:opacity-100 transition-opacity">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              Anotações Internas
              <span className="text-xs font-normal text-muted-foreground bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded border border-yellow-200">
                Apenas Interno
              </span>
            </label>
            <p className="text-xs text-muted-foreground mb-1">
              Notas para a equipe comercial. O cliente não verá isso.
            </p>
            <Textarea 
              {...register("internalNotes")} 
              className="flex-1 min-h-[100px] resize-none bg-yellow-50/50 border-yellow-200 focus:border-yellow-400 placeholder:text-yellow-700/30" 
              placeholder="Ex: Cliente pediu desconto, aprovação pendente da diretoria..."
            />
            <p className="text-[10px] text-muted-foreground text-right">* Não vai para o cliente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
