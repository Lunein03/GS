'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  Clock,
  ClipboardCheck,
  CreditCard,
  FileText,
} from 'lucide-react';

export default function FormulariosCorporativos() {
  return (
    <div className="min-h-screen bg-background font-inter [&_h1]:font-inter [&_h1]:font-semibold [&_h2]:font-inter [&_h2]:font-semibold [&_h3]:font-inter [&_h3]:font-semibold">
      <div className="py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="space-y-8">
            <div className="flex justify-start">
              <Link
                href="/"
                className="btn-primary inline-flex items-center gap-3 px-4 py-3 text-sm font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao início
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
                Formulários Corporativos
              </h1>
            </div>

            <div className="bg-card/50 rounded-2xl border border-border/50 p-10 md:p-12 shadow-sm text-center">
              <div className="space-y-8 max-w-3xl mx-auto">
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg lg:leading-loose">
                  Acesse os formulários essenciais para registro e controle das atividades internas da GS Produções. Mantenha seus processos documentados, rastreáveis e em conformidade com os procedimentos internos.
                </p>
                <div className="bg-background/50 rounded-lg p-4 border border-border/30">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    <strong>Disponíveis:</strong> Horas Extras e Prestação de Contas
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-20">
            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <FileText className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl">Formulários Disponíveis</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      Utilize os formulários abaixo para manter o registro correto das atividades que exigem rastreabilidade e controle interno. Sempre que possível, preencha as informações no prazo estabelecido para garantir a conformidade e evitar inconsistências nos sistemas de gestão.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <Clock className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl text-center leading-tight">
                  Registro de Horas Extras – Banco de Horas
                </h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm space-y-6">
                  <div className="space-y-4 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      Este formulário deve ser preenchido sempre que houver realização de horas extras, garantindo controle interno e registro correto no banco de horas da GS Produções.
                    </p>
                    <div className="bg-background/50 rounded-lg p-6 border border-border/30 space-y-3">
                      <p className="text-sm text-foreground font-semibold flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-secondary" />
                        Orientações Importantes:
                      </p>
                      <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
                        <li>O preenchimento deve ser feito em até <strong>1 dia útil</strong> após a hora extra.</li>
                        <li>As horas devem ter sido <strong>autorizadas previamente pelo Gabriel</strong>.</li>
                        <li>Horas não registradas corretamente <strong>não serão computadas</strong> no banco de horas.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-center">
                    <Link
                      href="/formularios/horas-extras"
                      className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold"
                    >
                      <Clock className="h-4 w-4" />
                      Acessar formulário de horas extras
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <CreditCard className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl text-center leading-tight">
                  Prestação de Contas – Cartão Corporativo
                </h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm space-y-6">
                  <div className="space-y-4 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      Este formulário deve ser preenchido sempre que o cartão corporativo for utilizado. O cartão é exclusivo para despesas com Uber e alimentação relacionadas às atividades profissionais.
                    </p>
                    <div className="bg-background/50 rounded-lg p-6 border border-border/30 space-y-3">
                      <p className="text-sm text-foreground font-semibold flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4 text-secondary" />
                        Observações Importantes:
                      </p>
                      <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
                        <li>Utilize o cartão <strong>apenas</strong> para transporte (Uber) ou alimentação em atividades de trabalho.</li>
                        <li>Preencha o formulário <strong>imediatamente após cada uso</strong>.</li>
                        <li>Valores não prestados serão <strong>divididos entre todos e descontados na folha</strong>.</li>
                      </ul>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-center">
                    <Link
                      href="/formularios/prestacao-contas"
                      className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold"
                    >
                      <CreditCard className="h-4 w-4" />
                      Acessar formulário de prestação de contas
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <footer className="flex flex-col items-center gap-8 rounded-3xl border border-border bg-card/80 p-10 md:p-12 text-center shadow-sm">
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base lg:leading-loose">
              Em caso de dúvidas sobre o preenchimento de qualquer formulário, entre em contato com o departamento responsável ou envie um e-mail para <strong>comunicacao@gsproducao.com</strong>.
            </p>
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Retornar à página inicial
            </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
