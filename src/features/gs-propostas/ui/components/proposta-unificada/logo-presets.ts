export type LogoPresetId = "logo-png" | "symbol-svg" | "text-svg";
export type LogoRenderVariant = "symbol" | "text" | "image";

export interface LogoPresetOption {
  id: LogoPresetId;
  label: string;
  helper: string;
  selectValue: string;
  previewSrc: string;
}

const GS_SYMBOL_LOGO_PATH = "/images/gs-logo.svg";
const GS_TEXT_LOGO_PATH = "/images/gs-logo-2.svg";
const GS_IMAGE_LOGO_PATH = "/images/Logo.png";

const LEGACY_EQUIVALENTS = new Map<string, string>([
  ["/images/svg/gs-logo.svg", GS_SYMBOL_LOGO_PATH],
  ["/images/logo.png", GS_IMAGE_LOGO_PATH],
]);

export const LOGO_PRESET_OPTIONS: LogoPresetOption[] = [
  {
    id: "logo-png",
    label: "GS Logo (Imagem PNG)",
    helper: "Versao em imagem",
    selectValue: GS_IMAGE_LOGO_PATH,
    previewSrc: GS_IMAGE_LOGO_PATH,
  },
  {
    id: "symbol-svg",
    label: "GS Simbolo (SVG)",
    helper: "Versao vetorial",
    selectValue: GS_SYMBOL_LOGO_PATH,
    previewSrc: GS_SYMBOL_LOGO_PATH,
  },
  {
    id: "text-svg",
    label: "GS Texto (SVG)",
    helper: "Versao alternativa",
    selectValue: GS_TEXT_LOGO_PATH,
    previewSrc: GS_TEXT_LOGO_PATH,
  },
];

const isAbsoluteHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);

const toCanonicalLogoPath = (logoUrl?: string): string | undefined => {
  if (!logoUrl) return undefined;

  const trimmed = logoUrl.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("data:")) return trimmed;

  if (isAbsoluteHttpUrl(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const canonicalPath = toCanonicalLogoPath(parsed.pathname);
      return canonicalPath ?? trimmed;
    } catch {
      return trimmed;
    }
  }

  const normalized = trimmed.toLowerCase();
  if (LEGACY_EQUIVALENTS.has(normalized)) {
    return LEGACY_EQUIVALENTS.get(normalized);
  }
  if (normalized === GS_SYMBOL_LOGO_PATH.toLowerCase()) return GS_SYMBOL_LOGO_PATH;
  if (normalized === GS_TEXT_LOGO_PATH.toLowerCase()) return GS_TEXT_LOGO_PATH;
  if (normalized === GS_IMAGE_LOGO_PATH.toLowerCase()) return GS_IMAGE_LOGO_PATH;

  return trimmed;
};

export interface ResolvedLogoRender {
  variant: LogoRenderVariant;
  src?: string;
}

export function getLogoSelectValue(logoUrl?: string): string {
  const canonical = toCanonicalLogoPath(logoUrl);
  if (!canonical) return GS_SYMBOL_LOGO_PATH;

  const isKnownPreset = LOGO_PRESET_OPTIONS.some((option) => option.selectValue === canonical);
  return isKnownPreset ? canonical : GS_SYMBOL_LOGO_PATH;
}

export function getLogoPresetOption(logoUrl?: string): LogoPresetOption {
  const selectedValue = getLogoSelectValue(logoUrl);
  return (
    LOGO_PRESET_OPTIONS.find((option) => option.selectValue === selectedValue) ??
    LOGO_PRESET_OPTIONS[0]
  );
}

export function mapSelectValueToLogoUrl(selectValue: string): string | undefined {
  return selectValue || GS_SYMBOL_LOGO_PATH;
}

export function resolveLogoRender(logoUrl?: string): ResolvedLogoRender {
  const canonical = toCanonicalLogoPath(logoUrl);
  if (!canonical) return { variant: "symbol" };
  if (canonical === GS_SYMBOL_LOGO_PATH) return { variant: "symbol" };
  if (canonical === GS_TEXT_LOGO_PATH) return { variant: "text" };
  return { variant: "image", src: canonical };
}

export function resolveLogoImageSource(src: string): string {
  if (!src) return src;
  if (src.startsWith("data:") || isAbsoluteHttpUrl(src)) return src;
  if (!src.startsWith("/")) return src;

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${src}`;
  }

  // Fallback for contexts where window is unavailable (e.g. PDF generation worker/node).
  const publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${publicSiteUrl}${src}`;
}
