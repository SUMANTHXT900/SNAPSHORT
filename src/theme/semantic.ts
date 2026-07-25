// ─── Semantic Design Tokens ──────────────────────────────
// Opinionated aliases built on top of the raw token palettes.
// Components should consume these, never raw colors directly.
// ──────────────────────────────────────────────────────────

import { dark, light, shadows, motion, radius, spacing } from "./tokens";

export type ThemeId = "light" | "dark";

// Broad palette type that accepts both light and dark shapes.
export type SemanticPalette = typeof dark | typeof light;
export type SemanticShadows = typeof shadows.dark | typeof shadows.light;

export interface SemanticTokens {
  id: ThemeId;
  colors: SemanticPalette;
  shadows: SemanticShadows;
}

// Returns the full semantic token set for a given theme.
export function themeFor(id: ThemeId): SemanticTokens {
  const colors: SemanticPalette = id === "dark" ? dark : light;
  const shade: SemanticShadows = id === "dark" ? shadows.dark : shadows.light;
  return { id, colors, shadows: shade };
}

// Helpers for inline use.
export const semantic = {
  palette: (mode: ThemeId) => (mode === "dark" ? dark : light),
  shadow: (mode: ThemeId) => (mode === "dark" ? shadows.dark : shadows.light),
  radius,
  spacing,
  motion,
} as const;
