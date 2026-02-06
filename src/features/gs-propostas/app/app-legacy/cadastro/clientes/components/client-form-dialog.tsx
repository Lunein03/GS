'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { ClienteForm } from './forms/cliente-form';
import type { Cliente, ClienteFormData } from '../types/cliente';

interface ClientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClienteFormData) => Promise<void>;
  initialData?: Cliente;
}

export function ClientFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData
}: ClientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Cliente' : 'Cadastrar Cliente'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para {initialData ? 'editar o' : 'cadastrar um novo'} cliente.
          </DialogDescription>
        </DialogHeader>
        
        <ClienteForm 
          initialData={initialData}
          onSubmit={async (data) => {
            await onSubmit(data);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
