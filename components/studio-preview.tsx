"use client";

import { useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Monitor, 
  Mic, 
  FileText, 
  Calendar, 
  CheckCircle2,
  ArrowRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface StudioFeature {
  title: string;
  description: string;
  icon: JSX.Element;
  color: string;
  gradient: {
    light: string;
    dark: string;
  };
  highlights: string[];
}

export function StudioPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const features: StudioFeature[] = [
    {
      title: "Estrutura Premium",
      description: "Espaço de 30m² projetado para excelência em produções audiovisuais.",
      icon: <Camera className="h-8 w-8 text-primary" />,
      color: "bg-primary/10",
      gradient: {
        light: "from-background to-background",
        dark: "from-background to-background"
      },
      highlights: [
        "Ambiente climatizado",
        "Tratamento acústico completo", 
        "Fundo chroma key profissional"
      ]
    },
    {
      title: "Equipamentos de Ponta",
      description: "Tecnologia de última geração para resultados cinematográficos.",
      icon: <Monitor className="h-8 w-8 text-primary" />,
      color: "bg-primary/10",
      gradient: {
        light: "from-background to-background",
        dark: "from-background to-background"
      },
      highlights: [
        "Câmeras 4K",
        "Iluminação LED avançada", 
        "Tripés e estabilizadores profissionais"
      ]
    },
    {
      title: "Áudio de Alta Fidelidade",
      description: "Captura e monitoramento de som com precisão absoluta.",
      icon: <Mic className="h-8 w-8 text-primary" />,
      color: "bg-primary/10",
      gradient: {
        light: "from-background to-background",
        dark: "from-background to-background"
      },
      highlights: [
        "Microfones de estúdio",
        "Gravadores portáteis de alta qualidade", 
        "Monitoramento em tempo real"
      ]
    },
    {
      title: "Suporte Técnico Especializado",
      description: "Documentação e assistência para cada detalhe do seu projeto.",
      icon: <FileText className="h-8 w-8 text-primary" />,
      color: "bg-primary/10",
      gradient: {
        light: "from-background to-background",
        dark: "from-background to-background"
      },
      highlights: [
        "Manual técnico detalhado",
        "Especificações completas", 
        "Consultoria personalizada"
      ]
    }
  ];

  return (
    <section 
      id="studio"
      className={cn(
        "py-24 md:py-32 relative overflow-hidden",
        "bg-gradient-to-br from-background via-muted/10 to-background"
      )} 
      ref={ref}
    >
      <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/50 opacity-50"></div>
      
      <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 
            bg-clip-text text-transparent 
            bg-gradient-to-r from-primary to-primary/70">
            <span className="font-neoverse text-black dark:text-white">Estúdio</span>
            <span className="font-neoverse text-primary"> GS Produções</span>
          </h2>
          <div className="w-24 h-1 mx-auto mb-6 bg-primary rounded-full"></div>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            Transformamos sua visão criativa em conteúdo de alta qualidade. 
            Um ambiente profissional onde tecnologia, criatividade e expertise se encontram.
          </p>
        </motion.div>

        <motion.div 
          className="space-y-8"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          <motion.div
            className="relative group mx-auto max-w-3xl"
          >
            <div className="aspect-video w-full overflow-hidden rounded-2xl 
              shadow-2xl shadow-primary/20">
              <video
                className="w-full h-full object-cover"
                autoPlay={true}
                loop={true}
                muted={true}
                playsInline={true}
                controls={false}
                preload="auto"
                onCanPlay={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.play().catch(err => console.error('Erro ao reproduzir vídeo:', err));
                }}
              >
                <source src="https://video-gsproducao.s3.sa-east-1.amazonaws.com/estudio.mp4" type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
          </motion.div>

          <motion.div
            className="w-full max-w-6xl mx-auto"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            <Carousel 
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {features.map((feature, index) => (
                  <CarouselItem key={feature.title} className="md:basis-1/2 lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: (index + 1) * 0.1,
                        duration: 0.5
                      }}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { 
                          opacity: 1, 
                          y: 0,
                          transition: { duration: 0.6 }
                        }
                      }}
                      whileHover="hover"
                      className="h-full"
                    >
                      <Card
                        className={cn(
                          "p-6 h-full",
                          "rounded-xl border border-border",
                          "bg-card dark:bg-card",
                          "text-card-foreground dark:text-card-foreground",
                          "transition-all duration-300 ease-in-out",
                          "hover:shadow-md hover:border-primary/30",
                        )}
                      >
                        <motion.div 
                          className="mb-4 text-primary"
                          variants={{
                            hover: { 
                              transition: { duration: 0.3 }
                            }
                          }}
                        >
                          {feature.icon}
                        </motion.div>
                        
                        <div className="space-y-3">
                          <motion.div
                            variants={{
                              hover: { y: -1, transition: { duration: 0.3 } }
                            }}
                          >
                            <h3 className="text-xl font-bold mb-2 text-foreground">
                              {feature.title}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {feature.description}
                            </p>
                          </motion.div>
                          
                          <motion.div 
                            className="space-y-1 pt-2"
                            variants={{
                              hover: { y: 0, transition: { duration: 0.3 } }
                            }}
                          >
                            {feature.highlights.map((highlight, i) => (
                              <motion.div 
                                key={highlight} 
                                className="flex items-center text-xs text-foreground/80"
                                initial={{ opacity: 0.9 }}
                                variants={{
                                  hover: { 
                                    x: 2,
                                    opacity: 1,
                                    transition: { 
                                      delay: i * 0.05,
                                      duration: 0.2
                                    }
                                  }
                                }}
                              >
                                <CheckCircle2 
                                  className="mr-2 h-4 w-4 flex-shrink-0 text-primary" 
                                />
                                <span>{highlight}</span>
                              </motion.div>
                            ))}
                          </motion.div>
                          
                          {index === 3 && (
                            <div className="pt-4 mt-2">
                              <Button
                                variant="outline"
                                className="w-full gap-2 border-primary text-primary hover:bg-primary/5 dark:border-primary dark:text-primary dark:hover:bg-primary/10 bg-background/80 backdrop-blur-sm"
                                asChild
                              >
                                <Link href="#contact" className="py-2.5" scroll={false}>
                                  <FileText className="h-4 w-4" />
                                  Falar com o time
                                </Link>
                              </Button>
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-center mt-8">
                <CarouselPrevious 
                  className="static mx-2 bg-background/50 border border-border
                    hover:bg-muted text-foreground" 
                />
                <CarouselNext 
                  className="static mx-2 bg-background/50 border border-border
                    hover:bg-muted text-foreground" 
                />
              </div>
            </Carousel>
          </motion.div>

          <motion.div
            className="flex justify-center mt-12"
          >
              <Button
                size="lg"
              className={cn(
                "bg-primary text-primary-foreground rounded-full px-10 py-3 group",
                "hover:bg-primary/90 transition-all duration-300",
                "shadow-lg shadow-primary/30 hover:shadow-primary/50"
              )} 
                asChild
              >
              <Link href="#contact" className="flex items-center" scroll={false}>
                <Calendar className="mr-3 h-5 w-5 transition-transform group-hover:rotate-12" />
                Fale com nossa equipe
              </Link>
              </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}