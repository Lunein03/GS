'use client';

import { useRef, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { cn } from '@/shared/lib/utils';

type Brand = {
  name: string;
  logo: string;
  width: number;
  height: number;
};

function BrandCarousel({ brands }: { brands: Brand[] }) {
  const [isMobile, setIsMobile] = useState(false);
  
  const autoplayOptions = {
    delay: 3000,
    stopOnInteraction: false,
  };

  // Configurações responsivas para o carrossel
  const carouselOptions = {
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    // Configura o número de slides visíveis com base no tamanho da tela
    slidesToShow: isMobile ? 1 : 'auto'
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      slidesToScroll: 1
    }
  );

  // Detecta se está em dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Verificar na montagem inicial
    checkMobile();
    
    // Adicionar listener para mudanças de tamanho da tela
    window.addEventListener('resize', checkMobile);
    
    // Limpar listener
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Configuração para autoplay sem usar o plugin
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      if (emblaApi) {
        emblaApi.scrollNext();
      }
    }, autoplayOptions.delay);

    return () => clearInterval(interval);
  }, [emblaApi, autoplayOptions.delay]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {brands.map((brand) => (
          <div 
            key={brand.name} 
            className={cn(
              "flex-none px-4",
              isMobile ? "min-w-full" : "min-w-[200px]"
            )}
          >
            <div className="h-20 flex items-center justify-center">
              <Image
                src={brand.logo}
                alt={`Logo ${brand.name}`}
                width={brand.width}
                height={brand.height}
                className={cn(
                  "object-contain opacity-80 hover:opacity-100 transition-opacity",
                  // Configuração específica para o Rock in Rio
                  brand.name === "rockinrio" 
                    ? "brightness-0 dark:invert" // Preto no modo claro, branco no modo escuro
                    : "dark:brightness-0 dark:invert" // Cores normais no modo claro, invertidas no escuro para as outras logos
                )}
                loading="lazy"
                quality={90}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BrandCarousel; 
