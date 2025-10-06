"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { ProjectDetailModal } from "./project-detail-modal";

export interface PortfolioItem {
  id: number;
  title: string;
  categories: ('libras' | 'audiodescrição')[];
  image: string | string[];
  description: string;
  client: string;
  year: string;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: "Rock in Rio e The Town",
    categories: ["libras"], // Adicionando audiodescrição conforme imagem do modal
    image: [
      "images/assets/Rock-in-Rio.png",
      "/images/assets/the-town-1.png",
      "/images/assets/the-town-2.png",
      "/images/assets/the-town-3.png"
    ],
    description: "Nossa participação no Rock in Rio 2019 e 2022 contou com mais de 80 shows traduzidos nos palcos principais: Palco Mundo e Palco Sunset. Nossa equipe é composta por pessoas surdas e ouvintes. Um trabalho que vai além da tradução: é a inclusão na prática, valorizando o protagonismo das pessoas com deficiência. Também marcamos presença na primeira edição do The Town, contribuindo para uma experiência musical inesquecível e acessível, reafirmando nosso compromisso em tornar cada espaço acessível para que todas as pessoas se sintam pertencentes.",
    client: "Rock in Rio & The Town", // Mantido, mas pode ser mais específico se houver um cliente direto para o serviço de acessibilidade
    year: "2022"
  },
  {
    id: 2,
    title: "Peck Produções",
    categories: ["libras", "audiodescrição"],
    image: [
      "/images/assets/peck.png",
      "/images/assets/peck-.png",
    ],
    description: "Realizamos todos os festivais promovidos pela Peck Produções, com tradução em Libras e audiodescrição para os eventos. Participamos dos Festivais de Inverno, Vivo na Praia, Clássicos do Brasil, Anos 90 Festival, Prio Blues e Jazz, levando acessibilidade e marcando o público com o nosso show de inclusão. Um trabalho que transforma experiências e torna a inclusão realidade.",
    client: "Peck Produções / PRIO",
    year: "2024"
  },
  {
    id: 3,
    title: "Comercial Inclusivo Mercado Livre",
    categories: ["libras"],
    image: [
      "/images/assets/mercado-livre.png",
      "/images/assets/mercado-livre-1.png",
      "/images/assets/mercado-livre-2.png"
    ],
    description: "Participação na produção do comercial do Mercado Livre exibido no programa Avisa Lá Que Eu Vou, com atuação no roteiro, enquadramento para melhor visualização da pessoa surda, atuação, tradução e apoio na edição. Estivemos presentes em todas as etapas, garantindo um resultado acessível e de alta qualidade.",
    client: "Mercado Livre",
    year: "2024"
  },
  {
    id: 4,
    title: "Fiocruz",
    categories: ["libras", "audiodescrição"],
    image: [
      "/images/assets/fiocruz.png",
      "https://video-gsproducao.s3.sa-east-1.amazonaws.com/Castelo-da-Fiocruz.png",
      "/images/assets/fiocruz-2.png"
    ],
    description: "Atuamos na Instituição desde 2018, contribuindo com nossos serviços de tradução em Libras, inglês e espanhol, e audiodescrição.Também participamos no processo de pós-produção para acessibilizar os conteúdos audiovisuais do instituto. Isso demonstra a seriedade e comprometimento dos nossos serviços, e confiança que temos de quem trabalha conosco.",
    client: "Fiocruz",
    year: "2023"
  },
  {
    id: 5,
    title: "VTEX DAY",
    categories: ["libras"],
    image: [
      "/images/assets/vtex-day-1.jpg",
      "/images/assets/vtex-day-2.jpg",
      "/images/assets/vtex-day.png"
    ],
    description: "Com tradução para Libras de mais de 200 palestras no VTEX Day 2024, marcamos presença em um dos maiores eventos de inovação e negócios da América Latina. Traduzimos conteúdos de alto impacto, como a palestra da ativista e Nobel da Paz Malala Yousafzai, reafirmando nosso compromisso com a acessibilidade e a inclusão em grandes eventos.",
    client: "VTEX", // Cliente original era "Inovação Tech", ajustado para VTEX
    year: "2023"
  },
  {
    id: 6,
    title: "Museu de Arte do Rio",
    categories: ["libras"],
    image: [
      "/images/assets/mar.png",
      "/images/assets/mar-2.webp",
    ],
    description: "Elaboramos junto com o museu a criação de um guia acessível mediado por pessoas surdas na Exposição Funk: um grito de ousadia e liberdade. Estivemos à frente de cada etapa desse processo, atuando na roteirização, produção,e edição. Além disso, o material está disponível no site do museu, que viabiliza os produtos de forma acessível.",
    client: "Game XP / Rock World", // Cliente original era "SoftSolutions", ajustado
    year: "2022"
  },
  // {
  //   id: 7,
  //   title: "Game XP",
  //   categories: ["libras"],
  //   image: [
  //     "/images/assets/gxp.webp",
  //     "/images/assets/gxp-2.jpg",
  //     "/images/assets/gxp-3.jpg"
  //   ],
  //   description: "Estivemos presentes na Game XP, levando acessibilidade para o universo gamer com tradução em Libras. Foram elaborados sinais específicos para personagens e jogos, promovendo uma experiência inclusiva, conectada e culturalmente significativa para o público surdo. Inclusão também é jogar junto!",
  //   client: "Game XP / Rock World", // Cliente original era "SoftSolutions", ajustado
  //   year: "2022"
  // }
];

const categoryInfo = {
  libras: {
    title: "LIBRAS",
    description: "Tradução e interpretação para a Língua Brasileira de Sinais",
    color: "bg-indigo-600"
  },
  audiodescrição: {
    title: "Audiodescrição",
    description: "Serviços de audiodescrição para tornar o conteúdo acessível",
    color: "bg-sky-600"
  }
};

function CategoryBadges({ categories }: { categories: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const categoryClass = 
          category === "libras" ? "bg-indigo-600" :
          category === "audiodescrição" ? "bg-sky-600" : "bg-primary";

        const categoryLabel = 
          category === "libras" ? "LIBRAS" :
          category === "audiodescrição" ? "Audiodescrição" : "Destaque";

        return (
          <span 
            key={category} 
            className={`px-3 py-1 text-xs font-medium text-white rounded-full ${categoryClass}`}
          >
            {categoryLabel}
          </span>
        );
      })}
    </div>
  );
}

function PortfolioCard({ 
  item,
  onClick 
}: { 
  item: PortfolioItem;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, amount: 0.3 });

  // Detectar se é dispositivo móvel
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

  let images: string[];
  if (Array.isArray(item.image) && item.image.length > 0) {
    images = [...item.image];
    while (images.length < 2 && images.length > 0) {
      images.push(images[0]);
    }
    if (images.length === 0) {
      images = [
        "https://via.placeholder.com/500x281.png?text=Imagem+1",
        "https://via.placeholder.com/500x281.png?text=Imagem+2"
      ];
    }
  } else if (typeof item.image === 'string') {
    images = [item.image, item.image];
  } else {
    images = [
      "https://via.placeholder.com/500x281.png?text=Imagem+1",
      "https://via.placeholder.com/500x281.png?text=Imagem+2"
    ];
  }

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Eventos de toque para dispositivos móveis
  const handleTouchStart = () => {
    if (isMobile) {
      setIsHovered(true);
    }
  };

  const handleTouchEnd = () => {
    if (isMobile) {
      // Mantém o estado por um curto período e depois volta ao normal
      setTimeout(() => {
        setIsHovered(false);
      }, 1500); // 1.5 segundos de visualização da segunda imagem
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="group relative rounded-xl overflow-hidden shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10 transition-all duration-300 cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      <div className="aspect-[16/9] overflow-hidden relative">
        {images.slice(0, 2).map((src, i) => (
          <link 
            key={`preload-${i}`} 
            rel="preload" 
            as="image" 
            href={src} 
            className="hidden" 
          />
        ))}
        
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={isHovered ? "second" : "first"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={isHovered ? images[1] : images[0]}
              alt={`${item.title} - ${isHovered ? "Imagem destaque" : "Imagem principal"}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={true}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Indicador visual para mobile */}
        {isMobile && (
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-10">
            <div className="bg-black/40 text-white px-3 py-1 rounded-t-md text-xs font-medium mb-2 transition-opacity duration-300">
              Clique para ver mais
            </div>
          </div>
        )}
        
        <div className="absolute top-4 right-4 z-20">
          <CategoryBadges categories={item.categories} />
        </div>
      </div>
      
      <div className="p-6 bg-white dark:bg-gray-900">
        <h3 className="font-neoverse-bold font-bold tracking-tight text-xl mb-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-0 line-clamp-2">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

export function PortfolioPreview() {
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const handleOpenModal = (project: PortfolioItem) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedProject(null);
    }, 300);
  };

  const cardAnimationVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.07,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    exit: {
      opacity: 0,
      y: -25,
      transition: {
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900" ref={sectionRef} id="portfolio">
      <div className="container px-4 mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            {/* <Badge 
              variant="outline" 
              className="border-primary/20 text-primary px-4 py-1.5 text-sm font-medium mb-5"
            >
              Portfólio
            </Badge> */}
          </motion.div>
          
          <motion.h2 
            className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Nossos <span className="text-primary">Trabalhos</span>
          </motion.h2>
      
          <motion.p 
            className="text-muted-foreground max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Nosso time reúne tradutores, intérpretes de Libras, audiodescritores e especialistas em edição e pós-produção para entregar conteúdo acessível, completo e com acabamento profissional.
          </motion.p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.07
              }
            }
          }}
        >
          <AnimatePresence>
            {portfolioItems.map((item, index) => (
              <motion.div 
                key={item.id} 
                layout
                custom={index}
                variants={cardAnimationVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <PortfolioCard item={item} onClick={() => handleOpenModal(item)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          className="flex justify-center mt-12 md:mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button 
            asChild 
            size="lg" 
            className="rounded-full px-8 gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Link 
              href="https://api.whatsapp.com/send/?phone=5521968199637&text=Ol%C3%A1!%20Vi%20o%20portf%C3%B3lio%20no%20site%20e%20gostaria%20de%20saber%20mais%20sobre%20seus%20servi%C3%A7os."
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale conosco <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

      </div>
      <ProjectDetailModal 
        isOpen={isModalOpen} 
        onOpenChange={setIsModalOpen}
        project={selectedProject} 
      />
    </section>
  );
}