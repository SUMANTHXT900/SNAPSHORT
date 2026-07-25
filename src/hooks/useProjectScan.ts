import { useEffect, useState } from "react";
import { snapshotService } from "@/services/snapshot";
import type { AnalyzedProject } from "@/types/snapshot";

interface UseProjectScanResult {
  data: AnalyzedProject | null;
  loading: boolean;
  error: string | null;
}

export function useProjectScan(projectPath: string | null): UseProjectScanResult {
  const [data, setData] = useState<AnalyzedProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[Snapshort:useProjectScan] projectPath changed:", projectPath);
    if (!projectPath) {
      console.log("[Snapshort:useProjectScan] no path — clearing state");
      setData(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    console.log("[Snapshort:useProjectScan] starting scan…");

    snapshotService
      .scan(projectPath)
      .then((result) => {
        if (!cancelled) {
          console.log("[Snapshort:useProjectScan] scan complete. root:", result.root);
          setData(result);
          setLoading(false);
        } else {
          console.log("[Snapshort:useProjectScan] cancelled, discarding result");
        }
      })
      .catch((e) => {
        if (!cancelled) {
          console.error("[Snapshort:useProjectScan] scan failed:", e);
          setError(e instanceof Error ? e.message : String(e));
          setLoading(false);
        }
      });

    return () => {
      console.log("[Snapshort:useProjectScan] cleanup — cancelling pending scan");
      cancelled = true;
    };
  }, [projectPath]);

  return { data, loading, error };
}
