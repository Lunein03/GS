"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, ClipboardCheck, ClipboardList, Cpu, KanbanSquare } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface GsPropostaModuleFeature {
  icon: React.ElementType;
  title: string;
  description: string;
  insight: string;
}

const MODULE_FEATURES: GsPropostaModuleFeature[] = [
  {
    icon: KanbanSquare,
    title: "Dashboard de Oportunidades",
    description: "Pipeline visual com arraste e solte, colunas configuráveis e visão consolidada de valores por fase.",
    insight: "Centraliza priorização e reduz o tempo de atualização do funil comercial.",
  },
  {
    icon: ClipboardCheck,
    title: "Gestão de Propostas Comerciais",
    description: "Editor completo com preview em tempo real, controle de status e abas para dados, itens, atividades e documentos.",
    insight: "Automatiza geração de contratos e permite decisões baseadas em histórico granular.",
  },
  {
    icon: ClipboardList,
    title: "Acompanhamento de Atividades",
    description: "Agenda centralizada com filtros por usuário, integração com calendário corporativo e checklist por tarefa.",
    insight: "Garante cadência de follow-ups e elimina silos entre times de pré e pós-venda.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e BI",
    description: "KPIs de faturamento, análise ABC de itens e dashboards de produtividade com métricas acionáveis.",
    insight: "Transforma dados operacionais em inteligência comercial contínua.",
  },
  {
    icon: Cpu,
    title: "Cadastros e Governança",
    description: "Gestão de clientes, empresas, itens, categorias e permissões com trilha de auditoria e multi-empresa nativo.",
    insight: "Assegura consistência de dados mestres e acelera configurações para novos squads.",
  },
];

export function GsPropostasSection() {
  return (
    <section id="gs-propostas" className="py-16 md:py-24 bg-background relative overflow-hidden noise-background">
      <div className="floating-lights-container">
        <div className="floating-light floating-light-1" />
        <div className="floating-light floating-light-2" />
        <div className="floating-light floating-light-3" />
        <div className="floating-light floating-light-4" />
        <div className="floating-light floating-light-5" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-secondary/5 via-transparent to-transparent" />

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-4 py-2 text-secondary">
            <KanbanSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Ciclo de vendas integrado</span>
          </div>

          <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            GS Propostas
          </h2>

          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground">
            Plataforma SaaS que orquestra oportunidades, propostas comerciais e analytics financeiros com automações inteligentes para squads comerciais e operações de projeto.
          </p>
        </motion.div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {MODULE_FEATURES.map((feature, index) => (
            <motion.article
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group h-full"
            >
              <div className="h-full p-6 rounded-2xl border border-border bg-card transition-all duration-300 group-hover:bg-accent/50 group-hover:shadow-lg group-hover:-translate-y-1">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-secondary" />
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>

                <p className="mt-4 text-sm font-medium text-foreground/70">
                  {feature.insight}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="flex flex-col items-center gap-4"
        >
          <Link href="/gs-propostas/dashboard" aria-label="Acessar GS Propostas">
            <Button size="lg" className="group text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              Acessar Plataforma
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground text-center max-w-lg">
            Roadmap contempla assistentes de IA proativos, automações de workflow e portal de aprovação para clientes corporativos.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
