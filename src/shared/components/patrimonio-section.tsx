"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Package, Search, FileText, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/button";

export function PatrimonioSection() {
  const features = [
    {
      icon: Package,
      title: "Controle de Ativos",
      description: "Gerencie todos os equipamentos e ativos da empresa",
    },
    {
      icon: Search,
      title: "Localização Rápida",
      description: "Encontre qualquer item em segundos",
    },
    {
      icon: FileText,
      title: "Histórico Completo",
      description: "Acompanhe todo o ciclo de vida dos equipamentos",
    },
    {
      icon: TrendingUp,
      title: "Relatórios e Análises",
      description: "Visualize dados e estatísticas em tempo real",
    },
  ];

  return (
    <section id="patrimonio" className="py-12 md:py-[72px] lg:py-[112px] bg-gray-100 dark:bg-gray-900 relative overflow-hidden font-inter">
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header da seção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary mb-6 font-inter border border-primary/20">
            <Package className="w-4 h-4" />
            <span className="text-sm font-medium">Sistema de Gestão</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-medium mb-6 leading-[1.1] tracking-[-0.02em] text-foreground font-inter">
            Controle de Patrimônio
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-[1.6] font-inter">
            Gerencie, localize e solicite os ativos e equipamentos da empresa de forma rápida e centralizada
          </p>
        </motion.div>

        {/* Grid de features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 rounded-lg border border-border bg-card shadow-light hover:shadow-hover transition-all duration-300 font-inter focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-card-foreground leading-tight tracking-[-0.01em] font-inter">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed font-inter">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Link href="/patrimonio" passHref>
            <Button 
              size="lg" 
              className="group text-base px-8 py-4 font-medium font-inter focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Acessar Patrimônio
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground mt-4 font-inter">
            Acesso disponível apenas para colaboradores autorizados
          </p>
        </motion.div>
      </div>
    </section>
  );
}
