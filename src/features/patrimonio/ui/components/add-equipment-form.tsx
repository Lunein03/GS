'use client';

import { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useCreateEquipment } from '@/features/patrimonio/hooks/use-equipment';
import { formatBRLInput, parseBRLToCents } from '@/shared/lib/currency';
import { Button } from '@/shared/ui/button';
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
import { SectionShell } from '@/shared/components/section-shell';
import { cn } from '@/shared/lib/utils';
import {
  equipmentFormSchema,
  type EquipmentFormInput,
} from '@/features/patrimonio/domain/validators';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Disponível' },
  { value: 'in-use', label: 'Em uso' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'retired', label: 'Inativo' },
] as const;

const FORM_CARD_CLASS = 'rounded-2xl border border-border bg-card/80 p-8 backdrop-blur-xl';
const FIELD_INPUT_CLASS =
  'h-12 rounded-xl border border-border bg-card/60 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent';
const FIELD_TEXTAREA_CLASS =
  'rounded-xl border border-border bg-card/60 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-accent';
const SECTION_STACK_CLASS = 'mx-auto max-w-4xl space-y-10';

export function AddEquipmentForm() {
  const router = useRouter();
  const createMutation = useCreateEquipment();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormInput>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: '',
      category: '',
      brand: '',
      model: '',
      serialNumber: '',
      acquisitionDate: new Date().toISOString().split('T')[0] ?? '',
      status: 'available',
      location: '',
      notes: '',
      acquisitionValue: '',
      quantity: 1,
    },
  });

  const acquisitionValue = watch('acquisitionValue');
  const status = watch('status');

  const handleAcquisitionValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatBRLInput(event.target.value);
    setValue('acquisitionValue', formatted, { shouldValidate: true });
  };

  const onSubmit = (data: EquipmentFormInput) => {
    const unitValueCents = parseBRLToCents(data.acquisitionValue);

    if (unitValueCents <= 0) {
      toast({
        title: 'Valor unitário inválido',
        description: 'Informe um valor unitário maior que zero.',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate(
      {
        code: `EQ-${Date.now()}`,
        name: data.name,
        category: data.category,
        brand: data.brand || undefined,
        model: data.model || undefined,
        serialNumber: data.serialNumber || undefined,
        acquisitionDate: data.acquisitionDate,
        status: data.status,
        location: data.location || undefined,
        notes: data.notes || undefined,
        quantity: data.quantity,
        unitValueCents,
      },
      {
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
      },
    );
  };

  return (
    <SectionShell title="Cadastrar equipamento" subtitle="Adicione um novo equipamento ao patrimônio">
      <div className={SECTION_STACK_CLASS}>
        <div className={FORM_CARD_CLASS}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2">
              <Field>
                <Label htmlFor="name">Nome do equipamento *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ex: Projetor Sony"
                  className={FIELD_INPUT_CLASS}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </Field>

              <Field>
                <Label htmlFor="category">Categoria *</Label>
                <Input
                  id="category"
                  {...register('category')}
                  placeholder="Ex: Audiovisual, Informática"
                  className={FIELD_INPUT_CLASS}
                />
                {errors.category && (
                  <p className="text-sm text-destructive">{errors.category.message}</p>
                )}
              </Field>

              <Field>
                <Label htmlFor="acquisitionValue">Valor unitário *</Label>
                <Input
                  id="acquisitionValue"
                  inputMode="decimal"
                  value={acquisitionValue}
                  onChange={handleAcquisitionValueChange}
                  placeholder="Ex: R$ 1.900,00"
                  className={FIELD_INPUT_CLASS}
                />
                {errors.acquisitionValue && (
                  <p className="text-sm text-destructive">{errors.acquisitionValue.message}</p>
                )}
              </Field>

              <Field>
                <Label htmlFor="quantity">Quantidade *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  step={1}
                  {...register('quantity', { valueAsNumber: true })}
                  placeholder="Ex: 2"
                  className={FIELD_INPUT_CLASS}
                />
                {errors.quantity && (
                  <p className="text-sm text-destructive">{errors.quantity.message}</p>
                )}
              </Field>

              <Field>
                <Label htmlFor="brand">Marca</Label>
                <Input
                  id="brand"
                  {...register('brand')}
                  placeholder="Ex: Sony, Dell"
                  className={FIELD_INPUT_CLASS}
                />
                {errors.brand && (
                  <p className="text-sm text-destructive">{errors.brand.message}</p>
                )}
              </Field>

              <Field>
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  {...register('model')}
                  placeholder="Ex: VPL-FH500L"
                  className={FIELD_INPUT_CLASS}
                />
                {errors.model && (
                  <p className="text-sm text-destructive">{errors.model.message}</p>
                )}
              </Field>

              <Field>
                <Label htmlFor="serialNumber">Número de série</Label>
                <Input
                  id="serialNumber"
                  {...register('serialNumber')}
                  placeholder="Ex: SN123456789"
                  className={FIELD_INPUT_CLASS}
                />
                {errors.serialNumber && (
                  <p className="text-sm text-destructive">{errors.serialNumber.message}</p>
                )}
              </Field>

              <Field>
                <Label htmlFor="acquisitionDate">Data de aquisição *</Label>
                <Input
                  id="acquisitionDate"
                  type="date"
                  {...register('acquisitionDate')}
                  className={cn(FIELD_INPUT_CLASS, 'pr-3')}
                />
                {errors.acquisitionDate && (
                  <p className="text-sm text-destructive">{errors.acquisitionDate.message}</p>
                )}
              </Field>

              <Field>
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setValue('status', value as EquipmentFormInput['status'])}
                >
                  <SelectTrigger className={FIELD_INPUT_CLASS}>
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
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </Field>

              <Field>
                <Label htmlFor="location">Localização</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="Ex: Sala 201, Almoxarifado"
                  className={FIELD_INPUT_CLASS}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </Field>
            </div>

            <Field>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                rows={4}
                {...register('notes')}
                placeholder="Informações adicionais sobre o equipamento"
                className={FIELD_TEXTAREA_CLASS}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              )}
            </Field>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button 
                type="submit" 
                disabled={isSubmitting || createMutation.isPending}
                className="h-12 flex-1 rounded-xl border border-accent/30 bg-accent/20 text-foreground transition hover:bg-accent/30"
              >
                {isSubmitting || createMutation.isPending ? 'Cadastrando...' : 'Cadastrar equipamento'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()} 
                className="h-12 rounded-xl border-border"
                disabled={isSubmitting || createMutation.isPending}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </SectionShell>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}



