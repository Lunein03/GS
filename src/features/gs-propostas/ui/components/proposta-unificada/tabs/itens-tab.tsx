"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ProposalFormData } from "../types";
import { cn } from "@/shared/lib/utils";

export function ItensTab() {
  const { register, control, watch } = useFormContext<ProposalFormData>();
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  const totalGeral = watchedItems?.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const val = Number(item.unitValue) || 0;
    return acc + (qty * val);
  }, 0) || 0;

  const handleAddItem = () => {
    append({
      id: crypto.randomUUID(),
      description: "Novo Item",
      quantity: 1,
      unitValue: 0,
      itemObservation: ""
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col flex-1 overflow-hidden">
        {/* Header da Tabela */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
          <h3 className="font-medium flex items-center gap-2">
            <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
            Itens da Proposta
          </h3>
          <Button size="sm" onClick={handleAddItem} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar Item
          </Button>
        </div>
        
        {/* Tabela */}
        <div className="flex-1 overflow-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0 z-10">
              <tr className="border-b border-border text-left">
                <th className="p-3 font-medium text-muted-foreground w-12 text-center">#</th>
                <th className="p-3 font-medium text-muted-foreground">Item</th>
                <th className="p-3 font-medium text-muted-foreground">Descrição / Obs.</th>
                <th className="p-3 font-medium text-muted-foreground w-24 text-center">Qtd</th>
                <th className="p-3 font-medium text-muted-foreground w-32 text-right">Valor Unit.</th>
                <th className="p-3 font-medium text-muted-foreground w-32 text-right">Total</th>
                <th className="p-3 font-medium text-muted-foreground w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fields.map((field, index) => {
                const qty = Number(watchedItems?.[index]?.quantity) || 0;
                const val = Number(watchedItems?.[index]?.unitValue) || 0;
                const total = qty * val;

                return (
                  <tr key={field.id} className="group hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-muted-foreground text-center align-middle">
                      {index + 1}
                    </td>
                    <td className="p-3 align-middle">
                      <Input 
                        {...register(`items.${index}.description`)} 
                        className="h-8 bg-transparent border-transparent hover:border-border focus:border-primary focus:bg-background px-2 w-full transition-all font-medium"
                        placeholder="Nome do Item"
                      />
                    </td>
                    <td className="p-3 align-middle">
                      <Input 
                        {...register(`items.${index}.itemObservation`)} 
                        className="h-8 bg-transparent border-transparent hover:border-border focus:border-primary focus:bg-background px-2 w-full transition-all text-muted-foreground"
                        placeholder="Detalhes (opcional)"
                      />
                    </td>
                    <td className="p-3 align-middle">
                      <Input 
                        type="number"
                        min="0"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="h-8 bg-transparent border-transparent hover:border-border focus:border-primary focus:bg-background px-2 text-center w-full transition-all"
                      />
                    </td>
                    <td className="p-3 align-middle">
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none">R$</span>
                        <Input 
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`items.${index}.unitValue`, { valueAsNumber: true })}
                          className="h-8 bg-transparent border-transparent hover:border-border focus:border-primary focus:bg-background pl-7 pr-2 text-right w-full transition-all"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-right font-medium align-middle text-foreground/90">
                      {formatCurrency(total)}
                    </td>
                    <td className="p-3 text-center align-middle">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={() => remove(index)}
                        title="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              
              {fields.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                       <div className="p-3 bg-muted rounded-full mb-2">
                          <Plus className="w-6 h-6 opacity-30" />
                       </div>
                       <p className="font-medium">Nenhum item adicionado</p> 
                       <p className="text-xs max-w-xs mx-auto opacity-70">
                         Clique no botão "Adicionar Item" acima para começar a compor sua proposta.
                       </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            
            {fields.length > 0 && (
              <tfoot className="bg-muted/50 font-medium border-t border-border">
                <tr>
                  <td colSpan={5} className="p-4 text-right text-muted-foreground uppercase text-xs tracking-wider">
                    Total Geral:
                  </td>
                  <td className="p-4 text-right text-foreground text-lg font-bold">
                    {formatCurrency(totalGeral)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground px-1">
        <p>💡 Dica: Você pode editar os valores diretamente na tabela. O cálculo é feito automaticamente.</p>
      </div>
    </div>
  );
}
