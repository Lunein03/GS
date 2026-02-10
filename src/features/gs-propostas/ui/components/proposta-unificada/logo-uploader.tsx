
"use client";

import { useState, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/ui/select";
import { Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/shared/lib/supabase-client";
import { cn } from "@/shared/lib/utils";

interface LogoUploaderProps {
  currentLogoUrl?: string;
  currentPosition?: 'left' | 'right';
  onLogoChange: (url: string | undefined) => void;
  onPositionChange: (position: 'left' | 'right') => void;
  proposalId?: string;
}

export function LogoUploader({
  currentLogoUrl,
  currentPosition = 'left',
  onLogoChange,
  onPositionChange,
  proposalId,
}: LogoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida (PNG, JPG, etc).');
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${proposalId || 'temp'}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('proposal-logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('proposal-logos')
        .getPublicUrl(filePath);

      onLogoChange(publicUrl);
      toast.success('Logo enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro no upload da logo:', error);
      toast.error(`Falha ao enviar logo: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onLogoChange(undefined);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Logo do Documento</Label>
      </div>

      <div className="flex gap-4 items-center">
        {/* Preview Area */}
        <div 
          className={cn(
            "relative w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 transition-all group",
            currentLogoUrl 
              ? "border-primary/50 bg-background" 
              : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
          )}
          onClick={() => {
            // Se não tem logo, clica no input. Se tem logo, só clica se não for no botão remover (que é tratado separadamente)
            if (!currentLogoUrl) fileInputRef.current?.click();
          }}
          title={currentLogoUrl ? "Logo atual" : "Clique para fazer upload"}
        >
          {currentLogoUrl ? (
            <>
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentLogoUrl} 
                alt="Logo Preview" 
                className="w-full h-full object-contain p-1 cursor-pointer"
                onClick={() => fileInputRef.current?.click()} // Permite trocar clicando na imagem
              />
              
              {/* Overlay Remove Button */}
              <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button
                  variant="destructive"
                  size="icon"
                  className="h-5 w-5 rounded-full shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  title="Remover logo"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground pointer-events-none">
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Upload className="w-5 h-5 opacity-50" />
                  <span className="text-[9px] uppercase font-semibold">Upload</span>
                </>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </div>

        {/* Controls - Side by Side */}
        <div className="flex-1 flex flex-col gap-2 max-w-sm">
           <div className="space-y-1">
             <Label className="text-xs text-muted-foreground">Posição</Label>
             <Select 
               value={currentPosition} 
               onValueChange={(v) => onPositionChange(v as 'left' | 'right')}
             >
               <SelectTrigger className="h-8 text-xs bg-muted/30 w-full">
                 <SelectValue placeholder="Selecione" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="left">Esquerda (Padrão)</SelectItem>
                 <SelectItem value="right">Direita</SelectItem>
               </SelectContent>
             </Select>
           </div>
          
          <div className="text-[10px] text-muted-foreground/70 flex gap-3">
            <span>PNG, JPG</span>
            <span>•</span>
            <span>Máx: 2MB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
