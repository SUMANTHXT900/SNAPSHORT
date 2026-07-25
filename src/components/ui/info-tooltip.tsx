import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ content, children, placement = "top", className }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; position: string }>({
    top: 0,
    left: 0,
    position: placement,
  });

  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 250;
    const tooltipHeight = 80;

    let top = rect.top - 8;
    let left = rect.left + rect.width / 2;
    let actualPosition = placement;

    if (placement === "top") {
      top = rect.top - 8;
      if (top < tooltipHeight) {
        actualPosition = "bottom";
        top = rect.bottom + 8;
      }
    } else if (placement === "bottom") {
      top = rect.bottom + 8;
      if (window.innerHeight - top < tooltipHeight) {
        actualPosition = "top";
        top = rect.top - 8;
      }
    }

    if (left - tooltipWidth / 2 < 14) {
      left = tooltipWidth / 2 + 14;
    } else if (left + tooltipWidth / 2 > window.innerWidth - 14) {
      left = window.innerWidth - tooltipWidth / 2 - 14;
    }

    setCoords({ top, left, position: actualPosition });
  };

  const handleMouseEnter = () => {
    updateCoords();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    updateCoords();
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => updateCoords();
    const handleOutsideClick = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={toggleOpen}
        className="inline-flex items-center cursor-pointer select-none"
      >
        {children}
      </span>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: coords.position === "top" ? 4 : -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: coords.position === "top" ? 4 : -4 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  top: `${coords.top}px`,
                  left: `${coords.left}px`,
                  transform: `translate(-50%, ${coords.position === "top" ? "-100%" : "0%"})`,
                }}
                className={cn(
                  "fixed z-[9999] w-[250px] rounded-xl bg-black p-3.5 text-xs font-normal leading-relaxed text-ink shadow-[0_12px_40px_rgba(0,0,0,1),0_0_20px_rgba(37,99,235,0.22)] pointer-events-auto",
                  className
                )}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
              >
                {content}
                <div
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-black",
                    coords.position === "top" ? "-bottom-1" : "-top-1"
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

interface InfoTooltipProps {
  content: React.ReactNode;
  icon?: "help" | "info";
  className?: string;
  iconSize?: string;
}

export function InfoTooltip({ content, icon = "help", className, iconSize = "h-4 w-4" }: InfoTooltipProps) {
  const IconComponent = icon === "info" ? Info : HelpCircle;
  return (
    <Tooltip content={content} className={className}>
      <span className="inline-flex items-center justify-center rounded-full p-0.5 text-faint transition-all duration-150 hover:text-accent hover:bg-accent/10 hover:shadow-[0_0_12px_rgba(37,99,235,0.3)]">
        <IconComponent className={iconSize} strokeWidth={1.75} />
      </span>
    </Tooltip>
  );
}
