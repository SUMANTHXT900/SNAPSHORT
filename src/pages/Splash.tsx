import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PageContainer, Stack } from "@/components/layout/primitives";
import { Logo } from "@/assets/logo";

interface SplashProps {
  onDone: () => void;
}

export function Splash({ onDone }: SplashProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeOut = setTimeout(() => setExiting(true), 1200);
    const done = setTimeout(onDone, 1500);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <PageContainer centered>
      <motion.div
        className="flex h-full w-full items-center justify-center"
        animate={{ opacity: exiting ? 0 : 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Stack gap="xl" align="center">
          {/* Logo with ambient glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.2, 0, 0, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 -z-10 blur-2xl" style={{ background: "var(--color-accent)", opacity: 0.12 }} />
            <Logo size={72} />
          </motion.div>

          <Stack gap="xs" align="center">
            <motion.p
              className="text-3xl font-semibold tracking-tight text-ink text-balance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.2, 0, 0, 1] }}
            >
              Snapshort
            </motion.p>

            <motion.p
              className="text-base text-muted text-pretty"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: [0.2, 0, 0, 1] }}
            >
              Package your project for AI.
            </motion.p>
          </Stack>
        </Stack>
      </motion.div>
    </PageContainer>
  );
}
