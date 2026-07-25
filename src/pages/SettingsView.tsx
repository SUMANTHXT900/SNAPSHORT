import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { AppSettings } from "@/types/snapshot";
import { Settings, Plus, X, RotateCcw } from "lucide-react";
import { DEFAULT_GLOBAL_EXCLUDES } from "@/store/workspace-store";
import { InfoTooltip } from "@/components/ui/info-tooltip";

export function SettingsView() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [customExt, setCustomExt] = useState("");

  useEffect(() => {
    invoke<AppSettings>("load_settings_command").then((s) => {
      // Auto-populate defaults if this is the first time (empty list, not explicitly cleared to 0)
      if (s.global_excludes && s.global_excludes.length === 0) {
        const merged = { ...s, global_excludes: DEFAULT_GLOBAL_EXCLUDES };
        setSettings(merged);
        invoke("save_settings_command", { settings: merged });
      } else {
        setSettings(s);
      }
    });
  }, []);

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await invoke("save_settings_command", { settings: newSettings });
      setSettings(newSettings);
      return true;
    } catch (e) {
      toast.error(String(e));
      return false;
    }
  };

  const handleAddExclude = async () => {
    if (!settings || !customExt.trim()) return;
    const cleaned = customExt.trim(); // No longer forcefully prepend '.' because users might add 'node_modules'
    const excludes = settings.global_excludes || [];
    if (excludes.includes(cleaned)) {
      toast.error(`${cleaned} is already globally ignored.`);
      return;
    }
    const newExcludes = [...excludes, cleaned];
    const success = await saveSettings({ ...settings, global_excludes: newExcludes });
    if (success) {
      toast.success(`Added ${cleaned} to global ignores.`);
      setCustomExt("");
    }
  };

  const handleRemoveExclude = async (ext: string) => {
    if (!settings) return;
    if (!window.confirm(`Are you sure you want to remove ${ext} from global ignores?`)) return;
    const excludes = settings.global_excludes || [];
    const newExcludes = excludes.filter((e) => e !== ext);
    const success = await saveSettings({ ...settings, global_excludes: newExcludes });
    if (success) {
      toast.success(`Removed ${ext} from global ignores.`);
    }
  };

  const handleResetDefaults = async () => {
    if (!settings) return;
    if (!window.confirm("Are you sure you want to restore default ignores? This will wipe your custom entries.")) return;
    const success = await saveSettings({ ...settings, global_excludes: DEFAULT_GLOBAL_EXCLUDES });
    if (success) {
      toast.success("Restored comprehensive default ignore list.");
    }
  };

  if (!settings) {
    return <div className="text-sm text-faint">Loading settings...</div>;
  }

  return (
    <div className="flex flex-col max-w-2xl">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted">
          <Settings className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-ink">Settings</h1>
          <p className="text-sm text-muted mt-1">Manage global configuration for Snapshort.</p>
        </div>
      </div>

      <div className="rounded-xl border border-hairline bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-ink">Global Ignore Manager</h2>
          <InfoTooltip icon="info" content="Extensions or folder names defined here are automatically skipped across all projects and snapshots in Snapshort." />
        </div>
        <div className="flex items-center justify-between mt-1 mb-6">
          <p className="text-sm text-muted">
            File extensions or folder names listed here will be ignored by default across all projects.
          </p>
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restore Defaults
          </button>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            className="flex-1 rounded-lg border border-hairline bg-canvas px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
            placeholder="e.g. .log, .tmp, .csv"
            value={customExt}
            onChange={(e) => setCustomExt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddExclude()}
          />
          <button
            onClick={handleAddExclude}
            className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            Add Extension
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto rounded-lg border border-hairline bg-canvas custom-scrollbar">
          {(!settings.global_excludes || settings.global_excludes.length === 0) ? (
            <div className="p-8 text-center text-sm text-faint">No global ignores configured.</div>
          ) : (
            <div className="divide-y divide-hairline">
              {settings.global_excludes.map((ext) => (
                <div key={ext} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-elevated transition-colors">
                  <span className="font-medium text-ink">{ext}</span>
                  <button
                    onClick={() => handleRemoveExclude(ext)}
                    className="rounded-md p-1.5 text-faint hover:bg-red-500/10 hover:text-danger transition-colors"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
