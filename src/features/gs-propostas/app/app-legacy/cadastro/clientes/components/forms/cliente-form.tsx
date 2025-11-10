'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Separator } from '@/shared/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
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
import { cn } from '@/shared/lib/utils';
import { removeNonNumeric } from '@/shared/lib/validators';
import { CpfCnpjInput } from '../inputs/cpf-cnpj-input';
import { CepInput } from '../inputs/cep-input';
import { ContatosSecundariosManager } from './contatos-secundarios-manager';
import { clienteFormSchema } from '../../types/cliente-schemas';
import type { Cliente, ClienteFormData } from '../../types/cliente';
import type { ContatoSecundarioSchema } from '../../types/cliente-schemas';
import { z } from 'zod';

// ============================================
// TYPES
// ============================================

export interface ClienteFormProps {
  initialData?: Cliente;
  onSubmit: (data: ClienteFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

type FormData = z.infer<typeof clienteFormSchema>;

// ============================================
// COMPONENT
// ============================================

export function ClienteForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ClienteFormProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('principal');
  const [contatosSecundarios, setContatosSecundarios] = useState<ContatoSecundarioSchema[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    // TODO (LOW): Remover 'as any' quando react-hook-form resolver incompatibilidade de tipos com zodResolver
    resolver: zodResolver(clienteFormSchema) as any,
    defaultValues: initialData
      ? {
          tipo: initialData.tipo,
          cpfCnpj: initialData.cpfCnpj,
          nome: initialData.nome,
          cargo: initialData.cargo || undefined,
          cep: initialData.cep,
          endereco: initialData.endereco,
          numero: initialData.numero,
          complemento: initialData.complemento || undefined,
          bairro: initialData.bairro,
          cidade: initialData.cidade,
          estado: initialData.estado,
          contatoNome: initialData.contatoNome,
          contatoEmail: initialData.contatoEmail,
          contatoTelefone: initialData.contatoTelefone,
          ativo: initialData.ativo,
          contatosSecundarios: initialData.contatosSecundarios?.map(c => ({
            id: c.id,
            nome: c.nome,
            email: c.email || undefined,
            telefone: c.telefone || undefined,
            cargo: c.cargo || undefined,
          })) || [],
        }
      : {
          tipo: 'fisica' as const,
          cpfCnpj: '',
          nome: '',
          cargo: undefined,
          cep: '',
          endereco: '',
          numero: '',
          complemento: undefined,
          bairro: '',
          cidade: '',
          estado: '',
          contatoNome: '',
          contatoEmail: '',
          contatoTelefone: '',
          ativo: 1,
          contatosSecundarios: [],
        },
  });

  const tipo = watch('tipo');
  const cpfCnpj = watch('cpfCnpj');
  const cep = watch('cep');
  const ativo = watch('ativo');

  // Carregar contatos secundários quando houver initialData
  useEffect(() => {
    if (initialData?.contatosSecundarios) {
      setContatosSecundarios(initialData.contatosSecundarios.map(c => ({
        id: c.id,
        nome: c.nome,
        email: c.email || undefined,
        telefone: c.telefone || undefined,
        cargo: c.cargo || undefined,
      })));
    }
  }, [initialData]);

  const handleTipoChange = (novoTipo: 'fisica' | 'juridica') => {
    setValue('tipo', novoTipo, { shouldDirty: true });
    setValue('cpfCnpj', '');
  };

  const handleDocumentValidation = (isValid: boolean, data?: any) => {
    if (isValid && data && tipo === 'juridica') {
      if (data.razao_social) {
        setValue('nome', data.razao_social, { shouldDirty: true });
      }

      if (data.cep) {
        const cepLimpo = removeNonNumeric(data.cep);
        const cepFormatado = cepLimpo.length === 8
          ? `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}`
          : data.cep;
        setValue('cep', cepFormatado, { shouldDirty: true });
      }

      if (data.logradouro) {
        const enderecoCompleto = data.descricao_tipo_logradouro
          ? `${data.descricao_tipo_logradouro} ${data.logradouro}`
          : data.logradouro;
        setValue('endereco', enderecoCompleto, { shouldDirty: true });
      }

      if (data.numero) setValue('numero', data.numero, { shouldDirty: true });
      if (data.complemento) setValue('complemento', data.complemento, { shouldDirty: true });
      if (data.bairro) setValue('bairro', data.bairro, { shouldDirty: true });
      if (data.municipio) setValue('cidade', data.municipio, { shouldDirty: true });
      if (data.uf) setValue('estado', data.uf, { shouldDirty: true });
    }
  };

  const handleAddressFound = (address: any) => {
    setValue('endereco', address.logradouro || '', { shouldDirty: true });
    setValue('bairro', address.bairro || '', { shouldDirty: true });
    setValue('cidade', address.localidade || '', { shouldDirty: true });
    setValue('estado', address.uf || '', { shouldDirty: true });

    if (address.complemento) {
      setValue('complemento', address.complemento, { shouldDirty: true });
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
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

    setValue('contatoTelefone', formatted, { shouldDirty: true });
  };

  const handleCancelClick = () => {
    if (isDirty) {
      setShowCancelDialog(true);
    } else {
      onCancel();
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const cleanData: ClienteFormData = {
        tipo: data.tipo,
        cpfCnpj: removeNonNumeric(data.cpfCnpj),
        nome: data.nome,
        cargo: data.cargo || null,
        cep: removeNonNumeric(data.cep),
        endereco: data.endereco,
        numero: data.numero,
        complemento: data.complemento || null,
        bairro: data.bairro,
        cidade: data.cidade,
        estado: data.estado,
        contatoNome: data.contatoNome,
        contatoEmail: data.contatoEmail,
        contatoTelefone: removeNonNumeric(data.contatoTelefone),
        ativo: data.ativo,
        contatosSecundarios: contatosSecundarios.map(contato => ({
          ...contato,
          telefone: contato.telefone ? removeNonNumeric(contato.telefone) : undefined,
        })),
      };

      await onSubmit(cleanData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit as any)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="principal">Principal</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
            <TabsTrigger value="contatos">Contatos Secundários</TabsTrigger>
          </TabsList>

          {/* Aba Principal */}
          <TabsContent value="principal" className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Pessoa</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={tipo === 'fisica' ? 'default' : 'outline'}
                  onClick={() => handleTipoChange('fisica')}
                  disabled={isLoading || isSubmitting || !!initialData}
                >
                  Pessoa Física (CPF)
                </Button>
                <Button
                  type="button"
                  variant={tipo === 'juridica' ? 'default' : 'outline'}
                  onClick={() => handleTipoChange('juridica')}
                  disabled={isLoading || isSubmitting || !!initialData}
                >
                  Pessoa Jurídica (CNPJ)
                </Button>
              </div>
            </div>

            <CpfCnpjInput
              tipo={tipo}
              value={cpfCnpj}
              onChange={(value) => setValue('cpfCnpj', value, { shouldDirty: true })}
              onValidationComplete={handleDocumentValidation}
              error={errors.cpfCnpj?.message}
              disabled={isLoading || isSubmitting}
            />

            <div className="space-y-2">
              <Label htmlFor="nome">
                {tipo === 'fisica' ? 'Nome Completo' : 'Nome/Empresa'} *
              </Label>
              <Input
                id="nome"
                {...register('nome')}
                placeholder={tipo === 'fisica' ? 'Digite o nome completo' : 'Digite o nome da empresa'}
                disabled={isLoading || isSubmitting}
                className={cn(errors.nome && 'border-red-500')}
              />
              {errors.nome && (
                <p className="text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                {...register('cargo')}
                placeholder="Digite o cargo"
                disabled={isLoading || isSubmitting}
              />
            </div>

            <Separator />

            <h3 className="text-lg font-medium">Contato Principal</h3>

            <div className="space-y-2">
              <Label htmlFor="contatoNome">Nome do Contato *</Label>
              <Input
                id="contatoNome"
                {...register('contatoNome')}
                placeholder="Digite o nome do contato"
                disabled={isLoading || isSubmitting}
                className={cn(errors.contatoNome && 'border-red-500')}
              />
              {errors.contatoNome && (
                <p className="text-sm text-red-600">{errors.contatoNome.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contatoEmail">E-mail *</Label>
                <Input
                  id="contatoEmail"
                  type="email"
                  {...register('contatoEmail')}
                  placeholder="exemplo@email.com"
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.contatoEmail && 'border-red-500')}
                />
                {errors.contatoEmail && (
                  <p className="text-sm text-red-600">{errors.contatoEmail.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contatoTelefone">Telefone *</Label>
                <Input
                  id="contatoTelefone"
                  {...register('contatoTelefone')}
                  onChange={handleTelefoneChange}
                  placeholder="+55 (00) 00000-0000"
                  maxLength={19}
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.contatoTelefone && 'border-red-500')}
                />
                {errors.contatoTelefone && (
                  <p className="text-sm text-red-600">{errors.contatoTelefone.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={ativo === 1}
                onCheckedChange={(checked) => setValue('ativo', checked ? 1 : 0, { shouldDirty: true })}
                disabled={isLoading || isSubmitting}
              />
              <Label htmlFor="ativo">Cliente Ativo</Label>
            </div>
          </TabsContent>

          {/* Aba Endereço */}
          <TabsContent value="endereco" className="space-y-4">
            <CepInput
              value={cep}
              onChange={(value) => setValue('cep', value, { shouldDirty: true })}
              onAddressFound={handleAddressFound}
              error={errors.cep?.message}
              disabled={isLoading || isSubmitting}
            />

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3 space-y-2">
                <Label htmlFor="endereco">Logradouro *</Label>
                <Input
                  id="endereco"
                  {...register('endereco')}
                  placeholder="Rua, Avenida, etc."
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.endereco && 'border-red-500')}
                />
                {errors.endereco && (
                  <p className="text-sm text-red-600">{errors.endereco.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  {...register('numero')}
                  placeholder="123"
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.numero && 'border-red-500')}
                />
                {errors.numero && (
                  <p className="text-sm text-red-600">{errors.numero.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                {...register('complemento')}
                placeholder="Apto, Sala, Bloco, etc."
                disabled={isLoading || isSubmitting}
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  {...register('bairro')}
                  placeholder="Centro"
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.bairro && 'border-red-500')}
                />
                {errors.bairro && (
                  <p className="text-sm text-red-600">{errors.bairro.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  {...register('cidade')}
                  placeholder="São Paulo"
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.cidade && 'border-red-500')}
                />
                {errors.cidade && (
                  <p className="text-sm text-red-600">{errors.cidade.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  {...register('estado')}
                  placeholder="SP"
                  maxLength={2}
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.estado && 'border-red-500 uppercase')}
                />
                {errors.estado && (
                  <p className="text-sm text-red-600">{errors.estado.message}</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Aba Contatos Secundários */}
          <TabsContent value="contatos" className="space-y-4">
            <ContatosSecundariosManager
              contatos={contatosSecundarios}
              onChange={(contatos) => setValue('contatosSecundarios', contatos, { shouldDirty: true })}
              disabled={isLoading || isSubmitting}
            />
          </TabsContent>
        </Tabs>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancelClick}
            disabled={isLoading || isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Atualizar' : 'Cadastrar'}
          </Button>
        </div>
      </form>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem alterações não salvas. Tem certeza que deseja descartar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelDialog(false)}>
              Continuar editando
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowCancelDialog(false); onCancel(); }}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}



