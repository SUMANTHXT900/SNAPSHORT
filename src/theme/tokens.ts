// ─── Snapshort Design Tokens ──────────────────────────────
// Single source of truth for every visual value in the app.
// Components never use raw hex/px values — they consume these.
// ──────────────────────────────────────────────────────────

// ── Palettes ──────────────────────────────────────────────

export const dark = {
  canvas: "#000000",
  surface: "#090909",
  elevated: "#141414",
  field: "#1c1c1c",
  overlay: "#000000cc",
  ink: "#e5e2e1",
  muted: "#c1c6d7",
  faint: "#8b90a0",
  hairline: "#121212",
  sidebar: "#000000",
  sidebarBorder: "#101010",
  accent: {
    DEFAULT: "#007aff",
    foreground: "#ffffff",
    soft: "#007aff14",
    hover: "#005bc1",
    muted: "#007aff0d",
  },
  success: "#30d158",
  warning: "#ffd60a",
  danger: "#ff453a",
} as const;

export const light = {
  canvas: "#f5f5f7",
  surface: "#ffffff",
  elevated: "#fafafa",
  field: "#f2f2f5",
  overlay: "#00000033",
  ink: "#1d1d1f",
  muted: "#6e6e73",
  faint: "#aeaeb2",
  hairline: "#d2d2d7",
  accent: {
    DEFAULT: "#0071e3",
    foreground: "#ffffff",
    soft: "#0071e322",
    hover: "#0077ed",
    muted: "#0071e314",
  },
  success: "#34c759",
  warning: "#ffcc00",
  danger: "#ff3b30",
} as const;

// ── Typography ────────────────────────────────────────────

export const fonts = {
  sans: [
    "-apple-system",
    "BlinkMacSystemFont",
    "SF Pro Display",
    "SF Pro Text",
    "Inter",
    "Segoe UI",
    "system-ui",
    "sans-serif",
  ],
  mono: [
    "SF Mono",
    "ui-monospace",
    "JetBrains Mono",
    "Menlo",
    "Consolas",
    "monospace",
  ],
} as const;

export const fontSizes = {
  xs: "0.75rem",    // 12px
  sm: "0.8125rem",  // 13px
  base: "0.875rem", // 14px
  lg: "1rem",       // 16px
  xl: "1.125rem",   // 18px
  "2xl": "1.375rem",// 22px
  "3xl": "1.75rem", // 28px
  "4xl": "2.25rem", // 36px
} as const;

export const fontWeights = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export const lineHeights = {
  tight: "1.15",
  snug: "1.3",
  normal: "1.5",
  relaxed: "1.65",
} as const;

// ── Spacing ───────────────────────────────────────────────

export const spacing = {
  // Extends Tailwind's default scale with a few Apple-friendly values
  "4.5": "1.125rem",
  "13": "3.25rem",
  "15": "3.75rem",
  "18": "4.5rem",
  "22": "5.5rem",
  "26": "6.5rem",
} as const;

// ── Border Radius ─────────────────────────────────────────

export const radius = {
  none: "0",
  xs: "0.25rem",
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.625rem",
  xl: "0.75rem",
  "2xl": "1rem",
  "3xl": "1.25rem",
  full: "9999px",
} as const;

// ── Shadows ───────────────────────────────────────────────

export const shadows = {
  // Dark shadows (used when .dark)
  dark: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.4)",
    md: "0 4px 8px -2px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.4)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.2)",
  },
  // Light shadows (used when :root / .light)
  light: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 8px -2px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.04)",
  },
} as const;

// ── Z-Index Scale ─────────────────────────────────────────

export const zIndex = {
  auto: "auto",
  base: "0",
  dropdown: "10",
  sticky: "20",
  overlay: "30",
  modal: "40",
  popover: "50",
  tooltip: "60",
} as const;

// ── Motion ────────────────────────────────────────────────

export const motion = {
  durations: {
    instant: "75ms",
    fast: "150ms",
    base: "250ms",
    slow: "400ms",
    glacial: "700ms",
  },
  easings: {
    // Apple-native easing functions
    standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
    emphasized: "cubic-bezier(0.2, 0.0, 0, 1)",
    decelerate: "cubic-bezier(0.0, 0.0, 0.2, 1)",
    accelerate: "cubic-bezier(0.4, 0.0, 1, 1)",
    spring: [0.2, 0.8, 0.4, 1] as [number, number, number, number],
  },
} as const;

// ── Layout ────────────────────────────────────────────────

export const layout = {
  pageWidth: "1200px",
  sidebarWidth: "280px",
  headerHeight: "56px",
  contentPadding: "2rem",
  sectionGap: "2rem",
} as const;

// ── Aggregate for import convenience ──────────────────────

const tokens = {
  dark,
  light,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  radius,
  shadows,
  zIndex,
  motion,
  layout,
};

export default tokens;
