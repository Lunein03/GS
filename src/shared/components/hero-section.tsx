"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { LogIn, ArrowDown } from "lucide-react";

import { BackgroundNoiseOverlay } from "@/shared/ui/background-snippets-noise-effect11";
import { Button } from "@/shared/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="hero" className="relative pt-24 pb-12 md:pt-32 md:pb-24 overflow-hidden noise-background bg-white dark:bg-[#0B0B0C] transition-colors duration-300">
      {/* Luzes flutuantes */}
      <div className="floating-lights-container">
        <div className="floating-light floating-light-1" />
        <div className="floating-light floating-light-2" />
        <div className="floating-light floating-light-3" />
        <div className="floating-light floating-light-4" />
        <div className="floating-light floating-light-5" />
      </div>

      {/* Background gradient dinâmico - reduzido opacity no dark */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-r animate-gradient-x opacity-100 dark:opacity-20"
        style={{
          backgroundImage: `linear-gradient(90deg, 
            var(--bg-start-color, theme('colors.primary.100')), 
            var(--bg-end-color, theme('colors.secondary.100')), 
            var(--bg-start-color, theme('colors.primary.100'))
          )`,
          backgroundSize: '200% 200%'
        }}
      />
      
      {/* Novo background gradient com a classe CSS - reduzido opacity no dark */}
      <div className="absolute inset-0 hero-gradient-accent opacity-10 dark:opacity-5 z-0" />

      <BackgroundNoiseOverlay
        className="z-[5] opacity-75 dark:opacity-50 mix-blend-soft-light"
        patternAlpha={HERO_NOISE_PATTERN_ALPHA}
      />
      
      {/* Reflexos animados minimalistas - ajustados para dark mode */}
      <motion.div
        className="absolute top-[-5%] left-[15%] w-[25%] h-[40%] bg-blue-500/25 dark:bg-cyan-400/10 rounded-full blur-2xl z-0"
        animate={{ 
          x: [0, 30, 10, 0],
          y: [0, -20, 10, 0],
          opacity: [0, 0.7, 0.5, 0]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut", 
          times: [0, 0.3, 0.7, 1] 
        }}
      />
      
      {/* Reflexo 2 - inferior direito */}
      <motion.div
        className="absolute bottom-[5%] right-[20%] w-[30%] h-[35%] bg-purple-600/20 dark:bg-violet-500/8 rounded-full blur-3xl z-0"
        animate={{ 
          x: [0, -40, -20, 0],
          y: [0, 20, -10, 0], 
          opacity: [0, 0.5, 0.6, 0]
        }}
        transition={{ 
          duration: 18, 
          repeat: Infinity, 
          ease: "easeInOut", 
          delay: 2,
          times: [0, 0.4, 0.7, 1]
        }}
      />
      
      {/* Reflexo 3 - centro */}
      <motion.div
        className="absolute top-[40%] left-[40%] w-[15%] h-[15%] bg-blue-600/15 dark:bg-cyan-200/8 rounded-full blur-xl z-0"
        animate={{ 
          scale: [0.8, 1.2, 1, 0.8],
          opacity: [0, 0.3, 0.4, 0]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "easeInOut", 
          delay: 5,
          times: [0, 0.4, 0.6, 1]
        }}
      />
      
      {/* Reflexo 4 - superior direito */}
      <motion.div
        className="absolute top-[10%] right-[10%] w-[20%] h-[25%] bg-purple-500/20 dark:bg-teal-400/8 rounded-full blur-2xl z-0"
        animate={{ 
          x: [30, 0, -20, -50],
          y: [0, 10, 30, 0], 
          opacity: [0, 0.6, 0.4, 0]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "easeInOut", 
          delay: 8,
          times: [0, 0.3, 0.6, 1]
        }}
      />
      
      {/* Reflexo 5 - inferior esquerdo */}
      <motion.div
        className="absolute bottom-[15%] left-[5%] w-[18%] h-[30%] bg-blue-400/20 dark:bg-pink-400/8 rounded-full blur-2xl z-0"
        animate={{ 
          x: [-20, 0, 30, 0], 
          opacity: [0, 0.4, 0.5, 0]
        }}
        transition={{ 
          duration: 16, 
          repeat: Infinity, 
          ease: "easeInOut", 
          delay: 12,
          times: [0, 0.3, 0.7, 1]
        }}
      />
      
      {/* Circle decorations - mais sutis no dark */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-secondary/10 dark:bg-secondary/5 rounded-full blur-3xl z-0" />

      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-3/5 pr-0 lg:pr-8 mb-8 lg:mb-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full flex flex-col justify-center"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold mb-8 leading-[1.1] tracking-[-0.02em] text-center text-foreground font-inter">
                <span className="font-inter">Intranet </span>
                <span className="font-inter">GS Produções</span>
              </h1>
              <p className="text-lg md:text-xl mb-6 text-foreground leading-[1.6] font-inter text-justify">
              Bem-vindo à intranet da GS Produções. Desde 2019, atuamos com produção e acessibilidade em diversas frentes, transformando ideias em experiências inclusivas para todas as pessoas, promovendo participação, pertencimento e equidade.
              </p>
              <p className="text-lg md:text-xl mb-8 text-foreground leading-[1.6] font-inter text-justify">
              Este é o nosso espaço interno de trabalho — aqui você acessa os módulos, formulários e ferramentas do dia a dia da equipe. Faça login para começar.
              </p>
              {/* CTA Button */}
              {!isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="flex justify-center lg:justify-start"
                >
                  {isAuthenticated ? (
                    <Button asChild size="lg" className="group">
                      <a href="#modules">
                        Ver módulos
                        <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
                      </a>
                    </Button>
                  ) : (
                    <Button asChild size="lg" className="group">
                      <Link href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Acessar Plataforma
                      </Link>
                    </Button>
                  )}
                </motion.div>
              )}            </motion.div>
          </div>
          
          <div className="w-full lg:w-3/5 lg:ml-16">
            {/* Logo da empresa */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative flex items-center justify-center p-8 overflow-hidden transition-all duration-700 ease-in-out"
            >
              {/* Logo para tema claro e escuro */}
              <Image 
                src="/images/gs-logo.svg" 
                alt="GS Produção Logo" 
                width={400} 
                height={200} 
                className="object-contain w-full h-auto block dark:hidden" 
                priority
              />
              <Image 
                src="/images/gs-logo-2.svg" 
                alt="GS Produção Logo" 
                width={400} 
                height={200} 
                className="object-contain w-full h-auto hidden dark:block" 
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

const HERO_NOISE_PATTERN_ALPHA = 28;
