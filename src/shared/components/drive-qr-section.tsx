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
    <section id="drive-qr" className="py-12 md:py-[72px] lg:py-[112px] bg-gray-100 dark:bg-gray-900 relative overflow-hidden font-inter">
      
      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center md:mb-16"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 backdrop-blur-md px-5 py-2 text-primary font-inter border border-primary/20">
            <ScanQrCode className="w-4 h-4" />
            <span className="text-sm font-medium">Digitalização inteligente</span>
          </div>
          
          <h2 className="mb-6 text-4xl md:text-5xl font-medium leading-[1.1] tracking-[-0.02em] text-foreground font-inter">
            Drive QR Scanner integrado
          </h2>
          
          <p className="mx-auto max-w-2xl text-lg leading-[1.6] text-foreground/80 font-inter">
            Concentre o fluxo de leitura de QR codes corporativos em um único lugar, com segurança, acessibilidade e suporte completo ao ecossistema da intranet.
          </p>
        </motion.div>

        <div className="mb-16 grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {DRIVE_QR_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full p-6 rounded-lg border border-border bg-card backdrop-blur-xl shadow-light hover:shadow-hover transition-all duration-300 font-inter focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4 group-hover:bg-primary/90 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                
                <h3 className="text-lg font-semibold mb-3 text-card-foreground leading-tight tracking-[-0.01em] font-inter">
                  {feature.title}
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed font-inter mb-3">
                  {feature.description}
                </p>
                
                <p className="text-sm font-medium text-primary font-inter">
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
              className="group text-base px-8 py-4 font-medium font-inter focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Acessar Drive QR
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <p className="text-sm text-muted-foreground mt-4 font-inter">
            Disponível para times de produção e operações. Acesse com seu login corporativo.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
