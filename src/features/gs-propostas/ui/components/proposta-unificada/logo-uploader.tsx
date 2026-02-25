"use client";

import { Label } from "@/shared/ui/label";
import { cn } from "@/shared/lib/utils";
import {
  LOGO_PRESET_OPTIONS,
  getLogoSelectValue,
  mapSelectValueToLogoUrl,
} from "./logo-presets";

interface LogoUploaderProps {
  currentLogoUrl?: string;
  onLogoChange: (url: string | undefined) => void;
}

function LogoThumb({ src, alt, sizeClass }: { src: string; alt: string; sizeClass?: string }) {
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-sm bg-zinc-900/90 ring-1 ring-white/10",
        sizeClass ?? "h-5 w-5"
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-contain p-1" />
    </span>
  );
}

export function LogoUploader({ currentLogoUrl, onLogoChange }: LogoUploaderProps) {
  const selectedValue = getLogoSelectValue(currentLogoUrl);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <Label className="text-sm font-medium">Logo do Documento</Label>
      </div>

      <div className="grid grid-cols-3 gap-3 pl-1 max-w-sm">
        {LOGO_PRESET_OPTIONS.map((logo) => {
          const isSelected = selectedValue === logo.selectValue;
          return (
            <button
              key={logo.id}
              type="button"
              onClick={() => onLogoChange(mapSelectValueToLogoUrl(logo.selectValue))}
              className={cn(
                "group aspect-square rounded-lg border bg-muted/20 p-2 text-left transition-colors",
                "hover:border-primary/60 hover:bg-muted/40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                isSelected
                  ? "border-primary ring-1 ring-primary/40 bg-primary/10"
                  : "border-white/10"
              )}
              aria-pressed={isSelected}
              title={logo.label}
            >
              <div className="flex h-full flex-col items-center justify-center gap-2">
                <LogoThumb src={logo.previewSrc} alt={logo.label} sizeClass="h-10 w-10" />
                <span className="text-[11px] font-medium text-center leading-tight">
                  {logo.label.replace(" (Imagem PNG)", "").replace(" (SVG)", "")}
                </span>
              </div>
            </button>
          );
        })}
      </div>


    </div>
  );
}
