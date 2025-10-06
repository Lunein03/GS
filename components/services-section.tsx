"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, GraduationCap, Scissors, Camera, FileAudio, Mic, Building2 } from "lucide-react";

const services = [
  {
    title: "Tradução e Interpretação",
    description: "Tradução e interpretação clara e precisa em diversos idiomas, como: Libras, inglês e espanhol. Nossos tradutores possuem longa experiência no mercado.",
    icon: <Globe className="h-12 w-12 text-primary" />,
  },
  {
    title: "Curso e Capacitação",
    description: "Cursos de Libras e temas relacionados à acessibilidade.Também elaboramos sob medida workshops e formações para aprimorar habilidades aos profissionais da área.",
    icon: <GraduationCap className="h-12 w-12 text-primary" />,
  },
  {
    title: "Edição e Pós-produção",
    description: "Montagem e pós-produção com tratamento de áudio e correção de cor, para um acabamento profissional e impactante.",
    icon: <Scissors className="h-12 w-12 text-primary" />,
  },
  {
    title: "Aluguel de Estúdio",
    description: "Ambiente completo e equipado para transformar suas ideias em produções profissionais.",
    icon: <Camera className="h-12 w-12 text-primary" />,
  },
  {
    title: "Audiodescrição",
    description: "Narrativas que descrevem imagens e cenas, garantindo acessibilidade para pessoas com deficiência visual.",
    icon: <FileAudio className="h-12 w-12 text-primary" />,
  },
  {
    title: "Locução",
    description: "Locução profissional que dá vida ao seu conteúdo, em diversos estilos e idiomas.",
    icon: <Mic className="h-12 w-12 text-primary" />,
  },
];

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="services" className="section-padding bg-muted/50" ref={ref}>
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">Nossos <span className="text-primary">Serviços</span></h2>
          <p className="text-muted-foreground">
          Oferecemos soluções completas para todas as etapas do seu projeto, garantindo qualidade, acessibilidade e profissionalismo em cada detalhe.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {services.map((service, index) => (
            <motion.div key={index} variants={itemVariants} className="h-full">
              <Card className="h-full card-hover border-border hover:border-primary/50">
                <CardHeader>
                  <div className="mb-4">{service.icon}</div>
                  <CardTitle className="font-inter font-medium">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}