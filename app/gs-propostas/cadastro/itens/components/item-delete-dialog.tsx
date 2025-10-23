'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { deleteItem } from '../actions/item-actions';
import type { Item } from '../types/item.types';

interface ItemDeleteDialogProps {
  item: Item;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ItemDeleteDialog({
  item,
  open,
  onOpenChange,
  onSuccess,
}: ItemDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const result = await deleteItem(item.id);

      if (result.success) {
        toast.success('Item deletado com sucesso!');
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error.message);
      }
    } catch (error) {
      toast.error('Erro ao deletar item. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Confirmar Deleção</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja deletar o item{' '}
              <span className="font-semibold text-foreground">
                {item.name}
              </span>
              ?
            </p>
            <p className="text-sm text-muted-foreground">
              Esta ação não pode ser desfeita. O item será removido
              permanentemente do sistema.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Deletar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
