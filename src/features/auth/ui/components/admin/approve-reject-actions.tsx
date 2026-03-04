'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';

import { approveUser, rejectUser } from '../../../api/profiles';
import type { UserProfile } from '../../../domain/types';

interface ApproveRejectActionsProps {
  user: UserProfile;
  onSuccess: () => void;
}

export function ApproveRejectActions({ user, onSuccess }: ApproveRejectActionsProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await approveUser(user.userId);

      // Notifica o usuário por email (fire-and-forget — falha não bloqueia aprovação)
      fetch('/api/auth/notify-approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: user.fullName, email: user.email }),
      }).catch((err) => console.error('[admin] Falha ao enviar email de aprovação:', err));

      toast.success(`${user.fullName} foi aprovado!`);
      onSuccess();
    } catch {
      toast.error('Erro ao aprovar usuário.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    try {
      await rejectUser(user.userId);
      toast.success(`${user.fullName} foi rejeitado.`);
      onSuccess();
    } catch {
      toast.error('Erro ao rejeitar usuário.');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Aprovar */}
      {!user.isApproved && (
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950"
          disabled={isApproving}
          onClick={handleApprove}
          aria-label={`Aprovar ${user.fullName}`}
        >
          <Check className="mr-1 h-3.5 w-3.5" />
          Aprovar
        </Button>
      )}

      {/* Rejeitar */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-destructive hover:bg-destructive/10"
            disabled={isRejecting}
            aria-label={`Rejeitar ${user.fullName}`}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Rejeitar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar rejeição</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja rejeitar <strong>{user.fullName}</strong>?
              O perfil será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Rejeitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
