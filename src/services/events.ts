import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { isTauri } from "../lib/tauri";
import type { ProgressEvent, StatisticsEvent, WarningEvent } from "../types/snapshot";

const EV_PROGRESS = "snapshort://progress";
const EV_STATISTICS = "snapshort://statistics";
const EV_WARNING = "snapshort://warning";

// Subscribes to engine progress events. No-op handlers on web.
export async function onProgress(cb: (e: ProgressEvent) => void): Promise<UnlistenFn> {
  if (!isTauri()) return () => {};
  return listen<ProgressEvent>(EV_PROGRESS, (e) => cb(e.payload));
}
export async function onStatistics(cb: (e: StatisticsEvent) => void): Promise<UnlistenFn> {
  if (!isTauri()) return () => {};
  return listen<StatisticsEvent>(EV_STATISTICS, (e) => cb(e.payload));
}
export async function onWarning(cb: (e: WarningEvent) => void): Promise<UnlistenFn> {
  if (!isTauri()) return () => {};
  return listen<WarningEvent>(EV_WARNING, (e) => cb(e.payload));
}
