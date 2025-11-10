'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Clock,
  Send,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/shared/lib/utils';
import { DatePicker } from '@/shared/ui/date-picker';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { TimePicker } from '@/shared/ui/time-picker';
import { createOvertimeRequest } from '@/shared/api/overtime';

export default function FormularioHorasExtras() {
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    dataHoraExtra: '',
    horarioInicio: '',
    horarioTermino: '',
    justificativa: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, dataHoraExtra: value }));
    if (errors.dataHoraExtra) {
      setErrors((prev) => ({ ...prev, dataHoraExtra: '' }));
    }
  };

  const handleTimeChange = (
    field: 'horarioInicio' | 'horarioTermino'
  ) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomeCompleto.trim()) {
      newErrors.nomeCompleto = 'Nome completo é obrigatório';
    }
    if (!formData.dataHoraExtra) {
      newErrors.dataHoraExtra = 'Data da hora extra é obrigatória';
    }
    if (!formData.horarioInicio) {
      newErrors.horarioInicio = 'Horário de início é obrigatório';
    }
    if (!formData.horarioTermino) {
      newErrors.horarioTermino = 'Horário de término é obrigatório';
    }
    if (!formData.justificativa.trim()) {
      newErrors.justificativa = 'Justificativa é obrigatória';
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
      const result = await createOvertimeRequest({
        employeeName: formData.nomeCompleto,
        overtimeDate: formData.dataHoraExtra,
        startTime: formData.horarioInicio,
        endTime: formData.horarioTermino,
        justification: formData.justificativa,
      });

      if (result.success) {
        setSubmitSuccess(true);
        toast.success('Registro enviado com sucesso!', {
          description: 'Seu registro foi salvo no banco de horas.',
        });
        setFormData({
          nomeCompleto: '',
          dataHoraExtra: '',
          horarioInicio: '',
          horarioTermino: '',
          justificativa: '',
        });
      } else {
        toast.error('Erro ao enviar registro', {
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
              <h1 className="text-4xl font-semibold text-[#1D1D1F] dark:text-[#F0EEEF] md:text-5xl lg:text-6xl leading-[1.1] tracking-[-0.02em] font-inter">
                Registro de Horas Extras
              </h1>
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] rounded-[16px] border-0 shadow-light p-10 md:p-12 text-center font-inter">
              <div className="space-y-8 max-w-3xl mx-auto">
                <p className="text-base leading-[1.6] text-[#86868B] dark:text-[#98989D] md:text-lg font-inter">
                  Formulário para registro e controle das horas extras realizadas. Preencha todos os campos obrigatórios para garantir o registro correto no banco de horas da GS Produções.
                </p>
                <div className="bg-[#F2F2F7] dark:bg-[#2C2C2E] rounded-[8px] p-4 border-0">
                  <p className="text-sm text-[#86868B] dark:text-[#98989D] flex items-center justify-center gap-2 font-inter">
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
                <Clock className="h-8 w-8 text-secondary" />
                <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F0EEEF] md:text-3xl leading-tight tracking-[-0.01em] font-inter">Preencha o formulário</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="mb-8 rounded-[12px] border border-yellow-500/20 bg-yellow-500/8 p-6 shadow-light font-inter">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-[#1D1D1F] dark:text-[#F0EEEF] font-inter">
                      Orientações importantes
                    </h3>
                  </div>
                  <ul className="list-disc space-y-3 text-sm leading-[1.6] text-[#1D1D1F] dark:text-[#F0EEEF] md:text-base pl-6 font-inter">
                    <li>
                      O preenchimento deve ser feito em até <strong>1 dia útil</strong> após a hora extra.
                    </li>
                    <li>
                      As horas devem ter sido <strong>autorizadas previamente pelo Gabriel</strong>.
                    </li>
                    <li>
                      Horas não registradas corretamente <strong>não serão computadas</strong> no banco de horas.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 md:p-10 shadow-sm">
                  {submitSuccess && (
                    <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400 text-sm">
                      ✓ Formulário enviado com sucesso! Seu registro foi salvo no banco de horas.
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="nomeCompleto"
                        className="text-sm font-medium text-foreground flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-secondary" />
                        Nome completo: <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        id="nomeCompleto"
                        name="nomeCompleto"
                        value={formData.nomeCompleto}
                        onChange={handleInputChange}
                        aria-invalid={Boolean(errors.nomeCompleto)}
                        aria-describedby={errors.nomeCompleto ? 'nomeCompleto-error' : undefined}
                        placeholder="Digite seu nome completo"
                        className={cn(
                          'h-12 rounded-lg border border-border bg-background px-4 text-base text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary',
                          errors.nomeCompleto &&
                            'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                        )}
                      />
                      {errors.nomeCompleto && (
                        <p id="nomeCompleto-error" className="text-xs text-red-500">
                          {errors.nomeCompleto}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="dataHoraExtra"
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <CalendarClock className="h-4 w-4 text-secondary" />
                          Data da hora extra: <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                          id="dataHoraExtra"
                          name="dataHoraExtra"
                          value={formData.dataHoraExtra}
                          onChange={handleDateChange}
                          placeholder="dd/mm/aaaa"
                          ariaInvalid={Boolean(errors.dataHoraExtra)}
                          ariaDescribedBy={errors.dataHoraExtra ? 'dataHoraExtra-error' : undefined}
                          className={cn(
                            'h-12 rounded-lg border border-border bg-background text-base font-medium text-foreground',
                            errors.dataHoraExtra &&
                              'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                          )}
                        />
                        {errors.dataHoraExtra && (
                          <p id="dataHoraExtra-error" className="text-xs text-red-500">
                            {errors.dataHoraExtra}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="horarioInicio"
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4 text-secondary" />
                          Horário de início: <span className="text-red-500">*</span>
                        </label>
                        <TimePicker
                          id="horarioInicio"
                          name="horarioInicio"
                          value={formData.horarioInicio}
                          onChange={handleTimeChange('horarioInicio')}
                          placeholder="Selecionar horário"
                          ariaInvalid={Boolean(errors.horarioInicio)}
                          ariaDescribedBy={errors.horarioInicio ? 'horarioInicio-error' : undefined}
                          step={5}
                          className={cn(
                            'h-12 rounded-lg border border-border bg-background text-base font-medium text-foreground',
                            errors.horarioInicio &&
                              'border-red-500 focus:ring-red-500 focus:ring-offset-2'
                          )}
                        />
                        {errors.horarioInicio && (
                          <p id="horarioInicio-error" className="text-xs text-red-500">
                            {errors.horarioInicio}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor="horarioTermino"
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4 text-secondary" />
                          Horário de término: <span className="text-red-500">*</span>
                        </label>
                        <TimePicker
                          id="horarioTermino"
                          name="horarioTermino"
                          value={formData.horarioTermino}
                          onChange={handleTimeChange('horarioTermino')}
                          placeholder="Selecionar horário"
                          ariaInvalid={Boolean(errors.horarioTermino)}
                          ariaDescribedBy={errors.horarioTermino ? 'horarioTermino-error' : undefined}
                          step={5}
                          className={cn(
                            'h-12 rounded-lg border border-border bg-background text-base font-medium text-foreground',
                            errors.horarioTermino &&
                              'border-red-500 focus:ring-red-500 focus:ring-offset-2'
                          )}
                        />
                        {errors.horarioTermino && (
                          <p id="horarioTermino-error" className="text-xs text-red-500">
                            {errors.horarioTermino}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="justificativa"
                        className="text-sm font-medium text-foreground"
                      >
                        Justificativa para realização da hora extra:{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="justificativa"
                        name="justificativa"
                        value={formData.justificativa}
                        onChange={handleInputChange}
                        rows={5}
                        aria-invalid={Boolean(errors.justificativa)}
                        aria-describedby={errors.justificativa ? 'justificativa-error' : undefined}
                        placeholder="Descreva o motivo da hora extra e as atividades realizadas"
                        className={cn(
                          'rounded-lg border border-border bg-background text-base text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-secondary',
                          errors.justificativa &&
                            'border-red-500 focus-visible:ring-red-500 focus-visible:ring-offset-2'
                        )}
                      />
                      {errors.justificativa && (
                        <p id="justificativa-error" className="text-xs text-red-500">
                          {errors.justificativa}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 flex justify-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                        {isSubmitting ? 'Enviando...' : 'Enviar registro'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </section>
          </div>

          <footer className="flex flex-col items-center gap-8 rounded-3xl border border-border bg-card/80 p-10 md:p-12 text-center shadow-sm">
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base lg:leading-loose">
              Após o envio, seu registro será processado e incluído no banco de horas. Em caso de dúvidas, entre em contato com <strong>comunicacao@gsproducao.com</strong>.
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


