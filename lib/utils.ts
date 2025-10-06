import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes usando clsx e tailwind-merge
 * @param inputs Classes a serem combinadas
 * @returns String de classes combinadas
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
