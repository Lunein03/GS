'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  ClipboardCheck,
  Clock,
  CreditCard,
  FileText,
  ShieldCheck,
  Users,
} from 'lucide-react';

export default function PoliticasDocumentacao() {
  return (
    <div className="min-h-screen bg-background font-inter [&_h1]:font-inter [&_h1]:font-semibold [&_h2]:font-inter [&_h2]:font-semibold [&_h3]:font-inter [&_h3]:font-semibold">
      <div className="py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-20">
          <div className="space-y-8">
            {/* Botão Voltar lateralizado à esquerda */}
            <div className="flex justify-start">
              <Link
                href="/"
                className="btn-primary inline-flex items-center gap-3 px-4 py-3 text-sm font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao início
              </Link>
            </div>

            {/* Logo e Título fora do card */}
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
                Políticas e diretrizes da GS Produções
              </h1>
            </div>

            {/* Card apenas com descrição e data */}
            <div className="bg-card/50 rounded-2xl border border-border/50 p-10 md:p-12 shadow-sm text-center">
              <div className="space-y-8 max-w-3xl mx-auto">
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg lg:leading-loose">
                  Este documento reúne os princípios, deveres, responsabilidades e condutas esperadas de todos os colaboradores da GS Produções. Consulte-o sempre que tiver dúvidas sobre procedimentos internos ou condutas adequadas.
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
                <h2 className="text-xl font-bold text-foreground md:text-2xl">Introdução</h2>
              </div>
              
              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      Esta política tem por objetivo assegurar a convivência harmoniosa e produtiva entre os colaboradores, orientando as relações de trabalho e tornando claros os direitos e deveres de todos os envolvidos.
                    </p>
                    <p>
                      As normas aqui estabelecidas integram o contrato individual de trabalho e complementam a legislação trabalhista vigente, especialmente a Constituição Federal e a Consolidação das Leis do Trabalho.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <FileText className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl">Integração ao contrato</h2>
              </div>
              
              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      Todos os colaboradores, independentemente da função ou nível hierárquico, estão sujeitos a este regulamento durante toda a vigência do contrato de trabalho. Ao ser admitido, cada profissional recebe e aceita estas diretrizes, não podendo alegar desconhecimento.
                    </p>
                    <p>
                      Para colaboradores já efetivos, o regulamento entrou em vigor em <strong>11 de novembro de 2024</strong>. Para novas admissões, passa a valer a partir da data de inclusão no quadro funcional.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <Users className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl text-center">Admissão dos funcionários: Art. 2º</h2>
              </div>
              
              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      A admissão e a demissão são atos exclusivos da administração. Toda contratação depende de exames técnicos e avaliação médica, além da apresentação dos documentos exigidos pela legislação ou pela empresa, nos prazos definidos.
                    </p>
                    <p>
                      A efetivação está condicionada à conclusão de um período de experiência formalizado em contrato específico, que pode ser prorrogado até o limite de <strong>90 dias</strong>, conforme previsto na CLT.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <ClipboardCheck className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl text-center leading-tight">
                  Deveres, obrigações e responsabilidades: Arts. 5º e 6º
                </h2>
              </div>
              
              <div className="mx-auto max-w-6xl space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Card 1: Responsabilidades Profissionais */}
                  <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 justify-center">
                        <ClipboardCheck className="h-6 w-6 text-secondary" />
                        <h3 className="text-lg font-semibold text-foreground">Responsabilidades Profissionais</h3>
                      </div>
                      <ul className="list-disc space-y-3 text-left text-sm leading-relaxed text-muted-foreground md:text-base pl-6 lg:leading-loose">
                        <li>Cumprir as atribuições com zelo, eficiência e responsabilidade.</li>
                        <li>Respeitar o comando hierárquico e as instruções recebidas.</li>
                        <li>Sugerir melhorias e comunicar irregularidades observadas.</li>
                        <li>Participar de treinamentos oferecidos pela empresa.</li>
                        <li>Comunicar condutas inadequadas e colaborar com investigações internas.</li>
                        <li>Usar corretamente os sistemas de ponto e registrar a jornada pessoalmente.</li>
                        <li>Utilizar recursos tecnológicos apenas para fins profissionais.</li>
                        <li>Indenizar danos causados por dolo ou negligência comprovada.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Card 2: Conduta e Relacionamento */}
                  <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 justify-center">
                        <Users className="h-6 w-6 text-secondary" />
                        <h3 className="text-lg font-semibold text-foreground">Conduta e Relacionamento</h3>
                      </div>
                      <ul className="list-disc space-y-3 text-left text-sm leading-relaxed text-muted-foreground md:text-base pl-6 lg:leading-loose">
                        <li>Manter disciplina, organização e respeito aos colegas.</li>
                        <li>Preservar as instalações, equipamentos e materiais da empresa.</li>
                        <li>Zelar pela apresentação pessoal e pelo uso adequado do uniforme.</li>
                        <li>Guardar pertences nos locais indicados e respeitar áreas comuns.</li>
                        <li>Informar mudanças de dados cadastrais, estado civil ou dependentes.</li>
                        <li>Utilizar crachá de identificação e cumprir normas de acesso.</li>
                        <li>Respeitar a integridade física e moral de todos os colaboradores.</li>
                        <li>Evitar brincadeiras, discussões e atitudes que prejudiquem o ambiente.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-card/50 rounded-2xl p-8 border border-border/50 shadow-sm">
                  <p className="text-sm leading-relaxed text-muted-foreground text-center">
                    <strong>Importante:</strong> O uso de internet, intranet, e-mail corporativo e demais recursos só é permitido para atividades relacionadas ao trabalho. O descumprimento pode acarretar advertências, suspensão ou demissão por justa causa.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <AlertTriangle className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl">Condutas proibidas</h2>
              </div>
              
              <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Card 1: Ambiente e Relacionamento */}
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 justify-center">
                      <Users className="h-6 w-6 text-secondary" />
                      <h3 className="text-lg font-semibold text-foreground">Ambiente e Relacionamento</h3>
                    </div>
                    <ul className="list-disc space-y-3 text-left text-sm leading-relaxed text-muted-foreground md:text-base pl-6 lg:leading-loose">
                      <li>Realizar atividades pessoais ou negociações sem autorização no expediente.</li>
                      <li>Fumar nas dependências internas ou áreas não designadas.</li>
                      <li>Permitir acesso não autorizado de terceiros às instalações.</li>
                      <li>Promover algazarras, brincadeiras inconvenientes ou discussões inadequadas.</li>
                      <li>Portar bebidas alcoólicas, entorpecentes ou armas na empresa.</li>
                      <li>Utilizar celular em áreas restritas sem consentimento prévio.</li>
                      <li>Assumir postura de chefia sem delegação formal.</li>
                      <li>Afastar-se do posto de trabalho sem comunicar a liderança.</li>
                    </ul>
                  </div>
                </div>

                {/* Card 2: Segurança e Confidencialidade */}
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 justify-center">
                      <ShieldCheck className="h-6 w-6 text-secondary" />
                      <h3 className="text-lg font-semibold text-foreground">Segurança e Confidencialidade</h3>
                    </div>
                    <ul className="list-disc space-y-3 text-left text-sm leading-relaxed text-muted-foreground md:text-base pl-6 lg:leading-loose">
                      <li>Retirar documentos, equipamentos ou materiais da empresa sem permissão.</li>
                      <li>Divulgar informações confidenciais ou colaborar com concorrentes.</li>
                      <li>Marcar o ponto para outro colaborador ou fraudar registros.</li>
                      <li>Divulgar informações salariais ou financeiras sem autorização.</li>
                      <li>Usar recursos tecnológicos para fins estranhos ao trabalho.</li>
                      <li>Aceitar presentes, valores ou vantagens de parceiros comerciais.</li>
                      <li>Produzir registros ou anotações confidenciais para uso próprio.</li>
                      <li>Desrespeitar normas internas, circulares ou comunicados oficiais.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <Clock className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl text-center leading-tight">
                  Horário de trabalho e marcação de ponto: Arts. 11 a 22
                </h2>
              </div>
              
              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      A jornada padrão é de <strong>40 horas semanais</strong>, com possibilidade de ajustes conforme necessidade do serviço. O registro de ponto é pessoal e intransferível, devendo ocorrer no início e término da jornada, além das pausas obrigatórias.
                    </p>
                    
                    <ul className="list-disc space-y-4 pl-6 text-sm md:text-base lg:leading-loose">
                      <li><strong>Pontualidade e assiduidade:</strong> chegar no horário, justificar atrasos, corrigir registros e avisar ausências.</li>
                      <li><strong>Faltas justificadas:</strong> apresentar atestados válidos, formalizar solicitações e combinar compensações com a liderança.</li>
                    </ul>
                    
                    <div className="bg-background/50 rounded-lg p-6 border border-border/30">
                      <p className="text-sm leading-relaxed text-muted-foreground flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-secondary mt-0.5 flex-shrink-0" />
                        <span><strong>Atenção:</strong> Marcar o ponto para outra pessoa caracteriza falta grave e pode resultar em demissão por justa causa.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <ClipboardCheck className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl">Atestados: Arts. 23 e 24</h2>
              </div>
              
              <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Card 1: Ordem de Prioridade */}
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 justify-center">
                      <FileText className="h-6 w-6 text-secondary" />
                      <h3 className="text-lg font-semibold text-foreground">Ordem de Prioridade</h3>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-foreground mb-4">Justificativas médicas por ordem de preferência:</p>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <div className="flex items-center gap-2 flex-1">
                            <Users className="h-4 w-4 text-secondary" />
                            <span className="text-sm text-muted-foreground">Médico da empresa ou credenciado</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <div className="flex items-center gap-2 flex-1">
                            <ShieldCheck className="h-4 w-4 text-secondary" />
                            <span className="text-sm text-muted-foreground">Médico do SUS: Sistema Único de Saúde</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <div className="flex items-center gap-2 flex-1">
                            <CreditCard className="h-4 w-4 text-secondary" />
                            <span className="text-sm text-muted-foreground">Médico do SESI ou SESC</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <div className="flex items-center gap-2 flex-1">
                            <FileText className="h-4 w-4 text-secondary" />
                            <span className="text-sm text-muted-foreground">Médico de repartição pública (federal, estadual ou municipal)</span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <div className="flex items-center gap-2 flex-1">
                            <Users className="h-4 w-4 text-secondary" />
                            <span className="text-sm text-muted-foreground">Médico do sindicato da categoria ou profissional de livre escolha</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 2: Requisitos do Documento */}
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 justify-center">
                      <ClipboardCheck className="h-6 w-6 text-secondary" />
                      <h3 className="text-lg font-semibold text-foreground">Requisitos do Documento</h3>
                    </div>
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-foreground mb-4">O atestado médico deve conter obrigatoriamente:</p>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <FileText className="h-4 w-4 text-secondary mt-0.5" />
                          <span className="text-sm text-muted-foreground">Diagnóstico (quando autorizado pelo paciente)</span>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <Clock className="h-4 w-4 text-secondary mt-0.5" />
                          <span className="text-sm text-muted-foreground">Tempo de afastamento necessário</span>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <Users className="h-4 w-4 text-secondary mt-0.5" />
                          <span className="text-sm text-muted-foreground">Identificação completa do profissional</span>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <ClipboardCheck className="h-4 w-4 text-secondary mt-0.5" />
                          <span className="text-sm text-muted-foreground">Assinatura do médico</span>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                          <CreditCard className="h-4 w-4 text-secondary mt-0.5" />
                          <span className="text-sm text-muted-foreground">Número de registro no respectivo conselho (CRM, etc.)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <CreditCard className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl">Pagamento e férias: Arts. 25 a 30</h2>
              </div>
              
              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <ul className="list-disc space-y-4 text-left text-sm leading-relaxed text-muted-foreground md:text-base pl-6 lg:leading-loose">
                    <li>Pagamento até o <strong>5º dia útil</strong> do mês subsequente, em moeda corrente ou depósito.</li>
                    <li>Diferenças devem ser informadas ao RH no primeiro dia útil.</li>
                    <li>Adiantamentos podem ser concedidos conforme Convenção Coletiva.</li>
                    <li>Férias concedidas em até 12 meses, com possibilidade de fracionamento em dois períodos (um deles de no mínimo 10 dias).</li>
                    <li>Transferências seguem cláusulas contratuais, com despesas definidas conforme a iniciativa.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <AlertTriangle className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl">Penalidades: Arts. 32 e 33</h2>
              </div>
              
              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      As penalidades são aplicadas pelo Departamento de Recursos Humanos, considerando a legislação vigente e a gravidade de cada ocorrência. Podem ser graduais ou imediatas em caso de falta grave.
                    </p>
                    <ul className="list-disc space-y-4 pl-6 text-sm md:text-base lg:leading-loose">
                      <li>Advertência verbal: aviso inicial sobre a conduta observada.</li>
                      <li>Advertência escrita: registro formal em caso de reincidência.</li>
                      <li>Suspensão: medida disciplinar temporária conforme a gravidade.</li>
                      <li>Demissão: aplicada em situações extremas ou reincidência grave.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <ShieldCheck className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl">Disposições finais</h2>
              </div>
              
              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm">
                  <div className="space-y-6 text-left text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    <p>
                      Sugestões e reclamações relacionadas ao serviço podem ser encaminhadas diretamente à liderança ou à administração. Além deste regulamento, permanecem válidas as circulares, ordens de serviço e demais comunicados oficiais da GS Produções.
                    </p>
                    <p>
                      Este regulamento integra o contrato individual de trabalho e pode ser atualizado sempre que necessário, especialmente em razão de alterações legais ou demandas internas.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-10">
              <div className="flex flex-col items-center gap-5">
                <CalendarClock className="h-8 w-8 text-secondary" />
                <h2 className="text-xl font-bold text-foreground md:text-2xl">Responsável pela elaboração</h2>
              </div>
              
              <div className="mx-auto max-w-4xl">
                <div className="bg-card/50 rounded-2xl border border-border/50 p-8 shadow-sm text-center">
                  <p className="text-base leading-relaxed text-muted-foreground lg:leading-loose">
                    Documento organizado por <strong>IVALDO KUCZKOWSKI</strong>, Advogado Especialista em Direito Administrativo e Conselheiro de Tributos da AUDICONT Contabilidade, Marcas &amp; Patentes e Inteligência Fiscal.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <footer className="flex flex-col items-center gap-8 rounded-3xl border border-border bg-card/80 p-10 md:p-12 text-center shadow-sm">
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base lg:leading-loose">
              Este regulamento deve ser consultado com frequência por todos os colaboradores, garantindo alinhamento às melhores práticas de gestão, segurança e convivência na GS Produções.
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
