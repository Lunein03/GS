"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Cloud, Headphones, Radar, ScanQrCode } from "lucide-react";

import { Button } from "@/shared/ui/button";

interface DriveQrFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight: string;
}

const DRIVE_QR_FEATURES: DriveQrFeature[] = [
  {
    icon: ScanQrCode,
    title: "Leitura Inteligente",
    description: "Processamento local das imagens com feedback imediato e validações acessíveis.",
    highlight: "Compatível com múltiplos uploads e leitura paralela.",
  },
  {
    icon: Cloud,
    title: "Integração Drive",
    description: "Extraia títulos, links e metadados diretamente dos arquivos do Google Drive.",
    highlight: "Elimina dependência de serviços externos duplicados.",
  },
  {
    icon: Headphones,
    title: "Prévia em Áudio",
    description: "Gere narrações automáticas para validar conteúdos auditivamente.",
    highlight: "Streaming otimizado com suporte a dispositivos móveis.",
  },
  {
    icon: Radar,
    title: "Fluxo Padronizado",
    description: "Contexto unificado, server actions tipadas e UI integrada ao design system.",
    highlight: "Mantemos observabilidade e consistência com o módulo Patrimônio.",
  },
];

export function DriveQrSection() {
  return (
    <section id="drive-qr" className="py-16 md:py-24 bg-background relative overflow-hidden noise-background">
      {/* Luzes flutuantes */}
      <div className="floating-lights-container">
        <div className="floating-light floating-light-1" />
        <div className="floating-light floating-light-2" />
        <div className="floating-light floating-light-3" />
        <div className="floating-light floating-light-4" />
        <div className="floating-light floating-light-5" />
      </div>

      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
            <ScanQrCode className="w-4 h-4" />
            <span className="text-sm font-medium">Digitalização inteligente</span>
          </div>
          
          <h2 className="mb-4 text-3xl font-medium md:text-4xl lg:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Drive QR Scanner integrado
          </h2>
          
          <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground">
            Concentre o fluxo de leitura de QR codes corporativos em um único lugar, com segurança, acessibilidade e suporte completo ao ecossistema da intranet.
          </p>
        </motion.div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {DRIVE_QR_FEATURES.map((feature, index) => (
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
                
                <p className="mt-4 text-sm font-medium text-foreground/70">
                  {feature.highlight}
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
          <Link href="/drive-qr" passHref>
            <Button 
              size="lg" 
              className="group text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-md transition-all duration-300"
            >
              Acessar Drive QR
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground mt-4">
            Disponível para times de produção e operações. Acesse com seu login corporativo.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

