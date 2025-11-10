import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { load } from "cheerio";
import type { Element as CheerioElement } from "domhandler";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) {
    return "";
  }

  const $ = load(input);

  $("script, style").remove();

  $("*").each((_, element) => {
    const el = element as CheerioElement;
    const attribs = el.attribs ?? {};
    Object.keys(attribs).forEach((attribute) => {
      if (attribute.toLowerCase().startsWith("on")) {
        $(element).removeAttr(attribute);
      }
    });
  });

  $("[style]").removeAttr("style");

  const sanitized = $("body").html()?.trim();
  if (!sanitized) {
    return "";
  }

  return sanitized;
}

/**
 * Generates a UUID v4 string that works in both browser and Node.js environments
 */
export function generateId(): string {
  // Try to use native crypto.randomUUID if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fall through to manual implementation
    }
  }

  // Fallback to manual UUID v4 generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}