'use client';

import { useState } from 'react';
import { QrCode, Search, Trash2 } from 'lucide-react';

import { useEquipmentList, useDeleteEquipment } from '@/features/patrimonio/hooks/use-equipment';
import {
  EQUIPMENT_STATUS_LABEL,
  EQUIPMENT_STATUS_STYLES,
} from '@/features/patrimonio/domain/equipment-status';
import { Badge } from '@/shared/ui/badge';
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
} from '@/shared/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { useToast } from '@/shared/ui/use-toast';
import { cn } from '@/shared/lib/utils';

export function EquipmentListContent() {
  const { data: equipment = [], isLoading } = useEquipmentList();
  const deleteMutation = useDeleteEquipment();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredEquipment = equipment.filter((item) => {
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) {
      return true;
    }

    return (
      item.name.toLowerCase().includes(normalized) ||
      item.code.toLowerCase().includes(normalized) ||
      item.category.toLowerCase().includes(normalized) ||
      item.brand?.toLowerCase().includes(normalized) ||
      item.location?.toLowerCase().includes(normalized)
    );
  });

  const handleDelete = () => {
    if (!deleteId) {
      return;
    }

    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        toast({
          title: 'Equipamento excluído',
          description: 'O equipamento foi removido do sistema.',
        });
        setDeleteId(null);
      },
      onError: (error) => {
        toast({
          title: 'Erro ao excluir',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header>
          <div className="h-9 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-5 w-64 animate-pulse rounded bg-muted/70" />
        </header>
        <Card>
          <CardHeader>
            <div className="h-10 w-full animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-medium text-foreground">Equipamentos</h1>
        <p className="text-muted-foreground">Gerencie todos os equipamentos cadastrados</p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nome, código, categoria ou marca..."
                className="pl-10"
                aria-label="Buscar equipamento"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEquipment.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {searchTerm ? 'Nenhum equipamento encontrado' : 'Nenhum equipamento cadastrado'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEquipment.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-primary">
                  <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-start md:gap-6">
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-medium text-foreground">{item.name}</h2>
                        <Badge
                          variant="outline"
                          className={cn('border text-xs font-medium uppercase tracking-wide', EQUIPMENT_STATUS_STYLES[item.status])}
                        >
                          {EQUIPMENT_STATUS_LABEL[item.status]}
                        </Badge>
                      </div>

                      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <dt className="text-muted-foreground">Código</dt>
                          <dd className="font-mono font-medium text-foreground">{item.code}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Categoria</dt>
                          <dd className="text-foreground">{item.category}</dd>
                        </div>
                        {item.brand ? (
                          <div>
                            <dt className="text-muted-foreground">Marca</dt>
                            <dd className="text-foreground">{item.brand}</dd>
                          </div>
                        ) : null}
                        {item.location ? (
                          <div>
                            <dt className="text-muted-foreground">Localização</dt>
                            <dd className="text-foreground">{item.location}</dd>
                          </div>
                        ) : null}
                      </dl>

                      {item.notes ? (
                        <p className="text-sm text-muted-foreground">{item.notes}</p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button variant="ghost" size="icon" title="Visualizar QR Code">
                        <QrCode className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon" disabled title="Editar (em breve)">
                        <span className="sr-only">Editar</span>
                        <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M14.06 9.02l.92.92L7.5 17.42H6.58v-.92l7.48-7.48m3.45-3.45a1 1 0 00-1.41 0l-1.34 1.34 2.83 2.83 1.34-1.34a1 1 0 000-1.41l-1.42-1.42zM5 18.5A1.5 1.5 0 006.5 20H18a2 2 0 002-2V8.5a1.5 1.5 0 00-1.5-1.5H17V5a2 2 0 00-2-2H8a2 2 0 00-2 2v13.5z"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Excluir"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir este equipamento? Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}




