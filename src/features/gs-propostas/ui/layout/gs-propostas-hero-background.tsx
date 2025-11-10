"use client";

import { WavyBackground } from "@/components/ui/wavy-background";
import { useWavyTheme } from "../hooks/use-wavy-theme";

interface HeroBackgroundProps {
  children: React.ReactNode;
}

export function GsPropostasHeroBackground({ children }: HeroBackgroundProps) {
  const wavyTheme = useWavyTheme();

  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none ml-[3.05rem]">
        <WavyBackground
          colors={wavyTheme.colors}
          backgroundFill={wavyTheme.backgroundFill}
          waveOpacity={wavyTheme.waveOpacity}
          waveWidth={30}
          blur={8}
          speed="slow"
          containerClassName="w-full h-full"
          className="hidden"
        />
      </div>
      {children}
    </>
  );
}
