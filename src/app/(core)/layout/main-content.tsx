"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { isHiddenLayoutRoute } from "./route-config";

export function MainContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className={cn("flex-1 flex flex-col min-h-0 overflow-hidden", !isHiddenLayoutRoute(pathname) && "pt-16")}>
      {children}
    </main>
  );
}
