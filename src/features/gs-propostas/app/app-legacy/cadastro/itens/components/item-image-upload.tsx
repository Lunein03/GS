'use client'

import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Progress } from '@/shared/ui/progress'
import { cn } from '@/shared/lib/utils'

interface ItemImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  maxSizeInMB?: number
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export function ItemImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeInMB = 5,
}: ItemImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024

  const validateFile = (file: File): string | null => {
    // Validar tipo de arquivo
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return `Formato inválido. Apenas JPG, PNG e WebP são aceitos.`
    }

    // Validar tamanho
    if (file.size > maxSizeInBytes) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB.`
    }

    return null
  }

  const convertFileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const processFiles = async (files: FileList | File[]) => {
    setError(null)

    const fileArray = Array.from(files)
    const remainingSlots = maxImages - images.length

    // Validar quantidade
    if (fileArray.length > remainingSlots) {
      setError(`Você pode adicionar no máximo ${remainingSlots} imagem(ns). Limite: ${maxImages} imagens por item.`)
      return
    }

    // Validar cada arquivo
    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    // Processar arquivos
    try {
      setUploading(true)
      setUploadProgress(0)

      const newImageUrls: string[] = []

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        
        // Simular progresso de upload
        setUploadProgress(((i + 1) / fileArray.length) * 100)
        
        // Converter para data URL
        const dataUrl = await convertFileToDataURL(file)
        newImageUrls.push(dataUrl)
        
        // Pequeno delay para simular upload
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      onImagesChange([...images, ...newImageUrls])
      setUploadProgress(100)
      
      // Reset após sucesso
      setTimeout(() => {
        setUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (err) {
      setError('Erro ao processar imagens. Tente novamente.')
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
    setError(null)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const canAddMore = images.length < maxImages

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      {canAddMore && (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-8 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            uploading && 'pointer-events-none opacity-50'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Selecionar imagens"
          />

          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                Arraste e solte suas imagens aqui
              </p>
              <p className="text-xs text-muted-foreground">
                ou clique para selecionar arquivos
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBrowseClick}
              disabled={uploading}
            >
              Selecionar Arquivos
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Formatos aceitos: JPG, PNG, WebP</p>
              <p>Tamanho máximo: {maxSizeInMB}MB por imagem</p>
              <p>
                Limite: {images.length}/{maxImages} imagens
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Processando imagens...</span>
            <span className="font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Mensagem de Erro */}
      {error && (
        <div
          className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Grid de Previews */}
      {images.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Imagens ({images.length}/{maxImages})
            </p>
            {!canAddMore && (
              <p className="text-xs text-muted-foreground">
                Limite máximo atingido
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="group relative aspect-square rounded-lg border bg-muted overflow-hidden"
              >
                <img
                  src={imageUrl}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Overlay com botão remover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveImage(index)}
                    aria-label={`Remover imagem ${index + 1}`}
                    className="h-10 w-10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Indicador de número */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhuma imagem adicionada</p>
        </div>
      )}
    </div>
  )
}


