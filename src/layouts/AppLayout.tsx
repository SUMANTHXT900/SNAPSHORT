import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

// App shell: full-height, OLED-inspired dark canvas.
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas text-ink grain-overlay">
      {children}
    </div>
  );
}
