'use client';

import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useCreateEquipment } from '@/features/patrimonio/hooks/use-equipment';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/ui/use-toast';

import type { EquipmentFormData } from '@/features/patrimonio/domain/types/equipment';

const STATUS_OPTIONS: Array<{ value: EquipmentFormData['status']; label: string }> = [
  { value: 'available', label: 'Disponível' },
  { value: 'in-use', label: 'Em uso' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'retired', label: 'Inativo' },
];

export function AddEquipmentForm() {
  const router = useRouter();
  const createMutation = useCreateEquipment();
  const { toast } = useToast();
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    acquisitionDate: new Date().toISOString().split('T')[0] ?? '',
    status: 'available',
    location: '',
    notes: '',
  });

  const handleChange = <Field extends keyof EquipmentFormData>(field: Field, value: EquipmentFormData[Field]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    createMutation.mutate({
      code: `EQ-${Date.now()}`, // Gerar código temporário
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      model: formData.model,
      serialNumber: formData.serialNumber,
      acquisitionDate: formData.acquisitionDate,
      status: formData.status,
      location: formData.location,
      notes: formData.notes,
    }, {
      onSuccess: (equipment) => {
        toast({
          title: 'Equipamento cadastrado com sucesso!',
          description: `Código gerado: ${equipment.code}`,
        });
        router.push('/patrimonio/equipamentos');
      },
      onError: (error) => {
        toast({
          title: 'Erro ao cadastrar equipamento',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-3xl font-medium text-foreground">Cadastrar equipamento</h1>
        <p className="text-muted-foreground">Adicione um novo equipamento ao patrimônio</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Informações do equipamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <Label htmlFor="name">Nome do equipamento *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="Ex: Projetor Sony"
                />
              </Field>

              <Field>
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  id="category"
                  required
                  value={formData.category}
                  onChange={(event) => handleChange('category', event.target.value)}
                  placeholder="Ex: Audiovisual, Informática"
                />
              </Field>

              <Field>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  value={formData.brand ?? ''}
                  onChange={(event) => handleChange('brand', event.target.value)}
                  placeholder="Ex: Sony, Dell"
                />
              </Field>

              <Field>
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={formData.model ?? ''}
                  onChange={(event) => handleChange('model', event.target.value)}
                  placeholder="Ex: VPL-FH500L"
                />
              </Field>

              <Field>
                <Label htmlFor="serialNumber">Número de série</Label>
                <Input
                  id="serialNumber"
                  value={formData.serialNumber ?? ''}
                  onChange={(event) => handleChange('serialNumber', event.target.value)}
                  placeholder="Ex: SN123456789"
                />
              </Field>

              <Field>
                <Label htmlFor="acquisitionDate">Data de aquisição</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  value={formData.acquisitionDate}
                  onChange={(event) => handleChange('acquisitionDate', event.target.value)}
                />
              </Field>

              <Field>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleChange('status', value as EquipmentFormData['status'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  value={formData.location ?? ''}
                  onChange={(event) => handleChange('location', event.target.value)}
                  placeholder="Ex: Sala 201, Almoxarifado"
                />
              </Field>
            </div>

            <Field>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                rows={4}
                value={formData.notes ?? ''}
                onChange={(event) => handleChange('notes', event.target.value)}
                placeholder="Informações adicionais sobre o equipamento"
              />
            </Field>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button type="submit" className="flex-1">
                Cadastrar equipamento
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}



