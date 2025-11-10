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
    <section id="gs-propostas" className="py-16 md:py-24 bg-background relative overflow-hidden noise-background">
      <div className="floating-lights-container">
        <div className="floating-light floating-light-1" />
        <div className="floating-light floating-light-2" />
        <div className="floating-light floating-light-3" />
        <div className="floating-light floating-light-4" />
        <div className="floating-light floating-light-5" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <KanbanSquare className="w-4 h-4" />
            <span className="text-sm font-medium">Suite Comercial</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            GS Propostas
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Centralize oportunidades, propostas comerciais e indicadores financeiros em um único painel conectado.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 rounded-2xl border border-border bg-card hover:bg-accent/50 transition-all duration-300 hover:shadow-lg hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-lg font-medium mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-muted-foreground">
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
              className="group text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-md transition-all duration-300"
            >
              Acessar GS Propostas
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground mt-4">
            Disponível para squads autorizados e fluxos comerciais integrados
          </p>
        </motion.div>
      </div>
    </section>
  );
}

