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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
      newErrors.categoriaOutro = 'Especifique a categoria';
    }
    if (!formData.nomeEvento.trim()) {
      newErrors.nomeEvento = 'Nome do evento é obrigatório';
    }
    if (!formData.transporte) {
      newErrors.transporte = 'Informação de transporte é obrigatória';
    }
    if (formData.transporte === 'Outro' && !formData.transporteOutro.trim()) {
      newErrors.transporteOutro = 'Especifique o tipo de transporte';
    }
    if (!formData.valorGasto.trim()) {
      newErrors.valorGasto = 'Valor gasto é obrigatório';
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
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Form submitted:', formData);
      setSubmitSuccess(true);
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
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter [&_h1]:font-inter [&_h1]:font-semibold [&_h2]:font-inter [&_h2]:font-semibold [&_h3]:font-inter [&_h3]:font-semibold">
      <div className="py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="space-y-8">
            <div className="flex justify-start">
              <Link
                href="/formularios"
                className="btn-primary inline-flex items-center gap-3 px-4 py-3 text-sm font-semibold"
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
              <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl leading-tight">
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
                <h2 className="text-xl font-bold text-foreground md:text-2xl">⚠️ Atenção!</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm space-y-6">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                    <p className="text-sm leading-relaxed text-red-700 dark:text-red-400 font-semibold">
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
                <h2 className="text-xl font-bold text-foreground md:text-2xl">Preencha o formulário</h2>
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
                        className="text-sm font-semibold text-foreground flex items-center gap-2"
                      >
                        <User className="h-4 w-4 text-secondary" />
                        Nome do colaborador: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nomeColaborador"
                        name="nomeColaborador"
                        value={formData.nomeColaborador}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Digite seu nome completo"
                      />
                      {errors.nomeColaborador && (
                        <p className="text-xs text-red-500">{errors.nomeColaborador}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="dataUso"
                        className="text-sm font-semibold text-foreground flex items-center gap-2"
                      >
                        <CalendarClock className="h-4 w-4 text-secondary" />
                        Data de uso: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="dataUso"
                        name="dataUso"
                        value={formData.dataUso}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                      {errors.dataUso && (
                        <p className="text-xs text-red-500">{errors.dataUso}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="categoriaUso"
                        className="text-sm font-semibold text-foreground flex items-center gap-2"
                      >
                        <CreditCard className="h-4 w-4 text-secondary" />
                        Categoria de uso: <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="categoriaUso"
                        name="categoriaUso"
                        value={formData.categoriaUso}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        <option value="">Selecione uma categoria</option>
                        <option value="Uber">Uber</option>
                        <option value="Alimentação">Alimentação</option>
                        <option value="Outro">Outro</option>
                      </select>
                      {errors.categoriaUso && (
                        <p className="text-xs text-red-500">{errors.categoriaUso}</p>
                      )}
                    </div>

                    {formData.categoriaUso === 'Outro' && (
                      <div className="space-y-2">
                        <label
                          htmlFor="categoriaOutro"
                          className="text-sm font-semibold text-foreground"
                        >
                          Especifique a categoria: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="categoriaOutro"
                          name="categoriaOutro"
                          value={formData.categoriaOutro}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                          placeholder="Descreva a categoria"
                        />
                        {errors.categoriaOutro && (
                          <p className="text-xs text-red-500">{errors.categoriaOutro}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label
                        htmlFor="nomeEvento"
                        className="text-sm font-semibold text-foreground"
                      >
                        Nome do evento: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="nomeEvento"
                        name="nomeEvento"
                        value={formData.nomeEvento}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Ex: Reunião com cliente, Gravação externa, etc."
                      />
                      {errors.nomeEvento && (
                        <p className="text-xs text-red-500">{errors.nomeEvento}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="transporte"
                        className="text-sm font-semibold text-foreground"
                      >
                        Transporte: <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="transporte"
                        name="transporte"
                        value={formData.transporte}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="Casa para o trabalho">O transporte foi de casa para o trabalho?</option>
                        <option value="Trabalho para casa">O transporte foi do trabalho para casa?</option>
                        <option value="Outro">Outro</option>
                      </select>
                      {errors.transporte && (
                        <p className="text-xs text-red-500">{errors.transporte}</p>
                      )}
                    </div>

                    {formData.transporte === 'Outro' && (
                      <div className="space-y-2">
                        <label
                          htmlFor="transporteOutro"
                          className="text-sm font-semibold text-foreground"
                        >
                          Especifique o transporte: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="transporteOutro"
                          name="transporteOutro"
                          value={formData.transporteOutro}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                          placeholder="Descreva o tipo de transporte"
                        />
                        {errors.transporteOutro && (
                          <p className="text-xs text-red-500">{errors.transporteOutro}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <label
                        htmlFor="valorGasto"
                        className="text-sm font-semibold text-foreground flex items-center gap-2"
                      >
                        <DollarSign className="h-4 w-4 text-secondary" />
                        Valor gasto: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="valorGasto"
                        name="valorGasto"
                        value={formData.valorGasto}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Ex: R$ 25,50"
                      />
                      {errors.valorGasto && (
                        <p className="text-xs text-red-500">{errors.valorGasto}</p>
                      )}
                    </div>

                    <div className="pt-4 flex justify-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold"
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
