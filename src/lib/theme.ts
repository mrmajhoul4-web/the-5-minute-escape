"use client";

import { createContext, useContext } from "react";

export type ColorTheme = "neon" | "fire" | "ocean" | "forest" | "midnight";

export const THEMES: Record<ColorTheme, {
  primary: string;
  secondary: string;
  accent: string;
  glow: string;
  label: string;
  icon: string;
}> = {
  neon: {
    primary: "#00d4ff",
    secondary: "#a855f7",
    accent: "#ec4899",
    glow: "rgba(0, 212, 255, 0.3)",
    label: "Neon",
    icon: "⚡",
  },
  fire: {
    primary: "#f97316",
    secondary: "#ef4444",
    accent: "#f59e0b",
    glow: "rgba(249, 115, 22, 0.3)",
    label: "Fire",
    icon: "🔥",
  },
  ocean: {
    primary: "#06b6d4",
    secondary: "#3b82f6",
    accent: "#14b8a6",
    glow: "rgba(6, 182, 212, 0.3)",
    label: "Ocean",
    icon: "🌊",
  },
  forest: {
    primary: "#22c55e",
    secondary: "#16a34a",
    accent: "#84cc16",
    glow: "rgba(34, 197, 94, 0.3)",
    label: "Forest",
    icon: "🌿",
  },
  midnight: {
    primary: "#818cf8",
    secondary: "#c084fc",
    accent: "#e879f9",
    glow: "rgba(129, 140, 248, 0.3)",
    label: "Midnight",
    icon: "🌙",
  },
};

export interface ThemeContextType {
  theme: ColorTheme;
  setTheme: (t: ColorTheme) => void;
  colors: typeof THEMES[ColorTheme];
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "neon",
  setTheme: () => {},
  colors: THEMES.neon,
});

export const useTheme = () => useContext(ThemeContext);
