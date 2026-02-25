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

      <div className="flex flex-wrap gap-2 pl-1">
        {LOGO_PRESET_OPTIONS.map((logo) => {
          const isSelected = selectedValue === logo.selectValue;
          return (
            <button
              key={logo.id}
              type="button"
              onClick={() => onLogoChange(mapSelectValueToLogoUrl(logo.selectValue))}
              className={cn(
                "group flex items-center justify-center rounded-md p-0.5 transition-all outline-none",
                "focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                isSelected
                  ? "ring-2 ring-primary bg-primary/10"
                  : "ring-1 ring-border/50 hover:ring-border hover:bg-muted/40"
              )}
              aria-pressed={isSelected}
              title={logo.label}
            >
              <LogoThumb src={logo.previewSrc} alt={logo.label} sizeClass="h-10 w-10" />
            </button>
          );
        })}
      </div>


    </div>
  );
}
