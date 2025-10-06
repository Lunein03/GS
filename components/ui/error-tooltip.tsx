import * as React from "react";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorTooltipProps {
  show: boolean;
  message: string;
}

export function ErrorTooltip({ show, message }: ErrorTooltipProps) {
  if (!show) return null;
  return (
    <div
      className={cn(
        "absolute left-0 top-full z-20 mt-2 min-w-[180px] max-w-xs flex items-start gap-2 rounded-md border border-red-300 bg-white shadow-lg px-3 py-2 text-xs text-red-600 animate-fade-in",
        "before:absolute before:-top-2 before:left-4 before:w-3 before:h-3 before:bg-white before:border-l before:border-t before:border-red-300 before:rotate-45 before:content-['']"
      )}
      role="alert"
      aria-live="assertive"
      tabIndex={0}
      style={{ animationDuration: '120ms' }}
    >
      <HelpCircle className="w-4 h-4 text-red-500 mt-0.5" aria-hidden />
      <span>{message}</span>
    </div>
  );
}

// Tailwind animation
// Add in your global CSS if not present:
// @keyframes fade-in { from { opacity: 0; transform: translateY(-4px);} to { opacity: 1; transform: none; } }
// .animate-fade-in { animation: fade-in 120ms cubic-bezier(0.4,0,0.2,1); } 