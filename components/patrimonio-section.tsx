"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Package, Search, FileText, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

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
    <section id="patrimonio" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header da seção */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Package className="w-4 h-4" />
            <span className="text-sm font-medium">Sistema de Gestão</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Controle de Patrimônio
          </h2>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
            Gerencie, localize e solicite os ativos e equipamentos da empresa de forma rápida e centralizada
          </p>
        </motion.div>

        {/* Grid de features */}
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
                
                <h3 className="text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-muted-foreground">
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
              className="group text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Acessar Patrimônio
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground mt-4">
            Acesso disponível apenas para colaboradores autorizados
          </p>
        </motion.div>
      </div>
    </section>
  );
}
