"use client";

import { useTheme } from "next-themes";

interface WavyThemeConfig {
  colors: string[];
  backgroundFill: string;
  waveOpacity: number;
}

export function useWavyTheme(): WavyThemeConfig {
  const { theme } = useTheme();

  const lightConfig: WavyThemeConfig = {
    colors: ["#e0f2fe", "#ddd6fe", "#fce7f3", "#e0e7ff", "#f0fdfa"],
    backgroundFill: "transparent",
    waveOpacity: 0.3,
  };

  const darkConfig: WavyThemeConfig = {
    colors: ["#1e3a8a", "#4c1d95", "#831843", "#312e81", "#134e4a"],
    backgroundFill: "#0a0a0a",
    waveOpacity: 0.2,
  };

  return theme === "dark" ? darkConfig : lightConfig;
}
