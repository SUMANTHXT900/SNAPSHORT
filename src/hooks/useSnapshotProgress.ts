import { useEffect, useRef } from "react";
import { onProgress, onWarning } from "@/services/events";
import type { ProgressEvent, WarningEvent } from "@/types/snapshot";
import { useWorkspaceStore } from "@/store/workspace-store";

/**
 * Subscribes to backend Tauri events and pushes them into the workspace store.
 * Unsubscribes on unmount. No-op when running outside Tauri.
 */
export function useSnapshotProgress() {
  const receiveProgress = useWorkspaceStore((s) => s.receiveProgress);
  const pushWarning = useWorkspaceStore((s) => s.pushWarning);

  const unlistenRef = useRef<{
    progress: (() => void) | null;
    warning: (() => void) | null;
  }>({ progress: null, warning: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [unlistenP, unlistenW] = await Promise.all([
        onProgress((evt: ProgressEvent) => {
          if (!cancelled) receiveProgress(evt);
        }),
        onWarning((evt: WarningEvent) => {
          if (!cancelled) pushWarning(evt);
        }),
      ]);

      if (cancelled) {
        unlistenP();
        unlistenW();
        return;
      }

      unlistenRef.current = { progress: unlistenP, warning: unlistenW };
    })();

    return () => {
      cancelled = true;
      unlistenRef.current.progress?.();
      unlistenRef.current.warning?.();
    };
  }, [receiveProgress, pushWarning]);
}
