"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Cloud, Headphones, Radar, ScanQrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <section id="drive-qr" className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" aria-hidden="true" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-primary">
            <ScanQrCode className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-medium">Digitalização inteligente</span>
          </div>
          <h2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent md:text-4xl lg:text-5xl">
            Drive QR Scanner integrado
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Concentre o fluxo de leitura de QR codes corporativos em um único lugar, com segurança, acessibilidade e
            suporte completo ao ecossistema da intranet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {DRIVE_QR_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <Card className="h-full border-border/60 bg-card/80 backdrop-blur">
                <CardHeader className="space-y-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                  </span>
                  <CardTitle className="text-lg text-foreground">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-primary/80">{feature.highlight}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.32 }}
          className="mt-14 text-center"
        >
          <Link href="/drive-qr" passHref>
            <Button size="lg" className="group rounded-xl px-8 py-6 text-lg shadow-lg">
              Acessar Drive QR
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Button>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Disponível para times de produção e operações. Acesse com seu login corporativo.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
