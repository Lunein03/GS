"use client";

import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

interface ObservacoesTabProps {
  observations: string;
  onChange: (value: string) => void;
}

export function ObservacoesTab({ observations, onChange }: ObservacoesTabProps) {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="bg-card p-6 rounded-lg border border-border shadow-sm flex flex-col flex-1 gap-6">
        <div className="flex items-center justify-between shrink-0">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-blue-500" />
            Observações da Proposta
          </h3>
        </div>
        
        <div className="space-y-2 flex flex-col flex-1">
          <Label htmlFor="observations">
            Conteúdo das Observações
            <span className="text-xs text-muted-foreground ml-2 font-normal">
              (Exibido abaixo dos itens na proposta)
            </span>
          </Label>
          <Textarea
            id="observations"
            value={observations || ''}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 resize-none bg-muted/30 font-normal text-sm leading-relaxed p-4"
            placeholder="Ex: Os objetivos na contratação dos intérpretes de Libras..."
          />
          <p className="text-xs text-muted-foreground shrink-0">
            Dica: Use quebras de linha para separar parágrafos. O texto será justificado automaticamente no PDF.
          </p>
        </div>
      </div>
    </div>
  );
}
