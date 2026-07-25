import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onStart: () => void;
}

export function HeroSection({ onStart }: HeroSectionProps) {
  return (
    <section className="group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl px-8 py-24 transition-all duration-500 hover:border-hairline">
      {/* Ambient gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/[0.03] to-transparent" />



      {/* Headline */}
      <h2 className="relative z-10 max-w-2xl text-center font-headline text-display text-ink text-balance leading-[1.1]">
        Package your project into an AI-ready snapshot.
      </h2>

      {/* Subtitle */}
      <p className="relative z-10 mb-10 mt-4 max-w-xl text-center font-sans text-lg font-light text-muted leading-relaxed tracking-[0.01em]">
        Seamlessly compress your codebase, documentation, and dependencies into a single, optimized artifact for rapid AI ingestion.
      </p>

      {/* CTA */}
      <Button
        size="lg"
        className="relative z-10 gap-2 active:scale-95"
        onClick={() => onStart()}
      >
        New Snapshot
      </Button>
    </section>
  );
}
