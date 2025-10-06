"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { PortfolioItem } from "@/components/portfolio-preview";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProjectDetailModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  project: PortfolioItem | null;
}

export function ProjectDetailModal({
  isOpen,
  onOpenChange,
  project,
}: ProjectDetailModalProps) {
  // Hooks SEMPRE antes de qualquer return condicional
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Garante que images sempre existe (mesmo se project for null)
  const images = Array.isArray(project?.image)
    ? [...project.image]
    : project?.image
      ? [project.image]
      : [];

  useEffect(() => {
    if (isOpen && images.length > 1) {
      setCurrentImageIndex(0);
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 3000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen, images.length]);

  if (!project) {
    return null;
  }

  const getCategoryClass = (category: string) => {
    return category === "libras" 
      ? "bg-indigo-600" 
      : category === "audiodescrição" 
        ? "bg-sky-600" 
        : "bg-primary";
  };

  const getCategoryLabel = (category: string) => {
    return category === "libras" 
      ? "LIBRAS" 
      : category === "audiodescrição" 
        ? "Audiodescrição" 
        : "Destaque";
  };

  // Mensagem personalizada para WhatsApp
  const whatsappMessage = encodeURIComponent(
    `Olá! Vi seu portfólio no site e me interessei pelo projeto "${project.title}". Gostaria de fazer um orçamento ou saber mais detalhes.`
  );
  const whatsappLink = `https://api.whatsapp.com/send/?phone=5521968199637&text=${whatsappMessage}`;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 bg-white dark:bg-gray-900 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{project.title}</DialogTitle>
        </DialogHeader>
        <DialogClose asChild>
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="absolute right-4 top-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 shadow-lg backdrop-blur-md border border-gray-200 dark:border-gray-800 transition-all duration-200 group"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors duration-200" />
            <span className="sr-only">Fechar</span>
            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/80 text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">Fechar</span>
          </motion.button>
        </DialogClose>
        
        <div className="flex flex-col">
          <div className="relative aspect-video w-full overflow-hidden">
            {project.title === "Peck Produções" ? (
              <video
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
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
                <source src="https://video-gsproducao.s3.sa-east-1.amazonaws.com/Pack.mp4" type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            ) : project.title === "Comercial Inclusivo Mercado Livre" ? (
              <video
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
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
                <source src="https://video-gsproducao.s3.sa-east-1.amazonaws.com/mercado-livre.mp4" type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            ) : project.title === "Rock in Rio e The Town" ? (
              <video
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
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
                <source src="https://video-gsproducao.s3.sa-east-1.amazonaws.com/Rockinrio.mp4" type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            ) : project.title === "Fiocruz" ? (
              <video
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
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
                <source src="https://video-gsproducao.s3.sa-east-1.amazonaws.com/Fiocruz-1.mp4" type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            ) : project.title === "Museu de Arte do Rio" ? (
              <video
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
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
                <source src="https://video-gsproducao.s3.sa-east-1.amazonaws.com/mar.mp4" type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            ) : project.title === "VTEX DAY" ? (
              <video
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
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
                <source src="https://video-gsproducao.s3.sa-east-1.amazonaws.com/vtexday.mp4" type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            ) : (
              <AnimatePresence initial={false} mode="sync">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                >
                  {images.length > 0 && (
                    <Image
                      src={images[currentImageIndex]}
                      alt={`${project.title} - Imagem ${currentImageIndex + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Overlay gradiente para o título */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"></div>

            {/* Remove controles e indicadores do carrossel apenas para modais especiais */}
            {project.title !== "Peck Produções" && project.title !== "Comercial Inclusivo Mercado Livre" && project.title !== "Rock in Rio e The Town" && project.title !== "Fiocruz" && project.title !== "Museu de Arte do Rio" && project.title !== "VTEX DAY" && images.length > 1 && (
              <>
                {/* Botões de navegação */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors duration-200 backdrop-blur-sm"
                  aria-label="Imagem anterior"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(prev => (prev + 1) % images.length);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors duration-200 backdrop-blur-sm"
                  aria-label="Próxima imagem"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                        currentImageIndex === index 
                          ? "bg-white scale-125 shadow-sm" 
                          : "bg-white/60 hover:bg-white/90"
                      }`}
                      aria-label={`Ir para imagem ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Conteúdo do modal */}
          <div className="p-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="text-2xl md:text-3xl font-neoverse-bold font-bold tracking-tight text-gradient drop-shadow-lg mb-4"
            >
              {project.title}
            </motion.h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.categories.map((category) => (
                <Badge 
                  key={category} 
                  className={`${getCategoryClass(category)} hover:${getCategoryClass(category)} text-white`}
                >
                  {getCategoryLabel(category)}
                </Badge>
              ))}
            </div>
            <h4 className="font-neoverse-bold font-bold tracking-tight text-lg mb-3 text-gray-800 dark:text-gray-200">Sobre o projeto</h4>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
              {project.description}
            </p>
            <div className="flex justify-center">
              <Button 
                className="mt-2 rounded-full px-6 py-2 gap-2 bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all"
                asChild
              >
                <Link 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Entre em contato <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 