"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import BrandCarousel from "./brand-carousel";

type Brand = {
  name: string;
  logo: string;
  width: number;
  height: number;
};

function TrustedBySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Logos das marcas com informações para acessibilidade e dimensões
  const brands: Brand[] = [
    {
      name: "Mercado Livre",
      logo: "/images/logos/mercado-livre.svg",
      width: 160,
      height: 20,
    },
    {
      name: "Oi futuro",
      logo: "https://video-gsproducao.s3.sa-east-1.amazonaws.com/Oi-futuro.png",
      width: 180,
      height: 20,
    },
    {
      name: "Thetown",
      logo: "/images/logos/Thetown.png",
      width: 160,
      height: 80,
    },
    {
      name: "rockinrio",
      logo: "/images/logos/rockinrio.svg",
      width: 160,
      height: 80,
    },
    {
      name: "Fiocruz",
      logo: "/images/logos/fiocruz.svg",
      width: 160,
      height: 80,
    },
    {
      name: "CCBB",
      logo: "/images/logos/ccbb.svg",
      width: 160,
      height: 80,
    },
    {
      name: "Teatro_Prio",
      logo: "/images/logos/logo-prio.png",
      width: 160,
      height: 80,
    },
    {
      name: "Globo",  
      logo: "/images/logos/rede-globo-logo.svg",
      width: 60,
      height: 60,
    },
    {
      name: "Disney",
      logo: "/images/logos/Disney+_logo.svg",
      width: 110,
      height: 80,
    },
    {
      name: "Peck Produçoes",
      logo: "/images/logos/peck.svg",
      width: 160,
      height: 80,
    },
  ];

  return (
    <section
      className="section-padding bg-background"
      aria-labelledby="trusted-brands-heading"
      role="region"
      aria-roledescription="trusted brands"
      ref={ref}
    >
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 id="trusted-brands-heading" className="text-3xl font-bold mb-4">
            Nossos parceiros
          </h2>
          <p className="text-muted-foreground">
          Empresas que confiam em nossos serviços e que nos ajudam a promover a inclusão.
          </p>
        </div>

        <motion.div 
          className="relative w-full" 
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <BrandCarousel brands={brands} />
        </motion.div>
      </div>
    </section>
  );
}

export { TrustedBySection };