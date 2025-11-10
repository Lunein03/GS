"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section id="hero" className="relative py-12 md:py-[72px] lg:py-[112px] overflow-hidden bg-[#FFFFFF] dark:bg-[#000000]">
      {/* 🎨 Light: Branco #FFFFFF | Dark: Preto puro #000000 (Apple style) */}
      {/* Luzes flutuantes sutis */}
      <div className="floating-lights-container">
        <div className="floating-light floating-light-1" />
        <div className="floating-light floating-light-2" />
        <div className="floating-light floating-light-3" />
      </div>

      {/* Reflexos animados minimalistas - usando paleta oficial */}
      <motion.div
        className="absolute top-[-5%] left-[15%] w-[25%] h-[40%] bg-primary/8 dark:bg-primary/12 rounded-full blur-3xl z-0"
        animate={{ 
          x: [0, 30, 10, 0],
          y: [0, -20, 10, 0],
          opacity: [0.3, 0.6, 0.4, 0.3]
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
        className="absolute bottom-[5%] right-[20%] w-[30%] h-[35%] bg-secondary/10 dark:bg-secondary/15 rounded-full blur-3xl z-0"
        animate={{ 
          x: [0, -40, -20, 0],
          y: [0, 20, -10, 0], 
          opacity: [0.2, 0.5, 0.4, 0.2]
        }}
        transition={{ 
          duration: 18, 
          repeat: Infinity, 
          ease: "easeInOut", 
          delay: 2,
          times: [0, 0.4, 0.7, 1]
        }}
      />
      
      {/* Circle decorations sutis */}
      <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl z-0" />

      <div className="container-custom relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full flex flex-col justify-center"
            >
              <h1 className="text-5xl md:text-6xl font-medium mb-8 leading-[1.1] tracking-[-0.02em] text-center lg:text-left text-foreground font-inter">
                Quem somos
              </h1>
              <p className="text-lg leading-[1.6] mb-6 text-foreground font-inter text-justify lg:text-left">
                Desde 2019, atuamos com produção e acessibilidade em diversas frentes, com o objetivo de tornar projetos e espaços verdadeiramente acessíveis, transformando ideias em experiências inclusivas para todas as pessoas, promovendo participação, pertencimento e equidade.
              </p>
              <p className="text-lg leading-[1.6] text-foreground font-inter text-justify lg:text-left">
                Acreditamos que a acessibilidade deve estar presente desde o início de cada projeto, esse é o nosso propósito e a razão da nossa existência, com uma comunicação pensada para todas as pessoas, porque um mundo acessível não é apenas um sonho, é a realidade que estamos construindo.
              </p>
            </motion.div>
          </div>
          
          <div className="w-full lg:w-1/2">
            {/* Logo da empresa */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative flex items-center justify-center p-8"
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
