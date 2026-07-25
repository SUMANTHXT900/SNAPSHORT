import * as React from "react";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

// ── PageContainer ─────────────────────────────────────────
// Full-height page wrapper. Injects consistent padding and
// scroll behavior. Every page component uses this as its root.

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  centered?: boolean;
}

export function PageContainer({
  centered = false,
  className,
  children,
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-auto scrollbar-gutter-stable",
        centered && "items-center justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Section ───────────────────────────────────────────────
// Logical content groupings. Defaults to generous vertical
// spacing matching Apple's rhythm.

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div";
}

export function Section({
  as: Tag = "section",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <Tag className={cn("py-15 px-15", className)} {...props}>
      {children}
    </Tag>
  );
}

// ── Stack ─────────────────────────────────────────────────
// Vertical flex column with configurable gap. Avoids
// proliferating margin utilities across sibling elements.

type StackDirection = "col" | "row";

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: keyof typeof gapMap;
  dir?: StackDirection;
  align?: "start" | "center" | "end" | "stretch";
}

const gapMap = {
  none: "",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-10",
} as const;

export function Stack({
  gap = "md",
  dir = "col",
  align = "stretch",
  className,
  children,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        "flex",
        dir === "col" ? "flex-col" : "flex-row flex-wrap",
        gapMap[gap],
        align === "start" && "items-start",
        align === "center" && "items-center",
        align === "end" && "items-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Card (Layout primitive variant) ───────────────────────
// A card is the shadcn Card, but re-exported here as a
// layout primitive with an optional subtle entrance animation.

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

interface LayoutCardProps {
  animate?: boolean;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function LayoutCard({
  animate = false,
  delay = 0,
  className,
  style,
  children,
}: LayoutCardProps) {
  return (
    <motion.div
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
      variants={animate ? cardVariants : undefined}
      transition={animate ? { duration: 0.25, delay, ease: [0.2, 0, 0, 1] } : undefined}
      className={cn(
        "rounded-2xl border border-hairline bg-elevated p-6 text-ink",
        className,
      )}
      style={style}
    >
      {children}
    </motion.div>
  );
}

// ── EmptyState ────────────────────────────────────────────
// Centered placeholder shown when no data / project is loaded.
// Pure presentation — the caller supplies icon, title, message.

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  message: string;
}

export function EmptyState({
  icon,
  title,
  message,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-18 text-center",
        className,
      )}
      {...props}
    >
      <div className="text-faint">{icon}</div>
      <div className="max-w-sm space-y-1">
        <p className="text-base font-semibold text-ink">{title}</p>
        <p className="text-sm text-muted">{message}</p>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

// ── LoadingState ──────────────────────────────────────────
// Full-area loading placeholder with skeleton blocks.
// Pass `lines` to control visual rows of shimmer.

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function LoadingState({
  lines = 4,
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 px-6 py-18",
        className,
      )}
      {...props}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 animate-pulse rounded bg-elevated"
          style={{ width: `${100 - (i % 3) * 20}%` }}
        />
      ))}
    </div>
  );
}
