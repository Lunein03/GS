'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  CreditCard,
  FileText,
  LineChart,
  ExternalLink,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

export default function PoliticaUsoRecursosFinanceiros() {
  return (
    <div className="min-h-screen bg-background font-inter [&_h1]:font-inter [&_h1]:font-medium [&_h2]:font-inter [&_h2]:font-medium [&_h3]:font-inter [&_h3]:font-medium">
      <div className="py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="space-y-8">
            <div className="flex justify-start">
              <Link
                href="/"
                className="btn-primary inline-flex items-center gap-3 px-4 py-3 text-sm font-medium"
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
              <h1 className="text-3xl font-medium text-foreground md:text-4xl lg:text-5xl leading-tight">
                Política Interna de Uso dos Recursos Financeiros
              </h1>
            </div>

            <div className="bg-card/50 rounded-2xl border border-border/50 p-10 md:p-12 shadow-sm text-center">
              <div className="space-y-8 max-w-3xl mx-auto">
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg lg:leading-loose">
                  Esta política estabelece diretrizes para a utilização responsável, transparente e alinhada aos objetivos estratégicos dos recursos financeiros da GS Produções. Consulte este documento antes de realizar solicitações, autorizações ou prestações de contas relacionadas a despesas corporativas.
                </p>
                <div className="bg-background/50 rounded-lg p-4 border border-border/30">
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    <strong>Vigente desde:</strong> 11 de novembro de 2024
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-20">
            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <FileText className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-medium text-foreground md:text-2xl">Introdução</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      Esta política visa estabelecer diretrizes claras para a utilização responsável dos recursos financeiros da empresa, assegurando transparência, controle e alinhamento com os objetivos estratégicos da GS Produções.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <ShieldCheck className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-medium text-foreground md:text-2xl">Abrangência</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <p className="text-base leading-relaxed text-muted-foreground lg:leading-loose text-left">
                    Esta política se aplica a todos os colaboradores da empresa, independentemente do cargo, função ou área de atuação.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <LineChart className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-medium text-foreground md:text-2xl text-center">Princípios Gerais</h2>
              </div>

              <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow text-center space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Transparência</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    Todos os gastos devem ser devidamente registrados e documentados.
                  </p>
                </div>
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow text-center space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Responsabilidade</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    Colaboradores são responsáveis pelo uso consciente dos recursos financeiros, evitando desperdícios e gastos não essenciais.
                  </p>
                </div>
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow text-center space-y-4">
                  <h3 className="text-lg font-medium text-foreground">Conformidade</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    Todas as transações devem seguir as normas legais e fiscais aplicáveis.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <ClipboardCheck className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-medium text-foreground md:text-2xl text-center">Autorização de Despesas</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      Qualquer despesa extraordinária, fora do orçamento previsto ou superior ao limite mensal estabelecido, deve ser previamente autorizada pela diretoria ou pelo conselho administrativo.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <Wallet className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-medium text-foreground md:text-2xl text-center leading-tight">
                  Controle e Acompanhamento
                </h2>
              </div>

              <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-4 text-left text-sm leading-relaxed text-muted-foreground md:text-base lg:leading-loose">
                    <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-secondary" /> Procedimentos de Prestação de Contas
                    </h3>
                    <div className="space-y-4">
                      <p>
                        O colaborador deve preencher o formulário específico de prestação de contas, disponível abaixo, garantindo o registro completo das informações da despesa.
                      </p>
                      <Link
                        href="https://docs.google.com/forms/d/e/1FAIpQLSd3QDv76oeqr3giaOsxskh5k5DfzIapDR5z-KJK_r8Iq9H4Rg/viewform"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-secondary underline decoration-2 underline-offset-4 transition-colors hover:text-secondary/80"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden />
                        Acessar formulário de prestação de contas
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-4 text-left text-sm leading-relaxed text-muted-foreground md:text-base lg:leading-loose">
                    <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
                      <FileText className="h-5 w-5 text-secondary" /> Comprovantes de Pagamento
                    </h3>
                    <p>
                      Todos os comprovantes de pagamento devem ser entregues ao departamento financeiro imediatamente após o uso.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <CreditCard className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-medium text-foreground md:text-2xl text-center">Uso do Cartão Corporativo</h2>
              </div>

              <div className="mx-auto max-w-6xl space-y-8">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-sm leading-relaxed text-muted-foreground md:text-base lg:leading-loose">
                    <h3 className="text-lg font-medium text-foreground">Limites e Restrições</h3>
                    <ul className="list-disc space-y-3 pl-6">
                      <li>O uso do cartão corporativo está restrito a gastos pré-aprovados.</li>
                      <li>Os limites estipulados pela empresa devem ser rigorosamente respeitados.</li>
                      <li>Gastos pessoais são estritamente proibidos.</li>
                      <li>Em eventos, o valor máximo permitido para almoço é de <strong>R$ 30,00</strong> por pessoa.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-sm leading-relaxed text-muted-foreground md:text-base lg:leading-loose">
                    <h3 className="text-lg font-medium text-foreground">Utilização de Uber e Serviços Similares</h3>
                    <p>
                      A utilização do Uber, ou outros serviços de transporte similar, está autorizada apenas em casos pré-aprovados pela diretoria.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <AlertTriangle className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-medium text-foreground md:text-2xl">Penalidades</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      Qualquer violação desta política, como mau uso ou falta de comprovação de despesas, poderá resultar em sanções disciplinares.
                    </p>
                    <ul className="list-disc space-y-4 pl-6 text-sm md:text-base lg:leading-loose">
                      <li>Advertências verbais ou escritas.</li>
                      <li>Suspensão do acesso aos recursos financeiros.</li>
                      <li>Descontos diretos em folha de pagamento referentes a valores não comprovados.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <CalendarClock className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-medium text-foreground md:text-2xl text-center">Revisão da Política</h2>
              </div>

              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <p className="text-base leading-relaxed text-muted-foreground lg:leading-loose text-left">
                    Esta política será revisada anualmente para garantir alinhamento às melhores práticas de governança financeira, bem como conformidade com a legislação vigente e com as demandas internas da GS Produções.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <footer className="flex flex-col items-center gap-8 rounded-3xl border border-border bg-card/80 p-10 md:p-12 text-center shadow-sm">
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base lg:leading-loose">
              Em caso de dúvidas sobre esta política ou sobre procedimentos financeiros, entre em contato com o Departamento Financeiro ou com a diretoria responsável.
            </p>
            <Link
              href="/"
              className="btn-primary inline-flex items-center gap-2 px-8 py-4 text-sm font-medium"
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
