"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Camera, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function CtaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
  <section id="cta" className="py-16 relative overflow-hidden" ref={ref}>
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 z-0">
        {/* <img
          src="https://images.pexels.com/photos/2034310/pexels-photo-2034310.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260"
          alt="Studio background"
          className="object-cover w-full h-full"
        /> */}
        <div className="absolute inset-0 hero-gradient opacity-90"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prontos para transformar suas ideias em produtos de alta qualidade e acessíveis? 
            </h2>
           

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg"
              >
                <Camera className="h-10 w-10 text-secondary mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2 font-inter">Conheça nosso espaço</h3>
                <p className="text-white/80">
                Explore nossa infraestrutura e soluções que oferecemos para tornar seu projeto acessível e de alta qualidade.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg"
              >
                <Calendar className="h-10 w-10 text-secondary mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2 font-inter">Agende seu atendimento</h3>
                <p className="text-white/80">
                Reserve o suporte e os serviços que você precisa, com flexibilidade para atender sua agenda.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg"
              >
                <Clock className="h-10 w-10 text-secondary mb-4 mx-auto" />
                <h3 className="text-xl font-bold mb-2 font-inter">Sem burocracia</h3>
                <p className="text-white/80">
                Contrate com facilidade, de forma rápida e prática, adaptando os serviços às suas necessidades.
                </p>
              </motion.div>
              
            </div>
            {/* <p className="text-lg mb-8 text-white/90">
              Entre em contato e agende uma conversa para descobrir como tornar seu projeto acessível para todas as pessoas.
            </p> */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link href="#contact" scroll={false}>
                  Fale com a equipe <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}