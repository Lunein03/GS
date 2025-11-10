'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CreditCard,
  DollarSign,
  Send,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/shared/lib/utils';
import { DatePicker } from '@/shared/ui/date-picker';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { createExpenseReport } from '@/shared/api/expenses';

export default function FormularioPrestacaoContas() {
  const [formData, setFormData] = useState({
    nomeColaborador: '',
    dataUso: '',
    categoriaUso: '',
    categoriaOutro: '',
    nomeEvento: '',
    transporte: '',
    transporteOutro: '',
    valorGasto: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Limpar campos relacionados quando a categoria for alterada
    if (name === 'categoriaUso') {
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        categoriaOutro: '',
        transporte: '',
        transporteOutro: ''
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Função para formatar valor monetário brasileiro
  const formatCurrency = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Se não há números, retorna string vazia
    if (!numbers) return '';
    
    // Converte para número e divide por 100 (para centavos)
    const numberValue = parseInt(numbers, 10) / 100;
    
    // Formata como moeda brasileira
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  // Handler específico para o campo de valor
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedValue = formatCurrency(value);
    
    setFormData((prev) => ({ ...prev, valorGasto: formattedValue }));
    
    if (errors.valorGasto) {
      setErrors((prev) => ({ ...prev, valorGasto: '' }));
    }
  };

  const handleDateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, dataUso: value }));
    if (errors.dataUso) {
      setErrors((prev) => ({ ...prev, dataUso: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeColaborador.trim()) {
      newErrors.nomeColaborador = 'Nome do colaborador é obrigatório';
    }
    if (!formData.dataUso) {
      newErrors.dataUso = 'Data de uso é obrigatória';
    }
    if (!formData.categoriaUso) {
      newErrors.categoriaUso = 'Categoria de uso é obrigatória';
    }
    if (formData.categoriaUso === 'Outro' && !formData.categoriaOutro.trim()) {
      newErrors.categoriaOutro = 'Descrição da despesa é obrigatória';
    }
    if (!formData.nomeEvento.trim()) {
      newErrors.nomeEvento = 'Nome do evento é obrigatório';
    }
    // Validação condicional do campo transporte: apenas obrigatório se categoria for 'Uber'
    if (formData.categoriaUso === 'Uber' && !formData.transporte) {
      newErrors.transporte = 'Informação de transporte é obrigatória';
    }
    if (formData.transporte === 'Outro' && !formData.transporteOutro.trim()) {
      newErrors.transporteOutro = 'Especifique o tipo de transporte';
    }
    if (!formData.valorGasto.trim()) {
      newErrors.valorGasto = 'Valor gasto é obrigatório';
    } else {
      // Extrai apenas os números para validação
      const numericValue = formData.valorGasto.replace(/\D/g, '');
      const value = parseInt(numericValue, 10) / 100;
      
      if (value <= 0) {
        newErrors.valorGasto = 'Digite um valor maior que zero';
      } else if (value > 999999.99) {
        newErrors.valorGasto = 'Valor não pode ser maior que R$ 999.999,99';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepara os dados para envio, convertendo o valor formatado para número
      const valorGasto = formData.valorGasto
        ? (parseInt(formData.valorGasto.replace(/\D/g, ''), 10) / 100).toFixed(2)
        : '0.00';

      const result = await createExpenseReport({
        employeeName: formData.nomeColaborador,
        expenseDate: formData.dataUso,
        category: formData.categoriaUso,
        categoryOther: formData.categoriaOutro || undefined,
        eventName: formData.nomeEvento,
        transportType: formData.transporte || undefined,
        transportOther: formData.transporteOutro || undefined,
        amount: valorGasto,
      });

      if (result.success) {
        setSubmitSuccess(true);
        toast.success('Prestação de contas enviada com sucesso!', {
          description: 'Seu registro foi salvo e será processado.',
        });
        setFormData({
          nomeColaborador: '',
          dataUso: '',
          categoriaUso: '',
          categoriaOutro: '',
          nomeEvento: '',
          transporte: '',
          transporteOutro: '',
          valorGasto: '',
        });
      } else {
        toast.error('Erro ao enviar prestação de contas', {
          description: result.error.message,
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Erro inesperado', {
        description: 'Ocorreu um erro ao enviar o formulário. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-poppins [&_h1]:font-poppins [&_h1]:font-medium [&_h2]:font-poppins [&_h2]:font-medium [&_h3]:font-poppins [&_h3]:font-medium">
      <div className="py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="space-y-8">
            <div className="flex justify-start">
              <Link
                href="/formularios"
                className="btn-primary inline-flex items-center gap-3 px-4 py-3 text-sm font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar aos formulários
              </Link>
            </div>

            <div className="flex flex-col items-center gap-8 text-center">
              <Image
                src="/images/gs-logo-2.svg"
                alt="Logotipo GS Produções"
                width={120}
                height={120}
                className="h-20 w-20"
                priority
              />
              <h1 className="text-3xl font-medium text-foreground md:text-4xl lg:text-5xl leading-tight">
                Prestação de Contas – Cartão Corporativo
              </h1>
            </div>

            <div className="bg-card/50 rounded-2xl border border-border/50 p-10 md:p-12 shadow-sm text-center">
              <div className="space-y-8 max-w-3xl mx-auto">
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg lg:leading-loose">
                  Este formulário deve ser preenchido sempre que o cartão corporativo for utilizado. O cartão é exclusivo para despesas com Uber e alimentação relacionadas às atividades profissionais.
                </p>
                <div className="bg-background/50 rounded-lg p-4 border border-border/30">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    <strong>Vinculado a:</strong> comunicacao@gsproducao.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-20">
            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <AlertTriangle className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-medium text-foreground md:text-2xl">⚠️ Atenção!</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm space-y-6">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                    <p className="text-sm leading-relaxed text-red-700 dark:text-red-400 font-medium">
                      Caso tenha algum valor que não foi prestado contas, será dividido para todos os colaboradores e descontado na folha de pagamento!
                    </p>
                  </div>
                  <ul className="list-disc space-y-4 text-left text-sm leading-relaxed text-muted-foreground md:text-base pl-6 lg:leading-loose">
                    <li>
                      Utilize o cartão <strong>apenas</strong> para serviços de transporte via Uber ou para refeições durante atividades de trabalho.
                    </li>
                    <li>
                      Após cada uso, preencha este formulário com <strong>todas as informações solicitadas</strong>.
                    </li>
                    <li>
                      Qualquer uso indevido ou falta de prestação de contas poderá resultar na <strong>suspensão do uso do cartão</strong>.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <CreditCard className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-medium text-foreground md:text-2xl">Preencha o formulário</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 md:p-10 shadow-sm">
                  {submitSuccess && (
                    <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-sm">
                      ✓ Formulário enviado com sucesso! Sua prestação de contas foi registrada.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="nomeColaborador"
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-secondary" />
                        Nome do colaborador: <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        id="nomeColaborador"
                        name="nomeColaborador"
                        value={formData.nomeColaborador}
                        onChange={handleInputChange}
                        aria-invalid={Boolean(errors.nomeColaborador)}
                        aria-describedby={errors.nomeColaborador ? 'nomeColaborador-error' : undefined}
                        placeholder="Digite seu nome completo"
                        className={cn(
                          'h-12 rounded-lg border border-border bg-background px-4 text-base text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary',
                          errors.nomeColaborador &&
                            'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                        )}
                      />
                      {errors.nomeColaborador && (
                        <p id="nomeColaborador-error" className="text-xs text-red-500">{errors.nomeColaborador}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="dataUso"
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <CalendarClock className="h-4 w-4 text-secondary" />
                          Data de uso: <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          id="dataUso"
                          name="dataUso"
                          value={formData.dataUso}
                          onChange={handleDateChange}
                          placeholder="dd/mm/aaaa"
                          ariaInvalid={Boolean(errors.dataUso)}
                          ariaDescribedBy={errors.dataUso ? 'dataUso-error' : undefined}
                          className={cn(
                            'h-12 rounded-lg border border-border bg-background text-base font-medium text-foreground',
                            errors.dataUso &&
                              'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                          )}
                        />
                        {errors.dataUso && (
                          <p id="dataUso-error" className="text-xs text-red-500">{errors.dataUso}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="categoriaUso"
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <CreditCard className="h-4 w-4 text-secondary" />
                          Categoria de uso: <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="categoriaUso"
                          name="categoriaUso"
                          value={formData.categoriaUso}
                          onChange={handleInputChange}
                          aria-invalid={Boolean(errors.categoriaUso)}
                          aria-describedby={errors.categoriaUso ? 'categoriaUso-error' : undefined}
                          className={cn(
                            'h-12 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary',
                            errors.categoriaUso &&
                              'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                          )}
                        >
                          <option value="">Selecione uma categoria</option>
                          <option value="Uber">Uber</option>
                          <option value="Alimentação">Alimentação</option>
                          <option value="Outro">Outro</option>
                        </select>
                        {errors.categoriaUso && (
                          <p id="categoriaUso-error" className="text-xs text-red-500">{errors.categoriaUso}</p>
                        )}
                      </div>
                    </div>

                    {formData.categoriaUso === 'Outro' && (
                      <div className="space-y-2">
                        <label
                          htmlFor="categoriaOutro"
                          className="text-sm font-medium text-foreground"
                        >
                          Descrição da Despesa: <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          id="categoriaOutro"
                          name="categoriaOutro"
                          value={formData.categoriaOutro}
                          onChange={handleInputChange}
                          rows={3}
                          aria-invalid={Boolean(errors.categoriaOutro)}
                          aria-describedby={errors.categoriaOutro ? 'categoriaOutro-error' : undefined}
                          placeholder="Descreva detalhadamente o motivo e tipo da despesa realizada"
                          className={cn(
                            'rounded-lg border border-border bg-background text-base text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary resize-none',
                            errors.categoriaOutro &&
                              'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                          )}
                        />
                        {errors.categoriaOutro && (
                          <p id="categoriaOutro-error" className="text-xs text-red-500">{errors.categoriaOutro}</p>
                        )}
                      </div>
                    )}

                    {formData.categoriaUso === 'Uber' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label
                            htmlFor="nomeEvento"
                            className="text-sm font-medium text-foreground"
                          >
                            Nome do evento: <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            id="nomeEvento"
                            name="nomeEvento"
                            value={formData.nomeEvento}
                            onChange={handleInputChange}
                            aria-invalid={Boolean(errors.nomeEvento)}
                            aria-describedby={errors.nomeEvento ? 'nomeEvento-error' : undefined}
                            placeholder="Ex: Reunião com cliente, Gravação externa, etc."
                            className={cn(
                              'h-12 rounded-lg border border-border bg-background px-4 text-base text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary',
                              errors.nomeEvento &&
                                'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                            )}
                          />
                          {errors.nomeEvento && (
                            <p id="nomeEvento-error" className="text-xs text-red-500">{errors.nomeEvento}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="transporte"
                            className="text-sm font-medium text-foreground"
                          >
                            Transporte: <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="transporte"
                            name="transporte"
                            value={formData.transporte}
                            onChange={handleInputChange}
                            aria-invalid={Boolean(errors.transporte)}
                            aria-describedby={errors.transporte ? 'transporte-error' : undefined}
                            className={cn(
                              'h-12 w-full rounded-lg border border-border bg-background px-4 text-base text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary',
                              errors.transporte &&
                                'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                            )}
                          >
                            <option value="">Selecione uma opção</option>
                            <option value="Casa para o trabalho">O transporte foi de casa para o trabalho?</option>
                            <option value="Trabalho para casa">O transporte foi do trabalho para casa?</option>
                            <option value="Outro">Outro</option>
                          </select>
                          {errors.transporte && (
                            <p id="transporte-error" className="text-xs text-red-500">{errors.transporte}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label
                          htmlFor="nomeEvento"
                          className="text-sm font-medium text-foreground"
                        >
                          Nome do evento: <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          id="nomeEvento"
                          name="nomeEvento"
                          value={formData.nomeEvento}
                          onChange={handleInputChange}
                          aria-invalid={Boolean(errors.nomeEvento)}
                          aria-describedby={errors.nomeEvento ? 'nomeEvento-error' : undefined}
                          placeholder="Ex: Reunião com cliente, Gravação externa, etc."
                          className={cn(
                            'h-12 rounded-lg border border-border bg-background px-4 text-base text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary',
                            errors.nomeEvento &&
                              'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                          )}
                        />
                        {errors.nomeEvento && (
                          <p id="nomeEvento-error" className="text-xs text-red-500">{errors.nomeEvento}</p>
                        )}
                      </div>
                    )}

                    {formData.transporte === 'Outro' && (
                      <div className="space-y-2">
                        <label
                          htmlFor="transporteOutro"
                          className="text-sm font-medium text-foreground"
                        >
                          Especifique o transporte: <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          id="transporteOutro"
                          name="transporteOutro"
                          value={formData.transporteOutro}
                          onChange={handleInputChange}
                          aria-invalid={Boolean(errors.transporteOutro)}
                          aria-describedby={errors.transporteOutro ? 'transporteOutro-error' : undefined}
                          placeholder="Descreva o tipo de transporte"
                          className={cn(
                            'h-12 rounded-lg border border-border bg-background px-4 text-base text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary',
                            errors.transporteOutro &&
                              'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                          )}
                        />
                        {errors.transporteOutro && (
                          <p id="transporteOutro-error" className="text-xs text-red-500">{errors.transporteOutro}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label
                        htmlFor="valorGasto"
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4 text-secondary" />
                        Valor gasto: <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        id="valorGasto"
                        name="valorGasto"
                        value={formData.valorGasto}
                        onChange={handleCurrencyChange}
                        aria-invalid={Boolean(errors.valorGasto)}
                        aria-describedby={errors.valorGasto ? 'valorGasto-error' : undefined}
                        placeholder="Digite o valor gasto"
                        inputMode="numeric"
                        className={cn(
                          'h-12 rounded-lg border border-border bg-background px-4 text-base text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary',
                          errors.valorGasto &&
                            'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                        )}
                      />
                      {errors.valorGasto && (
                        <p id="valorGasto-error" className="text-xs text-red-500">{errors.valorGasto}</p>
                      )}
                    </div>

                    <div className="pt-4 flex justify-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                        {isSubmitting ? 'Enviando...' : 'Enviar prestação de contas'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>

          <footer className="flex flex-col items-center gap-8 rounded-3xl border border-border bg-card/80 p-10 md:p-12 text-center shadow-sm">
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base lg:leading-loose">
              Agradecemos pela colaboração! Em caso de dúvidas, entre em contato com <strong>comunicacao@gsproducao.com</strong>.
            </p>
            <Link
              href="/formularios"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar aos formulários
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}


