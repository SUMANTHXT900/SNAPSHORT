// ─── Motion Animation Presets ─────────────────────────────
// Reusable framer-motion / Motion variants consumed by layout
// primitives and future UI components. Pure design — no logic.
// ──────────────────────────────────────────────────────────

import type { Variants, Transition } from "motion/react";

// ── Easings (mirror tokens) ───────────────────────────────

export const easings = {
  standard: [0.4, 0.0, 0.2, 1] as const,
  emphasized: [0.2, 0.0, 0, 1] as const,
  decelerate: [0.0, 0.0, 0.2, 1] as const,
  accelerate: [0.4, 0.0, 1, 1] as const,
};

// ── Shared transition presets ─────────────────────────────

export const t = {
  fast: { duration: 0.15, ease: easings.standard } satisfies Transition,
  base: { duration: 0.25, ease: easings.standard } satisfies Transition,
  slow: { duration: 0.4, ease: easings.emphasized } satisfies Transition,
  spring: {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 1,
  } satisfies Transition,
};

// ── Variant presets ───────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: t.base },
};

export const fadeOut: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0, transition: t.fast },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: t.base },
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: t.base },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: t.spring },
};

export const stagger = {
  container: {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  } satisfies Variants,
  item: {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: t.base },
  } satisfies Variants,
};

// ── Preset lookup for components that need programmatic access ──

export const presets = {
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  scaleIn,
  stagger,
  t,
  easings,
} as const;
