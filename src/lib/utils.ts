import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines class names and resolves Tailwind conflicts.
// scn("px-4 py-2", "py-0") → "px-4 py-0"
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// Format a byte count for display.
export function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}
