// Snapshort brand mark.
// Layered document stack — communicates files being consolidated
// into a single package. The top layer carries the accent.

export const Logo = ({ size = 64 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Bottom layer — deeper, slightly offset */}
    <rect x="16" y="18" width="32" height="36" rx="6" fill="var(--color-elevated)" stroke="var(--color-hairline)" strokeWidth="1.5" />
    {/* Middle layer */}
    <rect x="13" y="14" width="32" height="36" rx="6" fill="var(--color-surface)" stroke="var(--color-hairline)" strokeWidth="1.5" />
    {/* Top layer — accent, the "output" package */}
    <rect x="10" y="10" width="32" height="36" rx="6" fill="var(--color-accent)" />
    {/* Content lines on the top layer — the packaged text */}
    <path d="M16 20h20M16 27h20M16 34h12" stroke="var(--color-accent-foreground)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
