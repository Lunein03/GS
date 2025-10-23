'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
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
import { CpfCnpjInput } from '../inputs/cpf-cnpj-input';
import { CepInput } from '../inputs/cep-input';
import type { Empresa, EmpresaFormData, CNPJData, AddressData } from '../../types/empresa';
import { empresaFormSchema } from '../../types/empresa';
import { z } from 'zod';

// ============================================
// TYPES
// ============================================

export interface EmpresaFormProps {
    initialData?: Empresa;
    onSubmit: (data: EmpresaFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

// Inferir tipo do schema Zod
type FormData = z.infer<typeof empresaFormSchema>;

// ============================================
// COMPONENT
// ============================================

export function EmpresaForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
}: EmpresaFormProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Inicializar formulário com React Hook Form + Zod
    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, isDirty },
    } = useForm<FormData>({
        resolver: zodResolver(empresaFormSchema) as any,
        defaultValues: initialData
            ? {
                tipo: initialData.tipo,
                cpfCnpj: initialData.cpfCnpj,
                nome: initialData.nome,
                razaoSocial: initialData.razaoSocial,
                nomeFantasia: initialData.nomeFantasia,
                logo: initialData.logo,
                contatoNome: initialData.contatoNome,
                contatoEmail: initialData.contatoEmail,
                contatoTelefone: initialData.contatoTelefone,
                cep: initialData.cep,
                endereco: initialData.endereco,
                numero: initialData.numero,
                complemento: initialData.complemento,
                bairro: initialData.bairro,
                cidade: initialData.cidade,
                estado: initialData.estado,
                ativo: initialData.ativo,
            }
            : {
                tipo: 'juridica',
                cpfCnpj: '',
                nome: null,
                razaoSocial: null,
                nomeFantasia: null,
                logo: null,
                contatoNome: '',
                contatoEmail: '',
                contatoTelefone: '',
                cep: '',
                endereco: '',
                numero: '',
                complemento: null,
                bairro: '',
                cidade: '',
                estado: '',
                ativo: 1,
            },
    });

    // Watch valores do formulário
    const tipo = watch('tipo');
    const cpfCnpj = watch('cpfCnpj');
    const cep = watch('cep');
    const ativo = watch('ativo');

    // Handler para mudança de tipo (CPF/CNPJ)
    const handleTipoChange = (novoTipo: 'fisica' | 'juridica') => {
        setValue('tipo', novoTipo, { shouldDirty: true });
        setValue('cpfCnpj', ''); // Limpar documento ao trocar tipo
    };

    // Handler para validação completa do CPF/CNPJ
    const handleDocumentValidation = (isValid: boolean, data?: CNPJData) => {
        if (isValid && data && tipo === 'juridica') {
            // Preencher automaticamente com dados da Brasil API
            setValue('razaoSocial', data.razao_social || null, { shouldDirty: true });
            setValue('nomeFantasia', data.nome_fantasia || null, { shouldDirty: true });

            // Preencher endereço
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

            // Preencher contato
            if (data.ddd_telefone_1) {
                const telefone = data.ddd_telefone_1.replace(/\D/g, '');
                const telefoneFormatado = telefone.length === 10
                    ? `+55 (${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`
                    : telefone.length === 11
                        ? `+55 (${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`
                        : `+55 ${telefone}`;
                setValue('contatoTelefone', telefoneFormatado, { shouldDirty: true });
            }
        }
    };

    // Handler para endereço encontrado via CEP
    const handleAddressFound = (address: AddressData) => {
        setValue('endereco', address.logradouro || '', { shouldDirty: true });
        setValue('bairro', address.bairro || '', { shouldDirty: true });
        setValue('cidade', address.localidade || '', { shouldDirty: true });
        setValue('estado', address.uf || '', { shouldDirty: true });

        if (address.complemento) {
            setValue('complemento', address.complemento, { shouldDirty: true });
        }
    };

    // Handler para upload de logo
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        // Validar tamanho (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Arquivo deve ter no máximo 2MB');
            return;
        }

        // Validar tipo
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            alert('Apenas arquivos PNG, JPG e JPEG são permitidos');
            return;
        }

        // Criar preview
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setLogoPreview(result);
            setValue('logo', result, { shouldDirty: true });
        };
        reader.readAsDataURL(file);
    };

    // Handler para remover logo
    const handleRemoveLogo = () => {
        setLogoPreview(null);
        setValue('logo', null, { shouldDirty: true });
    };

    // Handler para máscara de telefone
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

    // Handler para cancelar
    const handleCancelClick = () => {
        if (isDirty) {
            setShowCancelDialog(true);
        } else {
            onCancel();
        }
    };

    // Handler para confirmar cancelamento
    const handleConfirmCancel = () => {
        setShowCancelDialog(false);
        onCancel();
    };

    // Handler para submissão do formulário
    const handleFormSubmit = async (data: FormData) => {
        setIsSubmitting(true);

        try {
            // Limpar documento (remover máscara)
            const cleanData: EmpresaFormData = {
                ...data,
                cpfCnpj: removeNonNumeric(data.cpfCnpj),
                cep: removeNonNumeric(data.cep),
                contatoTelefone: removeNonNumeric(data.contatoTelefone),
            };

            await onSubmit(cleanData);
        } catch (error) {
            console.error('Erro ao salvar empresa:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form 
                onSubmit={handleSubmit(handleFormSubmit)} 
                className="space-y-6 md:space-y-8"
                aria-label="Formulário de cadastro de empresa"
            >
                {/* Seção Principal */}
                <section className="space-y-4" aria-labelledby="section-principal">
                    <div>
                        <h3 id="section-principal" className="text-lg font-semibold">Principal</h3>
                        <p className="text-sm text-muted-foreground">
                            Informações básicas da empresa
                        </p>
                    </div>

                    <Separator />

                    {/* Toggle CPF/CNPJ */}
                    <div className="space-y-2">
                        <Label id="tipo-pessoa-label">Tipo de Pessoa</Label>
                        <div 
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
                            role="group"
                            aria-labelledby="tipo-pessoa-label"
                        >
                            <Button
                                type="button"
                                variant={tipo === 'fisica' ? 'default' : 'outline'}
                                onClick={() => handleTipoChange('fisica')}
                                disabled={isLoading || isSubmitting || !!initialData}
                                className="w-full sm:w-auto"
                                aria-pressed={tipo === 'fisica'}
                                aria-label="Selecionar Pessoa Física (CPF)"
                            >
                                Pessoa Física (CPF)
                            </Button>
                            <Button
                                type="button"
                                variant={tipo === 'juridica' ? 'default' : 'outline'}
                                onClick={() => handleTipoChange('juridica')}
                                disabled={isLoading || isSubmitting || !!initialData}
                                className="w-full sm:w-auto"
                                aria-pressed={tipo === 'juridica'}
                                aria-label="Selecionar Pessoa Jurídica (CNPJ)"
                            >
                                Pessoa Jurídica (CNPJ)
                            </Button>
                        </div>
                    </div>

                    {/* Input CPF/CNPJ */}
                    <CpfCnpjInput
                        tipo={tipo}
                        value={cpfCnpj}
                        onChange={(value) => setValue('cpfCnpj', value, { shouldDirty: true })}
                        onValidationComplete={handleDocumentValidation}
                        error={errors.cpfCnpj?.message}
                        disabled={isLoading || isSubmitting}
                    />

                    {/* Nome Completo (PF) ou Razão Social + Nome Fantasia (PJ) */}
                    {tipo === 'fisica' ? (
                        <div className="space-y-2">
                            <Label htmlFor="nome">
                                Nome Completo <span className="text-red-500" aria-label="obrigatório">*</span>
                            </Label>
                            <Input
                                id="nome"
                                {...register('nome')}
                                placeholder="Digite o nome completo"
                                disabled={isLoading || isSubmitting}
                                className={cn(errors.nome && 'border-red-500')}
                                aria-invalid={!!errors.nome}
                                aria-describedby={errors.nome ? 'nome-error' : undefined}
                                aria-required="true"
                            />
                            {errors.nome && (
                                <p id="nome-error" className="text-sm text-red-600 dark:text-red-500" role="alert">
                                    {errors.nome.message}
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="razaoSocial">
                                    Razão Social <span className="text-red-500" aria-label="obrigatório">*</span>
                                </Label>
                                <Input
                                    id="razaoSocial"
                                    {...register('razaoSocial')}
                                    placeholder="Digite a razão social"
                                    disabled={isLoading || isSubmitting}
                                    className={cn(errors.razaoSocial && 'border-red-500')}
                                    aria-invalid={!!errors.razaoSocial}
                                    aria-describedby={errors.razaoSocial ? 'razaoSocial-error' : undefined}
                                    aria-required="true"
                                />
                                {errors.razaoSocial && (
                                    <p id="razaoSocial-error" className="text-sm text-red-600 dark:text-red-500" role="alert">
                                        {errors.razaoSocial.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                                <Input
                                    id="nomeFantasia"
                                    {...register('nomeFantasia')}
                                    placeholder="Digite o nome fantasia"
                                    disabled={isLoading || isSubmitting}
                                    aria-describedby="nomeFantasia-hint"
                                />
                                <p id="nomeFantasia-hint" className="text-xs text-muted-foreground sr-only">
                                    Campo opcional
                                </p>
                            </div>
                        </>
                    )}
                </section>

                {/* Seção Contato Principal */}
                <section className="space-y-4" aria-labelledby="section-contato">
                    <div>
                        <h3 id="section-contato" className="text-lg font-semibold">Contato Principal (Responsável)</h3>
                        <p className="text-sm text-muted-foreground">
                            Dados do responsável pela empresa
                        </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="contatoNome">
                                Nome do Contato <span className="text-red-500" aria-label="obrigatório">*</span>
                            </Label>
                            <Input
                                id="contatoNome"
                                {...register('contatoNome')}
                                placeholder="Digite o nome do contato"
                                disabled={isLoading || isSubmitting}
                                className={cn(errors.contatoNome && 'border-red-500')}
                                aria-invalid={!!errors.contatoNome}
                                aria-describedby={errors.contatoNome ? 'contatoNome-error' : undefined}
                                aria-required="true"
                            />
                            {errors.contatoNome && (
                                <p id="contatoNome-error" className="text-sm text-red-600 dark:text-red-500" role="alert">
                                    {errors.contatoNome.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contatoEmail">
                                E-mail <span className="text-red-500" aria-label="obrigatório">*</span>
                            </Label>
                            <Input
                                id="contatoEmail"
                                type="email"
                                {...register('contatoEmail')}
                                placeholder="exemplo@email.com"
                                disabled={isLoading || isSubmitting}
                                className={cn(errors.contatoEmail && 'border-red-500')}
                                aria-invalid={!!errors.contatoEmail}
                                aria-describedby={errors.contatoEmail ? 'contatoEmail-error' : undefined}
                                aria-required="true"
                                autoComplete="email"
                            />
                            {errors.contatoEmail && (
                                <p id="contatoEmail-error" className="text-sm text-red-600 dark:text-red-500" role="alert">
                                    {errors.contatoEmail.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contatoTelefone">
                                Telefone <span className="text-red-500" aria-label="obrigatório">*</span>
                            </Label>
                            <Input
                                id="contatoTelefone"
                                {...register('contatoTelefone')}
                                onChange={handleTelefoneChange}
                                placeholder="+55 (00) 00000-0000"
                                maxLength={19}
                                disabled={isLoading || isSubmitting}
                                className={cn(errors.contatoTelefone && 'border-red-500')}
                                aria-invalid={!!errors.contatoTelefone}
                                aria-describedby={errors.contatoTelefone ? 'contatoTelefone-error' : undefined}
                                aria-required="true"
                                autoComplete="tel"
                                inputMode="tel"
                            />
                            {errors.contatoTelefone && (
                                <p id="contatoTelefone-error" className="text-sm text-red-600 dark:text-red-500" role="alert">
                                    {errors.contatoTelefone.message}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Seção Endereço */}
                <section className="space-y-4" aria-labelledby="section-endereco">
                    <div>
                        <h3 id="section-endereco" className="text-lg font-semibold">Endereço</h3>
                        <p className="text-sm text-muted-foreground">
                            Localização da empresa
                        </p>
                    </div>

                    <Separator />

                    <CepInput
                        value={cep}
                        onChange={(value) => setValue('cep', value, { shouldDirty: true })}
                        onAddressFound={handleAddressFound}
                        error={errors.cep?.message}
                        disabled={isLoading || isSubmitting}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="sm:col-span-3 space-y-2">
                            <Label htmlFor="endereco">
                                Logradouro <span className="text-red-500" aria-label="obrigatório">*</span>
                            </Label>
                            <Input
                                id="endereco"
                                {...register('endereco')}
                                placeholder="Rua, Avenida, etc."
                                disabled={isLoading || isSubmitting}
                                className={cn(errors.endereco && 'border-red-500')}
                                aria-invalid={!!errors.endereco}
                                aria-describedby={errors.endereco ? 'endereco-error' : undefined}
                                aria-required="true"
                                autoComplete="street-address"
                            />
                            {errors.endereco && (
                                <p id="endereco-error" className="text-sm text-red-600 dark:text-red-500" role="alert">
                                    {errors.endereco.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="numero">
                                Número <span className="text-red-500" aria-label="obrigatório">*</span>
                            </Label>
                            <Input
                                id="numero"
                                {...register('numero')}
                                placeholder="123"
                                disabled={isLoading || isSubmitting}
                                className={cn(errors.numero && 'border-red-500')}
                                aria-invalid={!!errors.numero}
                                aria-describedby={errors.numero ? 'numero-error' : undefined}
                                aria-required="true"
                            />
                            {errors.numero && (
                                <p id="numero-error" className="text-sm text-red-600 dark:text-red-500" role="alert">
                                    {errors.numero.message}
                                </p>
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
                            aria-describedby="complemento-hint"
                        />
                        <p id="complemento-hint" className="text-xs text-muted-foreground sr-only">
                            Campo opcional
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="bairro">
                                Bairro <span className="text-red-500" aria-label="obrigatório">*</span>
                            </Label>
                            <Input
                                id="bairro"
                                {...register('bairro')}
                                placeholder="Centro"
                                disabled={isLoading || isSubmitting}
                                className={cn(errors.bairro && 'border-red-500')}
                                aria-invalid={!!errors.bairro}
                                aria-describedby={errors.bairro ? 'bairro-error' : undefined}
                                aria-required="true"
                            />
                            {errors.bairro && (
                                <p id="bairro-error" className="text-sm text-red-600 dark:text-red-500" role="alert">
                                    {errors.bairro.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cidade">
                                Cidade <span className="text-red-500" aria-label="obrigatório">*</span>
                            </Label>
                            <Input
                                id="cidade"
                                {...register('cidade')}
                                placeholder="São Paulo"
                                disabled={isLoading || isSubmitting}
                                className={cn(errors.cidade && 'border-red-500')}
                                aria-invalid={!!errors.cidade}
                                aria-describedby={errors.cidade ? 'cidade-error' : undefined}
                                aria-required="true"
                                autoComplete="address-level2"
                            />
                            {errors.cidade && (
                                <p id="cidade-error" className="text-sm text-red-600 dark:text-red-500" role="alert">
                                    {errors.cidade.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="estado">
                                Estado <span className="text-red-500" aria-label="obrigatório">*</span>
                            </Label>
                            <Input
                                id="estado"
                                {...register('estado')}
                                placeholder="SP"
                                maxLength={2}
                                disabled={isLoading || isSubmitting}
                                className={cn(errors.estado && 'border-red-500 uppercase')}
                                aria-invalid={!!errors.estado}
                                aria-describedby={errors.estado ? 'estado-error' : 'estado-hint'}
                                aria-required="true"
                                autoComplete="address-level1"
                            />
                            {errors.estado ? (
                                <p id="estado-error" className="text-sm text-red-600 dark:text-red-500" role="alert">
                                    {errors.estado.message}
                                </p>
                            ) : (
                                <p id="estado-hint" className="text-xs text-muted-foreground sr-only">
                                    Sigla do estado com 2 letras
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Seção Dados Adicionais */}
                <section className="space-y-4" aria-labelledby="section-dados-adicionais">
                    <div>
                        <h3 id="section-dados-adicionais" className="text-lg font-semibold">Dados Adicionais</h3>
                        <p className="text-sm text-muted-foreground">
                            Logo e status da empresa
                        </p>
                    </div>

                    <Separator />

                    {/* Upload de Logo */}
                    <div className="space-y-2">
                        <Label htmlFor="logo">Logo da Empresa</Label>
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            {logoPreview ? (
                                <div className="relative">
                                    <img
                                        src={logoPreview}
                                        alt="Preview da logo da empresa"
                                        className="w-32 h-32 object-contain border rounded-lg"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6"
                                        onClick={handleRemoveLogo}
                                        disabled={isLoading || isSubmitting}
                                        aria-label="Remover logo"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label
                                    htmlFor="logo"
                                    className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            document.getElementById('logo')?.click();
                                        }
                                    }}
                                >
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
                                    <span className="text-xs text-muted-foreground text-center px-2">
                                        Clique para fazer upload
                                    </span>
                                    <input
                                        id="logo"
                                        type="file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        className="sr-only"
                                        onChange={handleLogoUpload}
                                        disabled={isLoading || isSubmitting}
                                        aria-describedby="logo-hint"
                                    />
                                </label>
                            )}
                            <div id="logo-hint" className="flex-1 text-sm text-muted-foreground">
                                <p>Formatos aceitos: PNG, JPG, JPEG</p>
                                <p>Tamanho máximo: 2MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Toggle Ativo/Inativo */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label htmlFor="ativo" className="text-base">Status da Empresa</Label>
                            <p 
                                id="ativo-description" 
                                className="text-sm text-muted-foreground"
                                aria-live="polite"
                            >
                                {ativo === 1 ? 'Empresa ativa no sistema' : 'Empresa inativa no sistema'}
                            </p>
                        </div>
                        <Switch
                            id="ativo"
                            checked={ativo === 1}
                            onCheckedChange={(checked) =>
                                setValue('ativo', checked ? 1 : 0, { shouldDirty: true })
                            }
                            disabled={isLoading || isSubmitting}
                            aria-describedby="ativo-description"
                            aria-label={`Status da empresa: ${ativo === 1 ? 'ativa' : 'inativa'}`}
                        />
                    </div>
                </section>

                {/* Botões de Ação */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelClick}
                        disabled={isLoading || isSubmitting}
                        className="w-full sm:w-auto"
                        aria-label="Cancelar e voltar"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isLoading || isSubmitting}
                        className="w-full sm:w-auto"
                        aria-label={isSubmitting ? 'Salvando empresa' : 'Salvar empresa'}
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                        {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </form>

            {/* Dialog de Confirmação de Cancelamento */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent aria-describedby="cancel-dialog-description">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
                        <AlertDialogDescription id="cancel-dialog-description">
                            Você tem alterações não salvas. Tem certeza que deseja cancelar? Todas as
                            alterações serão perdidas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <AlertDialogCancel className="w-full sm:w-auto">
                            Continuar editando
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleConfirmCancel}
                            className="w-full sm:w-auto"
                        >
                            Descartar alterações
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
