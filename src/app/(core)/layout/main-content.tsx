"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

export function MainContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isGsPropostas = pathname?.startsWith("/gs-propostas");
  const isDriveQr = pathname?.startsWith("/drive-qr");
  const isPatrimonio = pathname?.startsWith("/patrimonio");
  const isFullScreenApp = isGsPropostas || isDriveQr || isPatrimonio;

  return (
    <main className={cn("flex-1", !isFullScreenApp && "pt-16")}>
      {children}
    </main>
  );
}
