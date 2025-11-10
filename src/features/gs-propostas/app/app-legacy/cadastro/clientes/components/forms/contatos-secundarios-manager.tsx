'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { cn } from '@/lib/utils';
import { removeNonNumeric } from '@/lib/validators';
import type { ContatoSecundarioSchema } from '../../types/cliente';

// ============================================
// TYPES
// ============================================

interface ContatosSecundariosManagerProps {
  contatos: ContatoSecundarioSchema[];
  onChange: (contatos: ContatoSecundarioSchema[]) => void;
  disabled?: boolean;
}

interface ContatoFormData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
}

// ============================================
// COMPONENT
// ============================================

export function ContatosSecundariosManager({
  contatos,
  onChange,
  disabled = false,
}: ContatosSecundariosManagerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contatoToDelete, setContatoToDelete] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<ContatoFormData>({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<ContatoFormData>>({});

  // ============================================
  // HANDLERS
  // ============================================

  const handleAdd = () => {
    setEditingIndex(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cargo: '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEdit = (index: number) => {
    const contato = contatos[index];
    setEditingIndex(index);
    
    // Formatar telefone para exibição
    let telefoneFormatado = '';
    if (contato.telefone) {
      const clean = removeNonNumeric(contato.telefone);
      if (clean.length <= 2) {
        telefoneFormatado = `+55 ${clean}`;
      } else if (clean.length <= 6) {
        telefoneFormatado = `+55 (${clean.slice(0, 2)}) ${clean.slice(2)}`;
      } else if (clean.length <= 10) {
        telefoneFormatado = `+55 (${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
      } else {
        telefoneFormatado = `+55 (${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
      }
    }
    
    setFormData({
      nome: contato.nome,
      email: contato.email || '',
      telefone: telefoneFormatado,
      cargo: contato.cargo || '',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleDeleteClick = (index: number) => {
    setContatoToDelete(index);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (contatoToDelete !== null) {
      const newContatos = contatos.filter((_, i) => i !== contatoToDelete);
      onChange(newContatos);
      setDeleteDialogOpen(false);
      setContatoToDelete(null);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<ContatoFormData> = {};

    if (!formData.nome.trim()) {
      errors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 3) {
      errors.nome = 'Nome deve ter no mínimo 3 caracteres';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'E-mail inválido';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const novoContato: ContatoSecundarioSchema = {
      id: editingIndex !== null ? contatos[editingIndex].id : undefined,
      nome: formData.nome.trim(),
      email: formData.email.trim() || undefined,
      telefone: formData.telefone ? removeNonNumeric(formData.telefone) : undefined,
      cargo: formData.cargo.trim() || undefined,
    };

    let newContatos: ContatoSecundarioSchema[];

    if (editingIndex !== null) {
      // Editar contato existente
      newContatos = contatos.map((c, i) => (i === editingIndex ? novoContato : c));
    } else {
      // Adicionar novo contato
      newContatos = [...contatos, novoContato];
    }

    onChange(newContatos);
    setIsFormOpen(false);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cargo: '',
    });
    setFormErrors({});
  };

  const handleTelefoneChange = (value: string) => {
    const clean = removeNonNumeric(value);
    let formatted = '+55 ';

    if (clean.length <= 2) {
      formatted += clean;
    } else if (clean.length <= 6) {
      formatted += `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    } else if (clean.length <= 10) {
      formatted += `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    } else {
      formatted += `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
    }

    setFormData((prev) => ({ ...prev, telefone: formatted }));
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Contatos Secundários</h3>
          <p className="text-sm text-muted-foreground">
            Adicione contatos adicionais para este cliente
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Contato
        </Button>
      </div>

      {/* Lista de Contatos */}
      {contatos.length > 0 ? (
        <div className="rounded-lg border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Nome</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Cargo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">E-mail</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Telefone</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contatos.map((contato, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{contato.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {contato.cargo || '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {contato.email || '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {contato.telefone ? (() => {
                        const clean = removeNonNumeric(contato.telefone);
                        if (clean.length <= 10) {
                          return `+55 (${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
                        }
                        return `+55 (${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
                      })() : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(index)}
                          disabled={disabled}
                          aria-label={`Editar ${contato.nome}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(index)}
                          disabled={disabled}
                          aria-label={`Remover ${contato.nome}`}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-card/30 p-8 text-center">
          <p className="text-muted-foreground">
            Nenhum contato secundário adicionado
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em "Adicionar Contato" para começar
          </p>
        </div>
      )}

      {/* Dialog de Formulário */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Editar Contato' : 'Adicionar Contato'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do contato secundário
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="contato-nome">
                Nome *
              </Label>
              <Input
                id="contato-nome"
                value={formData.nome}
                onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                placeholder="Digite o nome do contato"
                className={cn(formErrors.nome && 'border-red-500')}
              />
              {formErrors.nome && (
                <p className="text-sm text-red-600">{formErrors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contato-cargo">Cargo</Label>
              <Input
                id="contato-cargo"
                value={formData.cargo}
                onChange={(e) => setFormData((prev) => ({ ...prev, cargo: e.target.value }))}
                placeholder="Digite o cargo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contato-email">E-mail</Label>
              <Input
                id="contato-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="exemplo@email.com"
                className={cn(formErrors.email && 'border-red-500')}
              />
              {formErrors.email && (
                <p className="text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contato-telefone">Telefone</Label>
              <Input
                id="contato-telefone"
                value={formData.telefone}
                onChange={(e) => handleTelefoneChange(e.target.value)}
                placeholder="+55 (00) 00000-0000"
                maxLength={19}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              {editingIndex !== null ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este contato?
              <br />
              Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
