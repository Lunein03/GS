'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Building2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import {
  fetchAddressByCEP,
  fetchCNPJDataWithCache,
  isAddressError,
  isCNPJError,
} from '@/shared/lib/api-services';
import {
  formatCEP,
  formatCNPJ,
  formatCPF,
  formatPhone,
  removeNonNumeric,
  validateCPF,
} from '@/shared/lib/validators';
import { companyFormSchema, type Company, type CompanyFormSchema } from '../types';

const DEFAULT_STATE = 'RJ';

type DocumentType = 'fisica' | 'juridica';

type CompanyFormDialogProps = {
  open: boolean;
  mode: 'create' | 'edit';
  company?: Company | null;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CompanyFormSchema) => Promise<void> | void;
};

const states = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB',
  'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

const sectionTitleClasses = 'text-sm font-medium text-muted-foreground uppercase tracking-wide';

const resolveDocumentType = (digits: string, fallback: DocumentType = 'juridica'): DocumentType => {
  if (digits.length === 11) {
    return 'fisica';
  }

  if (digits.length >= 12) {
    return 'juridica';
  }

  return fallback;
};

const formatDocumentValue = (digits: string, rawValue: string): string => {
  if (digits.length === 11) {
    return formatCPF(digits);
  }

  if (digits.length === 14) {
    return formatCNPJ(digits);
  }

  return rawValue.trim();
};

export function CompanyFormDialog({
  open,
  mode,
  company,
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: CompanyFormDialogProps) {
  const [isConsultingDocument, setIsConsultingDocument] = useState(false);
  const [isConsultingCep, setIsConsultingCep] = useState(false);
  const [activeTab, setActiveTab] = useState<'principal' | 'endereco'>('principal');
  const [isPrincipalComplete, setIsPrincipalComplete] = useState(false);

  const form = useForm<CompanyFormSchema>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      cpfCnpj: '',
      nome: undefined,
      razaoSocial: undefined,
      nomeFantasia: undefined,
      logo: undefined,
      contatoNome: '',
      contatoEmail: '',
      contatoTelefone: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: undefined,
      bairro: '',
      cidade: '',
      estado: DEFAULT_STATE,
    },
  });

  const dialogTitle = mode === 'create' ? 'Cadastrar empresa' : 'Editar empresa';
  const submitLabel = mode === 'create' ? 'Salvar' : 'Atualizar';

  const getMessage = (value: unknown): string | undefined =>
    typeof value === 'string' ? value : undefined;

  const errors = form.formState.errors;
  const cpfError = getMessage(errors.cpfCnpj?.message);
  const razaoSocialError = getMessage(errors.razaoSocial?.message);
  const nomeError = getMessage(errors.nome?.message);
  const nomeFantasiaError = getMessage(errors.nomeFantasia?.message);
  const logoError = getMessage(errors.logo?.message);
  const contatoNomeError = getMessage(errors.contatoNome?.message);
  const contatoTelefoneError = getMessage(errors.contatoTelefone?.message);
  const contatoEmailError = getMessage(errors.contatoEmail?.message);
  const cepError = getMessage(errors.cep?.message);
  const enderecoError = getMessage(errors.endereco?.message);
  const numeroError = getMessage(errors.numero?.message);
  const complementoError = getMessage(errors.complemento?.message);
  const bairroError = getMessage(errors.bairro?.message);
  const cidadeError = getMessage(errors.cidade?.message);
  const estadoError = getMessage(errors.estado?.message);

  const documentValue = form.watch('cpfCnpj');
  const documentDigits = useMemo(() => removeNonNumeric(documentValue ?? ''), [documentValue]);

  const inferredType = useMemo<DocumentType>(() => {
    return resolveDocumentType(documentDigits, company?.tipo ?? 'juridica');
  }, [documentDigits, company?.tipo]);

  const isPessoaJuridica = inferredType === 'juridica';

  const contactDescription = useMemo(
    () =>
      isPessoaJuridica
        ? 'Informe os dados da empresa e do responsável pelo contato principal.'
        : 'Informe os dados do profissional e os dados de contato.',
    [isPessoaJuridica],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (company) {
      const companyDocumentDigits = removeNonNumeric(company.cpfCnpj);
      form.reset({
        cpfCnpj: formatDocumentValue(companyDocumentDigits, company.cpfCnpj),
        nome: company.nome ?? undefined,
        razaoSocial: company.razaoSocial ?? undefined,
        nomeFantasia: company.nomeFantasia ?? undefined,
        logo: company.logo ?? undefined,
        contatoNome: company.contatoNome,
        contatoEmail: company.contatoEmail,
        contatoTelefone: formatPhone(company.contatoTelefone),
        cep: formatCEP(company.cep),
        endereco: company.endereco,
        numero: company.numero,
        complemento: company.complemento ?? undefined,
        bairro: company.bairro,
        cidade: company.cidade,
        estado: company.estado,
      });
      setActiveTab('principal');
      setIsPrincipalComplete(true);
      return;
    }

    form.reset({
      cpfCnpj: '',
      nome: undefined,
      razaoSocial: undefined,
      nomeFantasia: undefined,
      logo: undefined,
      contatoNome: '',
      contatoEmail: '',
      contatoTelefone: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: undefined,
      bairro: '',
      cidade: '',
      estado: DEFAULT_STATE,
    });
    setActiveTab('principal');
    setIsPrincipalComplete(false);
  }, [open, company, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit({
      ...data,
      cpfCnpj: data.cpfCnpj.trim(),
      contatoEmail: data.contatoEmail.trim(),
      contatoTelefone: data.contatoTelefone.trim(),
      cep: data.cep.trim(),
      endereco: data.endereco.trim(),
      numero: data.numero.trim(),
      bairro: data.bairro.trim(),
      cidade: data.cidade.trim(),
      estado: data.estado.trim().toUpperCase(),
    });
  });

  const handleConsultDocument = async () => {
    const digits = removeNonNumeric(form.getValues('cpfCnpj'));

    if (digits.length === 11) {
      if (!validateCPF(digits)) {
        form.setError('cpfCnpj', { type: 'manual', message: 'Campo inválido' });
        toast.error('Informe um CPF válido para continuar.');
        return;
      }

      form.clearErrors('cpfCnpj');
      form.setValue('cpfCnpj', formatCPF(digits), { shouldValidate: true });
      toast.success('CPF validado com sucesso.');
      return;
    }

    if (digits.length !== 14) {
      form.setError('cpfCnpj', { type: 'manual', message: 'Campo inválido' });
      toast.error('Informe um CPF ou CNPJ válido para consultar os dados.');
      return;
    }

    try {
      setIsConsultingDocument(true);
      const result = await fetchCNPJDataWithCache(digits);

      if (isCNPJError(result)) {
        toast.error(result.error);
        return;
      }

      form.clearErrors('cpfCnpj');
      form.setValue('cpfCnpj', formatCNPJ(digits), { shouldValidate: true });
      form.setValue('razaoSocial', result.razao_social ?? '', { shouldValidate: true });
      form.setValue('nomeFantasia', result.nome_fantasia ?? '', { shouldValidate: false });
      form.setValue('endereco', `${result.descricao_tipo_logradouro ?? ''} ${result.logradouro ?? ''}`.trim(), {
        shouldValidate: true,
      });
      form.setValue('numero', result.numero ?? '', { shouldValidate: false });
      form.setValue('bairro', result.bairro ?? '', { shouldValidate: true });
      form.setValue('cidade', result.municipio ?? '', { shouldValidate: true });
      form.setValue('estado', result.uf ?? DEFAULT_STATE, { shouldValidate: true });
      form.setValue('cep', formatCEP(result.cep ?? ''), { shouldValidate: true });

      const primaryPhone = result.ddd_telefone_1 ?? '';
      if (primaryPhone && !form.getValues('contatoTelefone')) {
        form.setValue('contatoTelefone', formatPhone(primaryPhone), { shouldValidate: true });
      }

      toast.success('Dados recuperados com sucesso. Revise as informações antes de salvar.');
    } catch (error) {
      console.error('Erro ao consultar CNPJ:', error);
      toast.error('Não foi possível consultar o CNPJ. Tente novamente.');
    } finally {
      setIsConsultingDocument(false);
    }
  };

  const handleConsultCep = async () => {
    const cepValue = form.getValues('cep');
    const digits = removeNonNumeric(cepValue);

    if (digits.length !== 8) {
      form.setError('cep', { type: 'manual', message: 'Campo inválido' });
      toast.error('Informe um CEP válido para consulta.');
      return;
    }

    try {
      setIsConsultingCep(true);
      const result = await fetchAddressByCEP(digits);

      if (isAddressError(result)) {
        toast.error(result.error);
        return;
      }

      form.clearErrors('cep');
      form.setValue('endereco', result.logradouro ?? '', { shouldValidate: true });
      form.setValue('bairro', result.bairro ?? '', { shouldValidate: true });
      form.setValue('cidade', result.localidade ?? '', { shouldValidate: true });
      form.setValue('estado', result.uf ?? DEFAULT_STATE, { shouldValidate: true });
      form.setValue('cep', formatCEP(digits), { shouldValidate: true });
      toast.success('Endereço preenchido a partir do CEP informado.');
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
      toast.error('Não foi possível consultar o CEP. Tente novamente.');
    } finally {
      setIsConsultingCep(false);
    }
  };

  const handleFormatDocumentOnBlur = () => {
    const digits = removeNonNumeric(form.getValues('cpfCnpj'));
    if (!digits) {
      return;
    }

    const formatted = formatDocumentValue(digits, form.getValues('cpfCnpj'));
    form.setValue('cpfCnpj', formatted, { shouldValidate: true });
  };

  const handleFormatPhoneOnBlur = () => {
    const phoneDigits = removeNonNumeric(form.getValues('contatoTelefone'));
    if (!phoneDigits) {
      return;
    }

    if (phoneDigits.length >= 10) {
      form.setValue('contatoTelefone', formatPhone(phoneDigits), { shouldValidate: true });
    }
  };

  const handleFormatCepOnBlur = () => {
    const digits = removeNonNumeric(form.getValues('cep'));
    if (digits.length === 8) {
      form.setValue('cep', formatCEP(digits), { shouldValidate: true });
    }
  };

  const handleContinueToAddress = async () => {
    const principalFields = (isPessoaJuridica
      ? ['cpfCnpj', 'razaoSocial', 'contatoNome', 'contatoEmail', 'contatoTelefone']
      : ['cpfCnpj', 'nome', 'contatoNome', 'contatoEmail', 'contatoTelefone']) as Array<keyof CompanyFormSchema & string>;

    const isValid = await form.trigger(principalFields);

    if (!isValid) {
      toast.error('Revise os dados principais antes de avançar.');
      return;
    }

    setIsPrincipalComplete(true);
    setActiveTab('endereco');
  };

  const descriptionText = isPessoaJuridica
    ? 'Os dados preenchidos serão utilizados no cabeçalho e rodapé das propostas comerciais.'
    : 'Os dados preenchidos serão exibidos para o responsável cadastrado.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'principal' | 'endereco')} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="principal">Principal</TabsTrigger>
              <TabsTrigger value="endereco" disabled={!isPrincipalComplete}>Endereço</TabsTrigger>
            </TabsList>

            <TabsContent value="principal" className="space-y-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-document">CPF/CNPJ</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        id="company-document"
                        placeholder={isPessoaJuridica ? '00.000.000/0000-00' : '000.000.000-00'}
                        {...form.register('cpfCnpj')}
                        onBlur={handleFormatDocumentOnBlur}
                        disabled={isSubmitting || isConsultingDocument}
                        aria-invalid={Boolean(form.formState.errors.cpfCnpj)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleConsultDocument}
                        disabled={isSubmitting || isConsultingDocument}
                      >
                        {isConsultingDocument ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Consultando...
                          </>
                        ) : (
                          'Consultar'
                        )}
                      </Button>
                    </div>
                    {cpfError && (
                      <p className="text-sm text-destructive" role="alert">
                        {cpfError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-name">
                      {isPessoaJuridica ? 'Razão social' : 'Nome completo'}
                    </Label>
                    <Input
                      id="company-name"
                      placeholder={isPessoaJuridica ? 'Nome jurídico da empresa' : 'Nome completo do profissional'}
                      {...(isPessoaJuridica ? form.register('razaoSocial') : form.register('nome'))}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(
                        isPessoaJuridica
                          ? form.formState.errors.razaoSocial
                          : form.formState.errors.nome,
                      )}
                    />
                    {(isPessoaJuridica ? razaoSocialError : nomeError) && (
                      <p className="text-sm text-destructive" role="alert">
                        {(isPessoaJuridica ? razaoSocialError : nomeError) ?? 'Campo inválido'}
                      </p>
                    )}
                  </div>

                  {isPessoaJuridica && (
                    <div className="space-y-2">
                      <Label htmlFor="company-fantasy-name">Nome fantasia</Label>
                      <Input
                        id="company-fantasy-name"
                        placeholder="Nome fantasia (opcional)"
                        {...form.register('nomeFantasia')}
                        disabled={isSubmitting}
                      />
                      {nomeFantasiaError && (
                        <p className="text-sm text-destructive" role="alert">
                          {nomeFantasiaError}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="company-logo">Logo (URL)</Label>
                    <Input
                      id="company-logo"
                      placeholder="https://exemplo.com/logo.png"
                      {...form.register('logo')}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(form.formState.errors.logo)}
                    />
                    {logoError && (
                      <p className="text-sm text-destructive" role="alert">
                        {logoError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-lg bg-gradient-to-b from-primary/90 to-primary p-6 text-primary-foreground">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6" />
                    <span className="text-sm font-medium uppercase tracking-wide">Empresas</span>
                  </div>
                  <p className="text-sm text-primary-foreground/90">{contactDescription}</p>
                  <p className="text-xs text-primary-foreground/80">
                    Utilize o botão "Consultar" para validar o documento informado e preencher os dados quando possível.
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <span className={sectionTitleClasses}>Contato principal (responsável)</span>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="company-contact-name">Nome</Label>
                    <Input
                      id="company-contact-name"
                      placeholder="Nome do responsável"
                      {...form.register('contatoNome')}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(form.formState.errors.contatoNome)}
                    />
                    {contatoNomeError && (
                      <p className="text-sm text-destructive" role="alert">
                        {contatoNomeError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-contact-phone">Telefone</Label>
                    <Input
                      id="company-contact-phone"
                      placeholder="(00) 00000-0000"
                      {...form.register('contatoTelefone')}
                      onBlur={handleFormatPhoneOnBlur}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(form.formState.errors.contatoTelefone)}
                    />
                    {contatoTelefoneError && (
                      <p className="text-sm text-destructive" role="alert">
                        {contatoTelefoneError}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-contact-email">E-mail</Label>
                    <Input
                      id="company-contact-email"
                      placeholder="contato@empresa.com"
                      type="email"
                      {...form.register('contatoEmail')}
                      disabled={isSubmitting}
                      aria-invalid={Boolean(form.formState.errors.contatoEmail)}
                    />
                    {contatoEmailError && (
                      <p className="text-sm text-destructive" role="alert">
                        {contatoEmailError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company-cep">CEP</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="company-cep"
                    placeholder="00000-000"
                    {...form.register('cep')}
                    onBlur={handleFormatCepOnBlur}
                    disabled={isSubmitting || isConsultingCep}
                    aria-invalid={Boolean(form.formState.errors.cep)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleConsultCep}
                    disabled={isSubmitting || isConsultingCep}
                  >
                    {isConsultingCep ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Consultando...
                      </>
                    ) : (
                      'Consultar CEP'
                    )}
                  </Button>
                </div>
                {cepError && (
                  <p className="text-sm text-destructive" role="alert">
                    {cepError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr]">
                <div className="space-y-2">
                  <Label htmlFor="company-address">Endereço</Label>
                  <Input
                    id="company-address"
                    placeholder="Rua, avenida, etc"
                    {...form.register('endereco')}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(form.formState.errors.endereco)}
                  />
                  {enderecoError && (
                    <p className="text-sm text-destructive" role="alert">
                      {enderecoError}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-number">Número</Label>
                  <Input
                    id="company-number"
                    placeholder="123"
                    {...form.register('numero')}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(form.formState.errors.numero)}
                  />
                  {numeroError && (
                    <p className="text-sm text-destructive" role="alert">
                      {numeroError}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-complement">Complemento</Label>
                <Textarea
                  id="company-complement"
                  placeholder="Apartamento, bloco, sala..."
                  rows={3}
                  {...form.register('complemento')}
                  disabled={isSubmitting}
                />
                {complementoError && (
                  <p className="text-sm text-destructive" role="alert">
                    {complementoError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company-neighborhood">Bairro</Label>
                  <Input
                    id="company-neighborhood"
                    placeholder="Bairro"
                    {...form.register('bairro')}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(form.formState.errors.bairro)}
                  />
                  {bairroError && (
                    <p className="text-sm text-destructive" role="alert">
                      {bairroError}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-city">Cidade</Label>
                  <Input
                    id="company-city"
                    placeholder="Cidade"
                    {...form.register('cidade')}
                    disabled={isSubmitting}
                    aria-invalid={Boolean(form.formState.errors.cidade)}
                  />
                  {cidadeError && (
                    <p className="text-sm text-destructive" role="alert">
                      {cidadeError}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-state">Estado</Label>
                <Select
                  value={form.watch('estado')}
                  onValueChange={(value) => form.setValue('estado', value as CompanyFormSchema['estado'], {
                    shouldValidate: true,
                  })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="company-state">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {estadoError && (
                  <p className="text-sm text-destructive" role="alert">
                    {estadoError}
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Fechar
              </Button>
              {activeTab === 'endereco' && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab('principal')}
                  disabled={isSubmitting}
                >
                  Voltar
                </Button>
              )}
            </div>

            {activeTab === 'principal' ? (
              <Button type="button" onClick={handleContinueToAddress} disabled={isSubmitting}>
                Continuar
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : submitLabel}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



