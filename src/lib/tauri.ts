import type { InvokeArgs } from "@tauri-apps/api/core";
import { invoke } from "@tauri-apps/api/core";

export function isTauri(): boolean {
  // Tauri v2 injects __TAURI_INTERNALS__ into the window object.
  // __TAURI__ only exists when withGlobalTauri is explicitly enabled.
  const result = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
  console.log("[Snapshort:tauri] isTauri() =", result);
  return result;
}

export async function invokeTauri<T>(cmd: string, args?: InvokeArgs): Promise<T> {
  console.log("[Snapshort:tauri] invoke:", cmd, args);
  if (!isTauri()) {
    console.warn("[Snapshort:tauri] NOT in Tauri, rejecting command:", cmd);
    throw new Error(`Tauri command "${cmd}" is unavailable in the browser.`);
  }
  try {
    const result = await invoke<T>(cmd, args);
    console.log("[Snapshort:tauri] invoke SUCCESS:", cmd);
    return result;
  } catch (e) {
    console.error("[Snapshort:tauri] invoke FAILED:", cmd, e);
    throw e;
  }
}
