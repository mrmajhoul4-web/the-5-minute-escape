"use client";

import { useState, useRef, useEffect } from "react";
import { Palette } from "lucide-react";
import { useTheme, ColorTheme, THEMES } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-dark-100 transition-colors hover:text-white"
      >
        <Palette className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-dark-600 bg-dark-800 p-2 shadow-xl backdrop-blur-lg"
          >
            {(Object.keys(THEMES) as ColorTheme[]).map((key) => {
              const t = THEMES[key];
              return (
                <button
                  key={key}
                  onClick={() => { setTheme(key); setOpen(false); }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    theme === key
                      ? "bg-dark-600 text-white"
                      : "text-dark-100 hover:bg-dark-700 hover:text-white"
                  )}
                >
                  <span className="text-lg">{t.icon}</span>
                  <span>{t.label}</span>
                  <span className="ml-auto flex gap-1">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: t.primary }} />
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: t.secondary }} />
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
