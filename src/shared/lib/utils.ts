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