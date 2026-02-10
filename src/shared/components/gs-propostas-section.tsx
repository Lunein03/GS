"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, KanbanSquare, ClipboardCheck, ClipboardList, BarChart3, Cpu } from "lucide-react";

import { Button } from "@/shared/ui/button";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: KanbanSquare,
    title: "Pipeline Integrado",
    description: "Visão completa das oportunidades, etapas e valores com Kanban intuitivo.",
  },
  {
    icon: ClipboardCheck,
    title: "Propostas Inteligentes",
    description: "Editor com modelos, histórico e anexos centralizados para decisões rápidas.",
  },
  {
    icon: ClipboardList,
    title: "Tarefas e Agenda",
    description: "Fluxo de atividades colaborativo com checklist e lembretes automáticos.",
  },
  {
    icon: BarChart3,
    title: "Analytics Comercial",
    description: "Dashboards, metas e indicadores em tempo real para o time de vendas.",
  },
  {
    icon: Cpu,
    title: "Governança & Cadastros",
    description: "Cadastro de clientes, itens, categorias e permissões com trilha de auditoria.",
  },
];

export function GsPropostasSection() {
  return (
    <section id="gs-propostas" className="py-12 md:py-20 lg:py-28 bg-white dark:bg-[#0B0B0C] relative overflow-hidden font-inter transition-colors duration-300">

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 dark:bg-primary/5 text-primary mb-6 font-inter border border-primary/20 dark:border-primary/30 backdrop-blur-sm transition-all duration-300">
            <KanbanSquare className="w-4 h-4" aria-hidden="true" />
            <span className="text-sm font-medium tracking-wide">Suite Comercial</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-semibold mb-6 leading-[1.1] tracking-[-0.02em] text-foreground font-inter">
            GS Propostas
          </h2>

          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-inter">
            Centralize oportunidades, propostas comerciais e indicadores financeiros em um único painel conectado.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group ${index === 4 ? 'lg:col-start-2 lg:col-span-2' : ''}`}
            >
              <div className="h-full p-6 rounded-xl border border-border dark:border-[#262629] bg-card dark:bg-[#18181B] backdrop-blur-sm shadow-sm dark:shadow-none hover:shadow-md dark:hover:shadow-[0_8px_32px_rgba(100,34,242,0.15)] transition-all duration-300 font-inter focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/20 dark:group-hover:bg-primary/25 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-primary" aria-hidden="true" />
                </div>

                <h3 className="text-lg font-semibold mb-3 text-foreground leading-tight tracking-[-0.01em] font-inter">
                  {feature.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed font-inter">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Link href="/gs-propostas/dashboard" passHref>
            <Button
              size="lg"
              className="group shadow-md hover:shadow-lg"
            >
              Acessar GS Propostas
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground mt-6 font-inter">
            Disponível para squads autorizados e fluxos comerciais integrados
          </p>
        </motion.div>
      </div>
    </section>
  );
}
