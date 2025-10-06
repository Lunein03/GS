import { useState, useEffect } from 'react';

/**
 * Hook para precarregar imagens com feedback de progresso
 * @param imageUrls Array de URLs das imagens para precarregar
 * @returns Objeto com status de carregamento e progresso
 */
export function useImagePreloader(imageUrls: string[]) {
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Pula se não há imagens para precarregar
    if (!imageUrls.length) {
      setImagesPreloaded(true);
      return;
    }

    let loadedImagesCount = 0;
    const totalImages = imageUrls.length;
    
    // Função para atualizar o progresso
    const updateProgress = () => {
      loadedImagesCount += 1;
      const percentComplete = Math.round((loadedImagesCount / totalImages) * 100);
      setProgress(percentComplete);
      
      if (loadedImagesCount === totalImages) {
        setImagesPreloaded(true);
      }
    };

    // Precarrega as imagens
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
      img.onload = updateProgress;
      img.onerror = updateProgress; // Considera como carregado mesmo em caso de erro
    });

    // Limpar em caso de desmontagem do componente
    return () => {
      // Não precisamos limpar nada, mas o ESLint espera um retorno
    };
  }, [imageUrls]);

  return { imagesPreloaded, progress };
} 