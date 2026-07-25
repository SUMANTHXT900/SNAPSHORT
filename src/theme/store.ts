// Theme store: bridges the design system's dark/light state into the React tree.
// Talks only to <html className> and localStorage. No business logic.

import { create } from "zustand";

type Theme = "light" | "dark";

function resolveInitial(): Theme {
  if (typeof window === "undefined") return "light";
  return (document.documentElement.className as Theme) || "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.className = theme;
  localStorage.setItem("snapshort-theme", theme);
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: resolveInitial(),

  toggle: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },

  set: (t: Theme) => {
    applyTheme(t);
    set({ theme: t });
  },
}));

// OS preference listener — keeps the theme in sync when no manual override.
if (typeof window !== "undefined") {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", (e) => {
    const stored = localStorage.getItem("snapshort-theme");
    if (!stored) {
      useTheme.getState().set(e.matches ? "dark" : "light");
    }
  });
}
