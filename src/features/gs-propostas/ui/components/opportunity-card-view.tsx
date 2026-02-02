"use client";

import { Opportunity, OpportunityStatus } from "@/features/gs-propostas/domain/types";
import { cn } from "@/shared/lib/utils";
import { GripVertical, Mail, User, TrendingUp, MoreVertical, Pencil, Trash2, CheckCircle, XCircle, RotateCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { HTMLAttributes, forwardRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { EditOpportunityDialog } from "./edit-opportunity-dialog";
import { deleteOpportunity, updateOpportunityStatus } from "@/features/gs-propostas/api/opportunities";
import { useQueryClient } from "@tanstack/react-query";
import { opportunityQueryKeys } from "@/features/gs-propostas/domain/query-keys";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";

interface OpportunityCardViewProps extends HTMLAttributes<HTMLDivElement> {
  opportunity: Opportunity;
  isDragging?: boolean;
  withDragHandle?: boolean;
  dragHandleProps?: HTMLAttributes<HTMLDivElement>;
}

export const OpportunityCardView = forwardRef<HTMLDivElement, OpportunityCardViewProps>(
  ({ opportunity, isDragging, withDragHandle, dragHandleProps, className, style, ...props }, ref) => {
    const value = parseFloat(opportunity.value || "0");
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const queryClient = useQueryClient();

    const handleStatusChange = async (newStatus: OpportunityStatus) => {
      try {
        await updateOpportunityStatus({ id: opportunity.id, status: newStatus });
        await queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.lists() });
        toast.success(`Oportunidade marcada como ${newStatus === 'WON' ? 'Ganha' : 'Perdida'}`);
      } catch (error) {
        toast.error("Erro ao atualizar status");
        console.error(error);
      }
    };

    const handleDelete = async () => {
      try {
        await deleteOpportunity(opportunity.id);
        await queryClient.invalidateQueries({ queryKey: opportunityQueryKeys.lists() });
        toast.success("Oportunidade excluída com sucesso");
      } catch (error) {
        toast.error("Erro ao excluir oportunidade");
        console.error(error);
      }
    };

    return (
      <>
        <div
          ref={ref}
          style={style}
          className={cn(
            "group relative rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20 overflow-hidden",
            isDragging && "opacity-50 grayscale",
            !isDragging && withDragHandle && "cursor-grab",
            className
          )}
          {...props}
          {...(withDragHandle ? dragHandleProps : {})}
        >


          <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {opportunity.status !== 'WON' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('WON')}>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Marcar como Ganha
                  </DropdownMenuItem>
                )}
                {opportunity.status !== 'LOST' && (
                  <DropdownMenuItem onClick={() => handleStatusChange('LOST')}>
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Marcar como Perdida
                  </DropdownMenuItem>
                )}
                {(opportunity.status === 'WON' || opportunity.status === 'LOST') && (
                  <DropdownMenuItem onClick={() => handleStatusChange('OPEN')}>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Reabrir
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsDeleteOpen(true)} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm line-clamp-2 pr-8">{opportunity.title}</h4>
              {opportunity.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {opportunity.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-primary">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(value)}
              </span>
              {opportunity.probability !== null && opportunity.probability !== undefined && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  {opportunity.probability}%
                </div>
              )}
            </div>

            {(opportunity.clientName || opportunity.clientEmail) && (
              <div className="space-y-1 text-xs text-muted-foreground">
                {opportunity.clientName && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span className="truncate">{opportunity.clientName}</span>
                  </div>
                )}
                {opportunity.clientEmail && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{opportunity.clientEmail}</span>
                  </div>
                )}
              </div>
            )}

            {opportunity.nextStep && (
              <div className="rounded-md bg-muted/50 p-2 text-xs">
                <span className="font-medium">Próximo passo:</span>{" "}
                <span className="text-muted-foreground">{opportunity.nextStep}</span>
              </div>
            )}

            {opportunity.tags && opportunity.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {opportunity.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {format(new Date(opportunity.createdAt), "dd MMM yyyy", {
                  locale: ptBR,
                })}
              </span>
              {opportunity.responsibleUser && (
                <span className="truncate">{opportunity.responsibleUser}</span>
              )}
            </div>
          </div>
        </div>

        <EditOpportunityDialog 
          opportunity={opportunity} 
          open={isEditOpen} 
          onOpenChange={setIsEditOpen} 
        />

        <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a oportunidade
                "{opportunity.title}" e removerá seus dados de nossos servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

OpportunityCardView.displayName = "OpportunityCardView";
