import { useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { isTauri } from "@/lib/tauri";

export function useFolderPicker() {
  const [pending, setPending] = useState(false);
  const [notTauriWarning, setNotTauriWarning] = useState(false);

  const pick = async (): Promise<string | null> => {
    console.log("[Snapshort:useFolderPicker] pick() called. isTauri=", isTauri());

    if (!isTauri()) {
      console.warn("[Snapshort:useFolderPicker] not in Tauri — showing in-app warning");
      setNotTauriWarning(true);
      // Auto-dismiss after 6 seconds
      setTimeout(() => setNotTauriWarning(false), 6000);
      return null;
    }

    setPending(true);
    try {
      console.log("[Snapshort:useFolderPicker] calling tauri dialog open({ directory: true })");
      const selected = await open({
        directory: true,
        multiple: false,
      });
      console.log("[Snapshort:useFolderPicker] dialog returned:", selected);
      const result = typeof selected === "string" ? selected : null;
      console.log("[Snapshort:useFolderPicker] resolved path:", result);
      return result;
    } catch (e) {
      console.error("[Snapshort:useFolderPicker] dialog error:", e);
      return null;
    } finally {
      setPending(false);
    }
  };

  return { pick, pending, notTauriWarning };
}
