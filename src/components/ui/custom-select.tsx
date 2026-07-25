import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  leftIcon?: React.ReactNode;
  highlightArrow?: boolean;
  className?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  leftIcon,
  highlightArrow = true,
  className,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* ── Trigger Button (OLED Black & Borderless) ──────── */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "group flex w-full items-center justify-between gap-2.5 rounded-xl bg-black py-2.5 pl-3.5 pr-2 text-left text-sm text-ink outline-none transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.8)]",
          isOpen
            ? "bg-black shadow-[0_0_20px_rgba(37,99,235,0.25)] text-ink-bright"
            : "hover:bg-black hover:shadow-[0_0_15px_rgba(37,99,235,0.15)]"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {selectedOption?.icon || leftIcon}
          <span className={cn("truncate font-medium", !selectedOption && "text-muted")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* ── Highlighted Dropdown Indicator (Borderless Glow) ── */}
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
            highlightArrow
              ? "bg-accent/20 text-accent shadow-[0_0_12px_rgba(37,99,235,0.25)] group-hover:bg-accent/30 group-hover:shadow-[0_0_18px_rgba(37,99,235,0.4)]"
              : "bg-transparent text-muted group-hover:text-ink",
            isOpen && "bg-accent/35 text-accent shadow-[0_0_20px_rgba(37,99,235,0.5)]"
          )}
          title="Click to change selection"
        >
          <ChevronDown
            className={cn("h-3.5 w-3.5 transition-transform duration-200", isOpen && "rotate-180")}
          />
        </span>
      </button>

      {/* ── Popover Options Menu (Pure OLED Black) ──────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 top-full z-[999] mt-2 max-h-60 overflow-y-auto rounded-xl bg-black p-1.5 shadow-[0_15px_50px_rgba(0,0,0,1),0_0_25px_rgba(37,99,235,0.12)] backdrop-blur-none custom-scrollbar"
          >
            <div className="space-y-0.5" role="listbox">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "group/opt flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150 my-0.5",
                      isSelected
                        ? "bg-accent/20 font-semibold text-accent shadow-[0_2px_12px_rgba(37,99,235,0.2)]"
                        : "text-ink hover:bg-accent/10 hover:text-ink-bright"
                    )}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      {option.icon && (
                        <span
                          className={cn(
                            "shrink-0 transition-colors",
                            isSelected ? "text-accent" : "text-muted group-hover/opt:text-accent"
                          )}
                        >
                          {option.icon}
                        </span>
                      )}
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{option.label}</span>
                        {option.description && (
                          <span
                            className={cn(
                              "mt-0.5 truncate text-xs transition-colors",
                              isSelected ? "text-accent/85" : "text-muted group-hover/opt:text-muted/90"
                            )}
                          >
                            {option.description}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-accent ml-2 animate-in fade-in zoom-in duration-150" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
