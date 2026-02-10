'use client';

import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { type FieldErrors, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Circle, Loader2, MapPin, UserRound, Users2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Progress } from '@/shared/ui/progress';
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
type FormTab = 'principal' | 'endereco' | 'contatos';

const TAB_SEQUENCE: FormTab[] = ['principal', 'endereco', 'contatos'];
const TAB_TITLES: Record<FormTab, string> = {
  principal: 'Principal',
  endereco: 'Endereco',
  contatos: 'Contatos Secundarios',
};

const PRINCIPAL_FIELDS: Array<keyof FormData> = [
  'tipo',
  'cpfCnpj',
  'nome',
  'cargo',
  'contatoNome',
  'contatoEmail',
  'contatoTelefone',
  'ativo',
];

const ENDERECO_FIELDS: Array<keyof FormData> = [
  'cep',
  'endereco',
  'numero',
  'complemento',
  'bairro',
  'cidade',
  'estado',
];

const TAB_FIELDS_ORDER: Record<FormTab, Array<keyof FormData>> = {
  principal: ['cpfCnpj', 'nome', 'cargo', 'contatoNome', 'contatoEmail', 'contatoTelefone', 'tipo', 'ativo'],
  endereco: ['cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado'],
  contatos: ['contatosSecundarios'],
};

const FIELD_FOCUS_ID: Partial<Record<keyof FormData, string>> = {
  cpfCnpj: 'cpfCnpj',
  nome: 'nome',
  cargo: 'cargo',
  contatoNome: 'contatoNome',
  contatoEmail: 'contatoEmail',
  contatoTelefone: 'contatoTelefone',
  cep: 'cep',
  endereco: 'endereco',
  numero: 'numero',
  complemento: 'complemento',
  bairro: 'bairro',
  cidade: 'cidade',
  estado: 'estado',
};

function hasMinLength(value: string | null | undefined, minLength = 1): boolean {
  return (value ?? '').trim().length >= minLength;
}

function countCompleted(checks: boolean[]): number {
  return checks.reduce((total, done) => total + Number(done), 0);
}

function isTab(value: string): value is FormTab {
  return TAB_SEQUENCE.includes(value as FormTab);
}

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
  const [activeTab, setActiveTab] = useState<FormTab>('principal');
  const [contatosSecundarios, setContatosSecundarios] = useState<ContatoSecundarioSchema[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    // Known issue: Type mismatch between zodResolver and react-hook-form versions.
    // 'as any' is required to avoid TS2322 error: "Type 'undefined' is not assignable to type 'number'" in ResolverOptions.
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
          contatosSecundarios:
            initialData.contatosSecundarios?.map(c => ({
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
  const nome = watch('nome');
  const contatoNome = watch('contatoNome');
  const contatoEmail = watch('contatoEmail');
  const contatoTelefone = watch('contatoTelefone');
  const endereco = watch('endereco');
  const numero = watch('numero');
  const bairro = watch('bairro');
  const cidade = watch('cidade');
  const estado = watch('estado');

  const formProgress = useMemo(() => {
    const documentDigits = removeNonNumeric(cpfCnpj ?? '');
    const expectedDocumentLength = tipo === 'fisica' ? 11 : 14;
    const isDocumentComplete = documentDigits.length === expectedDocumentLength;

    const phoneDigits = removeNonNumeric(contatoTelefone ?? '');
    const normalizedPhoneDigits =
      phoneDigits.startsWith('55') && phoneDigits.length > 11 ? phoneDigits.slice(2) : phoneDigits;
    const isPhoneComplete = normalizedPhoneDigits.length >= 10 && normalizedPhoneDigits.length <= 11;

    const principalChecks = [
      isDocumentComplete,
      hasMinLength(nome, 3),
      hasMinLength(contatoNome, 3),
      hasMinLength(contatoEmail, 5),
      isPhoneComplete,
    ];

    const cepDigits = removeNonNumeric(cep ?? '');
    const isCepComplete = cepDigits.length === 8;
    const isStateComplete = hasMinLength(estado, 2);

    const enderecoChecks = [
      isCepComplete,
      hasMinLength(endereco, 3),
      hasMinLength(numero, 1),
      hasMinLength(bairro, 2),
      hasMinLength(cidade, 2),
      isStateComplete,
    ];

    const principalDone = countCompleted(principalChecks);
    const enderecoDone = countCompleted(enderecoChecks);
    const contatosDone = contatosSecundarios.length > 0 ? 1 : 0;

    const pendingPrincipal = [
      !isDocumentComplete ? `${tipo === 'fisica' ? 'CPF' : 'CNPJ'} valido` : null,
      !hasMinLength(nome, 3) ? 'nome principal' : null,
      !hasMinLength(contatoNome, 3) ? 'nome do contato' : null,
      !hasMinLength(contatoEmail, 5) ? 'e-mail do contato' : null,
      !isPhoneComplete ? 'telefone principal' : null,
    ].filter((item): item is string => Boolean(item));

    const pendingEndereco = [
      !isCepComplete ? 'CEP' : null,
      !hasMinLength(endereco, 3) ? 'logradouro' : null,
      !hasMinLength(numero, 1) ? 'numero' : null,
      !hasMinLength(bairro, 2) ? 'bairro' : null,
      !hasMinLength(cidade, 2) ? 'cidade' : null,
      !isStateComplete ? 'UF' : null,
    ].filter((item): item is string => Boolean(item));

    const principalCompleted = principalDone === principalChecks.length;
    const enderecoCompleted = enderecoDone === enderecoChecks.length;
    const requiredStepsDone = Number(principalCompleted) + Number(enderecoCompleted);
    const requiredStepsTotal = 2;

    return {
      principal: {
        done: principalDone,
        total: principalChecks.length,
        completed: principalCompleted,
      },
      endereco: {
        done: enderecoDone,
        total: enderecoChecks.length,
        completed: enderecoCompleted,
      },
      contatos: {
        done: contatosDone,
        total: 1,
        completed: contatosDone > 0,
      },
      progress: Math.round((requiredStepsDone / requiredStepsTotal) * 100),
      requiredStepsDone,
      requiredStepsTotal,
      pending: {
        principal: pendingPrincipal,
        endereco: pendingEndereco,
        contatos: [] as string[],
      } satisfies Record<FormTab, string[]>,
    };
  }, [
    tipo,
    cpfCnpj,
    nome,
    contatoNome,
    contatoEmail,
    contatoTelefone,
    cep,
    endereco,
    numero,
    bairro,
    cidade,
    estado,
    contatosSecundarios.length,
  ]);

  // Load secondary contacts when initialData is present
  useEffect(() => {
    if (initialData?.contatosSecundarios) {
      setContatosSecundarios(
        initialData.contatosSecundarios.map(c => ({
          id: c.id,
          nome: c.nome,
          email: c.email || undefined,
          telefone: c.telefone || undefined,
          cargo: c.cargo || undefined,
        }))
      );
      return;
    }

    setContatosSecundarios([]);
  }, [initialData]);

  const handleTipoChange = (novoTipo: 'fisica' | 'juridica') => {
    setValue('tipo', novoTipo, { shouldDirty: true });
    setValue('cpfCnpj', '', { shouldDirty: true, shouldValidate: true });
  };

  const handleDocumentValidation = (isValid: boolean, data?: unknown) => {
    if (!isValid || !data || tipo !== 'juridica') {
      return;
    }

    const companyData = data as {
      razao_social?: string;
      cep?: string;
      logradouro?: string;
      descricao_tipo_logradouro?: string;
      numero?: string;
      complemento?: string;
      bairro?: string;
      municipio?: string;
      uf?: string;
    };

    if (companyData.razao_social) {
      setValue('nome', companyData.razao_social, { shouldDirty: true });
    }

    if (companyData.cep) {
      const cepLimpo = removeNonNumeric(companyData.cep);
      const cepFormatado =
        cepLimpo.length === 8 ? `${cepLimpo.slice(0, 5)}-${cepLimpo.slice(5)}` : companyData.cep;
      setValue('cep', cepFormatado, { shouldDirty: true });
    }

    if (companyData.logradouro) {
      const enderecoCompleto = companyData.descricao_tipo_logradouro
        ? `${companyData.descricao_tipo_logradouro} ${companyData.logradouro}`
        : companyData.logradouro;
      setValue('endereco', enderecoCompleto, { shouldDirty: true });
    }

    if (companyData.numero) setValue('numero', companyData.numero, { shouldDirty: true });
    if (companyData.complemento) setValue('complemento', companyData.complemento, { shouldDirty: true });
    if (companyData.bairro) setValue('bairro', companyData.bairro, { shouldDirty: true });
    if (companyData.municipio) setValue('cidade', companyData.municipio, { shouldDirty: true });
    if (companyData.uf) setValue('estado', companyData.uf, { shouldDirty: true });
  };

  const handleAddressFound = (address: {
    logradouro?: string;
    bairro?: string;
    localidade?: string;
    uf?: string;
    complemento?: string;
  }) => {
    setValue('endereco', address.logradouro || '', { shouldDirty: true });
    setValue('bairro', address.bairro || '', { shouldDirty: true });
    setValue('cidade', address.localidade || '', { shouldDirty: true });
    setValue('estado', address.uf || '', { shouldDirty: true });

    if (address.complemento) {
      setValue('complemento', address.complemento, { shouldDirty: true });
    }
  };

  const handleSecondaryContactsChange = (contatos: ContatoSecundarioSchema[]) => {
    setContatosSecundarios(contatos);
    setValue('contatosSecundarios', contatos, { shouldDirty: true, shouldValidate: true });
  };

  const activeTabIndex = TAB_SEQUENCE.indexOf(activeTab);
  const canGoBack = activeTabIndex > 0;
  const canGoForward = activeTabIndex < TAB_SEQUENCE.length - 1;

  const handlePreviousTab = () => {
    if (!canGoBack) {
      return;
    }

    setActiveTab(TAB_SEQUENCE[activeTabIndex - 1]);
  };

  const handleNextTab = () => {
    if (!canGoForward) {
      return;
    }

    setActiveTab(TAB_SEQUENCE[activeTabIndex + 1]);
  };

  const resolveTabFromErrors = (formErrors: FieldErrors<FormData>): FormTab => {
    const erroredFields = new Set(Object.keys(formErrors) as Array<keyof FormData>);

    if (PRINCIPAL_FIELDS.some(field => erroredFields.has(field))) {
      return 'principal';
    }

    if (ENDERECO_FIELDS.some(field => erroredFields.has(field))) {
      return 'endereco';
    }

    return 'contatos';
  };

  const focusFirstErrorField = (formErrors: FieldErrors<FormData>, tab: FormTab) => {
    const firstErroredField = TAB_FIELDS_ORDER[tab].find(field => Boolean(formErrors[field]));
    if (!firstErroredField) {
      return;
    }

    const fieldId = FIELD_FOCUS_ID[firstErroredField];
    if (!fieldId) {
      return;
    }

    requestAnimationFrame(() => {
      document.getElementById(fieldId)?.focus();
    });
  };

  const handleInvalidSubmit = (formErrors: FieldErrors<FormData>) => {
    const errorTab = resolveTabFromErrors(formErrors);
    setActiveTab(errorTab);
    focusFirstErrorField(formErrors, errorTab);
    toast.error(`Existem campos obrigatorios pendentes na etapa ${TAB_TITLES[errorTab]}.`);
  };

  const handleTelefoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let digits = removeNonNumeric(value);

    // Remove country code prefix if present (55)
    if (digits.startsWith('55') && digits.length > 2) {
      digits = digits.slice(2);
    }

    // Allow clearing the field
    if (digits.length === 0) {
      setValue('contatoTelefone', '', { shouldDirty: true });
      return;
    }

    // Limit to 11 digits (DDD + number)
    digits = digits.slice(0, 11);

    let formatted = '+55 ';
    if (digits.length <= 2) {
      formatted += `(${digits}`;
    } else if (digits.length <= 6) {
      formatted += `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 10) {
      formatted += `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else {
      formatted += `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
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

  const activeTabPending = formProgress.pending[activeTab];
  const activeTabBadge =
    activeTab === 'principal'
      ? formProgress.principal
      : activeTab === 'endereco'
        ? formProgress.endereco
        : formProgress.contatos;

  return (
    <>
      <form onSubmit={handleSubmit(handleFormSubmit as any, handleInvalidSubmit)} className="space-y-6">
        <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Progresso do cadastro</p>
              <p className="text-xs text-muted-foreground">
                {formProgress.requiredStepsDone} de {formProgress.requiredStepsTotal} etapas obrigatorias concluidas
              </p>
            </div>
            <span className="text-sm font-semibold text-primary">{formProgress.progress}%</span>
          </div>
          <Progress value={formProgress.progress} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Etapa atual: {TAB_TITLES[activeTab]} ({activeTabBadge.done}/{activeTabBadge.total})
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={value => {
            if (isTab(value)) {
              setActiveTab(value);
            }
          }}
        >
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 sm:grid-cols-3">
            <TabsTrigger
              value="principal"
              className={cn(
                'h-auto items-center justify-between rounded-lg border border-border bg-card px-3 py-2',
                'data-[state=active]:border-primary/40 data-[state=active]:bg-primary/5 data-[state=active]:shadow-none'
              )}
            >
              <span className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <span className="font-medium">Principal</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {formProgress.principal.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                {formProgress.principal.done}/{formProgress.principal.total}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="endereco"
              className={cn(
                'h-auto items-center justify-between rounded-lg border border-border bg-card px-3 py-2',
                'data-[state=active]:border-primary/40 data-[state=active]:bg-primary/5 data-[state=active]:shadow-none'
              )}
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Endereco</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {formProgress.endereco.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                {formProgress.endereco.done}/{formProgress.endereco.total}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="contatos"
              className={cn(
                'h-auto items-center justify-between rounded-lg border border-border bg-card px-3 py-2',
                'data-[state=active]:border-primary/40 data-[state=active]:bg-primary/5 data-[state=active]:shadow-none'
              )}
            >
              <span className="flex items-center gap-2">
                <Users2 className="h-4 w-4" />
                <span className="font-medium">Contatos Secundarios</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {formProgress.contatos.completed ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Circle className="h-3.5 w-3.5" />
                )}
                {formProgress.contatos.done > 0 ? 'Adicionado' : 'Opcional'}
              </span>
            </TabsTrigger>
          </TabsList>

          {activeTabPending.length > 0 && activeTab !== 'contatos' && (
            <div
              className="rounded-lg border border-amber-400/30 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              Faltam campos obrigatorios: {activeTabPending.join(', ')}.
            </div>
          )}

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
                  Pessoa Fisica (CPF)
                </Button>
                <Button
                  type="button"
                  variant={tipo === 'juridica' ? 'default' : 'outline'}
                  onClick={() => handleTipoChange('juridica')}
                  disabled={isLoading || isSubmitting || !!initialData}
                >
                  Pessoa Juridica (CNPJ)
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12 items-start">
              {tipo === 'juridica' && (
                <div className="md:col-span-6 lg:col-span-5">
                  <CpfCnpjInput
                    tipo={tipo}
                    value={cpfCnpj}
                    onChange={value => setValue('cpfCnpj', value, { shouldDirty: true })}
                    onValidationComplete={handleDocumentValidation}
                    error={errors.cpfCnpj?.message}
                    disabled={isLoading || isSubmitting}
                  />
                </div>
              )}

              <div className={cn(
                "space-y-2 md:col-span-6",
                tipo === 'juridica' ? "lg:col-span-4" : "md:col-span-12 lg:col-span-5"
              )}>
                <Label htmlFor="nome">{tipo === 'fisica' ? 'Nome Completo' : 'Nome/Empresa'} *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder={tipo === 'fisica' ? 'Digite o nome completo' : 'Digite o nome da empresa'}
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.nome && 'border-red-500')}
                />
                {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
              </div>

              {tipo !== 'juridica' && (
                <div className="md:col-span-6 lg:col-span-4">
                  <CpfCnpjInput
                    tipo={tipo}
                    value={cpfCnpj}
                    onChange={value => setValue('cpfCnpj', value, { shouldDirty: true })}
                    onValidationComplete={handleDocumentValidation}
                    error={errors.cpfCnpj?.message}
                    disabled={isLoading || isSubmitting}
                  />
                </div>
              )}

              <div className="space-y-2 md:col-span-6 lg:col-span-3">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  {...register('cargo')}
                  placeholder="Digite o cargo"
                  disabled={isLoading || isSubmitting}
                />
              </div>
            </div>

            <Separator />

            <h3 className="text-lg font-medium">Contato Principal</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contatoNome">Nome do Contato *</Label>
                <Input
                  id="contatoNome"
                  {...register('contatoNome')}
                  placeholder="Digite o nome do contato"
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.contatoNome && 'border-red-500')}
                />
                {errors.contatoNome && <p className="text-sm text-red-600">{errors.contatoNome.message}</p>}
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
                {errors.contatoTelefone && <p className="text-sm text-red-600">{errors.contatoTelefone.message}</p>}
              </div>

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
                {errors.contatoEmail && <p className="text-sm text-red-600">{errors.contatoEmail.message}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={ativo === 1}
                onCheckedChange={checked => setValue('ativo', checked ? 1 : 0, { shouldDirty: true })}
                disabled={isLoading || isSubmitting}
              />
              <Label htmlFor="ativo">Cliente Ativo</Label>
            </div>

            {formProgress.principal.completed && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Etapa principal concluida. Continue para endereco.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveTab('endereco')}
                  disabled={isLoading || isSubmitting}
                >
                  Ir para Endereco
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Aba Endereco */}
          <TabsContent value="endereco" className="space-y-4">
            <CepInput
              value={cep}
              onChange={value => setValue('cep', value, { shouldDirty: true })}
              onAddressFound={handleAddressFound}
              error={errors.cep?.message}
              disabled={isLoading || isSubmitting}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="endereco">Logradouro *</Label>
                <Input
                  id="endereco"
                  {...register('endereco')}
                  placeholder="Rua, Avenida, etc."
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.endereco && 'border-red-500')}
                />
                {errors.endereco && <p className="text-sm text-red-600">{errors.endereco.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero">Numero *</Label>
                <Input
                  id="numero"
                  {...register('numero')}
                  placeholder="123"
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.numero && 'border-red-500')}
                />
                {errors.numero && <p className="text-sm text-red-600">{errors.numero.message}</p>}
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  {...register('bairro')}
                  placeholder="Centro"
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.bairro && 'border-red-500')}
                />
                {errors.bairro && <p className="text-sm text-red-600">{errors.bairro.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade *</Label>
                <Input
                  id="cidade"
                  {...register('cidade')}
                  placeholder="Sao Paulo"
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.cidade && 'border-red-500')}
                />
                {errors.cidade && <p className="text-sm text-red-600">{errors.cidade.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <Input
                  id="estado"
                  {...register('estado', {
                    onChange: (event) => {
                      event.target.value = String(event.target.value ?? '').toUpperCase();
                    },
                  })}
                  placeholder="SP"
                  maxLength={2}
                  disabled={isLoading || isSubmitting}
                  className={cn(errors.estado && 'border-red-500 uppercase')}
                />
                {errors.estado && <p className="text-sm text-red-600">{errors.estado.message}</p>}
              </div>
            </div>

            {formProgress.endereco.completed && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  Endereco completo. Se quiser, adicione contatos secundarios.
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setActiveTab('contatos')}
                  disabled={isLoading || isSubmitting}
                >
                  Ir para Contatos
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Aba Contatos Secundarios */}
          <TabsContent value="contatos" className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-xs text-muted-foreground">
              Esta etapa e opcional. Use para cadastrar mais pessoas de contato do mesmo cliente.
            </div>
            <ContatosSecundariosManager
              contatos={contatosSecundarios}
              onChange={handleSecondaryContactsChange}
              disabled={isLoading || isSubmitting}
            />
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePreviousTab}
              disabled={!canGoBack || isLoading || isSubmitting}
            >
              Etapa anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleNextTab}
              disabled={!canGoForward || isLoading || isSubmitting}
            >
              Proxima etapa
            </Button>
          </div>

          <div className="flex justify-end gap-3">
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
        </div>
      </form>

      {/* Cancel confirmation dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alteracoes?</AlertDialogTitle>
            <AlertDialogDescription>
              Voce tem alteracoes nao salvas. Tem certeza que deseja descartar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowCancelDialog(false)}>
              Continuar editando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowCancelDialog(false);
                onCancel();
              }}
            >
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
