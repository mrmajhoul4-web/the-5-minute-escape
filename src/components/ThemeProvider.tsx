"use client";

import { useState, useEffect, ReactNode } from "react";
import { ThemeContext, ColorTheme, THEMES } from "@/lib/theme";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ColorTheme>("neon");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ColorTheme | null;
    if (saved && saved in THEMES) setTheme(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const colors = THEMES[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      <style jsx global>{`
        :root {
          --theme-primary: ${colors.primary};
          --theme-secondary: ${colors.secondary};
          --theme-accent: ${colors.accent};
          --theme-glow: ${colors.glow};
        }
        .theme-transition {
          transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}
