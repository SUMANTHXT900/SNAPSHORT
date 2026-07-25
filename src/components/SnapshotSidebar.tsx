import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, Globe, FileCode, Code2, FileText } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useWorkspaceStore } from "@/store/workspace-store";
import { CustomSelect } from "@/components/ui/custom-select";
import { InfoTooltip } from "@/components/ui/info-tooltip";

// ── Snapshot type options ─────────────────────────────────
// NOTE: "Changes Snapshot" mode is temporarily removed/disabled in v1 as it is still under active development for v2.

const snapshotTypes = [
  {
    value: "full",
    label: "Full Snapshot",
    desc: "Include all project files",
    default: true,
  },
];

// ── Output formats ────────────────────────────────────────

const outputFormats = [
  {
    value: "markdown",
    label: "Markdown (.md)",
    icon: <FileCode className="h-4 w-4 text-emerald-400" />,
    description: "Default LLM-optimized format",
  },
  {
    value: "xml",
    label: "XML (.xml)",
    icon: <Code2 className="h-4 w-4 text-sky-400" />,
    description: "Structured tags & hierarchy",
  },
  {
    value: "txt",
    label: "Plain Text (.txt)",
    icon: <FileText className="h-4 w-4 text-amber-400" />,
    description: "Raw unformatted source archive",
  },
];

// ── Split modes ───────────────────────────────────────────

const splitModes = [
  { value: "lines", label: "Split by lines" },
  { value: "tokens", label: "Split by tokens" },
  { value: "characters", label: "Split by characters" },
];

// ── Component ─────────────────────────────────────────────

interface SnapshotSidebarProps {
  onGenerate: () => void;
  generating?: boolean;
}

export function SnapshotSidebar({ onGenerate, generating }: SnapshotSidebarProps) {
  const config = useWorkspaceStore((s) => s.config);
  const setConfig = useWorkspaceStore((s) => s.setConfig);
  const addGlobalExclude = useWorkspaceStore((s) => s.addGlobalExclude);
  const statistics = useWorkspaceStore((s) => s.statistics);
  const projectPath = useWorkspaceStore((s) => s.projectPath);
  const scannedFiles = useWorkspaceStore((s) => s.scannedFiles);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSnapshotType, setShowSnapshotType] = useState(false);
  const [isManageGlobalOpen, setIsManageGlobalOpen] = useState(false);
  const [customExtension, setCustomExtension] = useState("");

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-r border-hairline bg-canvas">
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {/* ── Snapshot Settings header ─────────────────────── */}
        <div className="mb-6">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Snapshot Settings
          </h2>
        </div>

        {/* ── Snapshot Type ───────────────────────────────── */}
        <div className="mb-6">
          <button
            className="mb-3 flex w-full items-center justify-between text-left"
            onClick={() => setShowSnapshotType((v) => !v)}
          >
            <span className="text-sm font-medium text-ink flex items-center gap-2">
              Snapshot Type
              <InfoTooltip content="Determines how your project files are gathered. Full Snapshot combines all targeted codebase files into a clean, tokenized LLM context file." />
            </span>
            <motion.svg
              className="h-4 w-4 text-faint"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ rotate: showSnapshotType ? 90 : 0 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            >
              <polyline points="9 18 15 12 9 6" />
            </motion.svg>
          </button>
          
          <AnimatePresence>
            {showSnapshotType && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-2 mt-2">
                  {snapshotTypes.map((type) => {
                    const active = config.snapshot_mode === type.value;
                    return (
                      <label
                        key={type.value}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all duration-150",
                          active
                            ? "border-accent bg-accent-muted"
                            : "border-hairline hover:bg-accent-muted",
                        )}
                      >
                        <input
                          type="radio"
                          name="snapshot_type"
                          className="mt-0.5"
                          style={{ accentColor: "var(--color-accent)" }}
                          checked={active}
                          onChange={() => setConfig({ snapshot_mode: type.value as "full" | "changes" | "custom" })}
                        />
                        <div className="flex flex-col">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              active ? "text-accent" : "text-ink",
                            )}
                          >
                            {type.label}
                          </span>
                          <span className="mt-0.5 text-xs text-faint">{type.desc}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Include / Exclude ───────────────────────────── */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Include / Exclude</span>
            <InfoTooltip content="Configure smart filtering rules for this snapshot session. Exclude boilerplate folders and binary assets to keep AI context windows efficient." />
          </div>
          <div className="space-y-3">
            <ToggleOption
              label="Respect .gitignore"
              checked={config.respect_gitignore}
              onChange={(v) => setConfig({ respect_gitignore: v })}
              tooltip="Automatically ignore files and build artifacts defined in your repository's .gitignore file."
            />
            <ToggleOption
              label="Exclude node_modules"
              checked={config.exclude_node_modules}
              onChange={(v) => setConfig({ exclude_node_modules: v })}
              tooltip="Exclude JavaScript and TypeScript dependency folders to prevent massive context inflation."
            />
            <ToggleOption
              label="Include hidden files"
              checked={config.include_hidden}
              onChange={(v) => setConfig({ include_hidden: v })}
              tooltip="Include dot-files and hidden configs (e.g. .env.example, .prettierrc, .github)."
            />
            <ToggleOption
              label="Include binary files"
              checked={config.include_binary}
              onChange={(v) => setConfig({ include_binary: v })}
              tooltip="Include structural metadata notices for images and binary assets without raw data dumps."
            />
          </div>
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-ink flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-accent" />
              Global Ignore Manager
            </span>
          </div>
          <p className="mb-3 text-xs text-faint">Quickly exclude specific file types across all projects permanently.</p>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(
              new Set(
                scannedFiles
                  .map((f) => {
                    const parts = f.name.split(".");
                    return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : "";
                  })
                  .filter((ext) => ext.length > 1)
              )
            )
            .sort()
            .slice(0, 15)
            .map((ext) => {
              const isExcluded = config.global_excludes?.includes(ext);
              return (
                <button
                  key={ext}
                  onClick={async () => {
                    import("@tauri-apps/api/core").then(async ({ invoke }) => {
                      const settings = await invoke<any>("load_settings_command");
                      const excludes = settings.global_excludes || [];
                      let newExcludes;
                      if (isExcluded) {
                        newExcludes = excludes.filter((e: string) => e !== ext);
                        toast.success(`Removed ${ext} from global ignores.`);
                      } else {
                        newExcludes = [...excludes, ext];
                        toast.success(`Added ${ext} to global ignores.`);
                      }
                      settings.global_excludes = newExcludes;
                      await invoke("save_settings_command", { settings });
                      setConfig({ global_excludes: newExcludes });
                    });
                  }}
                  className={cn(
                    "rounded border px-2 py-1 text-[10px] font-medium transition-colors",
                    isExcluded 
                      ? "border-accent bg-accent text-white" 
                      : "border-hairline bg-canvas hover:border-faint text-muted"
                  )}
                >
                  {ext}
                </button>
              );
            })}
          </div>
          <button 
            className="mt-3 text-[11px] font-medium text-accent hover:underline"
            onClick={() => setIsManageGlobalOpen(true)}
          >
            Manage Global List
          </button>
        </div>

        <Separator className="my-5" />

        {/* ── Output Format ───────────────────────────────── */}
        <div className="mb-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-ink">Output Format</span>
            <InfoTooltip content="Choose the syntax representation for your generated snapshot. Markdown (.md) is ideal and natively optimized for frontier AI models like Claude, ChatGPT, and Gemini." />
          </div>
          <CustomSelect
            value={config.output_format}
            onChange={(val) => setConfig({ output_format: val as "markdown" | "xml" | "txt" })}
            options={outputFormats}
            highlightArrow={true}
          />
        </div>

        {/* ── Advanced Options ────────────────────────────── */}
        <div>
          <button
            className="flex w-full items-center justify-between py-2 text-sm text-muted transition-colors hover:text-ink"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            <span>Advanced Options</span>
            <motion.svg
              className="h-4 w-4 text-faint"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ rotate: showAdvanced ? 90 : 0 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            >
              <polyline points="9 18 15 12 9 6" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-3 rounded-lg border border-hairline bg-accent-muted p-3">
                  <ToggleOption
                    label="Enable Splitting"
                    checked={config.enable_splitting}
                    onChange={(v) => setConfig({ enable_splitting: v })}
                    tooltip="Automatically partition oversized codebases into sequentially numbered multi-part files."
                  />
                  {config.enable_splitting && (
                    <div className="space-y-1 pl-6 pt-1 border-t border-hairline pb-2">
                      {splitModes.map((mode) => (
                        <label key={mode.value} className="flex cursor-pointer items-center gap-3 rounded px-2 py-1.5 transition-colors hover:bg-accent-muted">
                          <input
                            type="radio"
                            name="split_mode"
                            className="mt-0.5"
                            style={{ accentColor: "var(--color-accent)" }}
                            checked={config.split_mode === mode.value}
                            onChange={() => setConfig({ split_mode: mode.value as "lines" | "tokens" | "characters" })}
                          />
                          <span className="text-sm text-ink">{mode.label}</span>
                        </label>
                      ))}
                      <div className="mt-2 flex items-center justify-between px-2 pt-1">
                        <span className="text-[13px] text-muted">Threshold Limit</span>
                        <input
                          type="number"
                          className="w-24 rounded border border-hairline bg-[#111111] px-2 py-1 text-xs text-ink outline-none focus:border-accent"
                          value={config.line_threshold}
                          onChange={(e) => setConfig({ line_threshold: Math.max(1, parseInt(e.target.value) || 1000) })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Live Statistics Summary ─────────────────────── */}
        {projectPath && (
          <>
            <Separator className="my-5" />
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Summary
              </h3>
              <div className="space-y-2 text-xs text-muted">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-ink">Files selected</span>
                  <span>
                    <span className="font-bold text-ink text-sm">{statistics.selected_files.toLocaleString()}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-ink">Estimated tokens</span>
                  <span>
                    <span className="font-bold text-ink text-sm">{statistics.estimated_tokens.toLocaleString()}</span>
                    <span className="ml-1 text-[10px] font-bold text-accent uppercase">tokens</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-ink">Estimated lines</span>
                  <span>
                    <span className="font-bold text-ink text-sm">{statistics.estimated_lines.toLocaleString()}</span>
                    <span className="ml-1 text-[10px] font-bold text-faint uppercase">lines</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-ink">Total size</span>
                  <span>
                    <span className="font-bold text-ink text-sm">{formatBytes(statistics.total_size_bytes).split(" ")[0]}</span>
                    <span className="ml-1 text-[10px] font-bold text-faint uppercase">{formatBytes(statistics.total_size_bytes).split(" ")[1]}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-ink">Ignored files</span>
                  <span>
                    <span className="font-bold text-ink text-sm">{statistics.ignored_files.toLocaleString()}</span>
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Generate Button ───────────────────────────────── */}
      <div className="border-t border-hairline bg-canvas p-5">
        <button
          onClick={onGenerate}
          disabled={generating || !projectPath || statistics.selected_files === 0}
          className="group flex w-full flex-col items-center justify-center gap-1 rounded-lg bg-accent px-4 py-3 font-medium text-accent-foreground shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all hover:bg-accent-hover active:scale-[0.97] disabled:opacity-50"
        >
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4" fill="currentColor" strokeWidth={1.5} />
            {generating ? "Generating…" : "Generate Snapshot"}
          </span>
          <span className="text-[10px] opacity-80">
            {generating
              ? "Packaging files"
              : !projectPath
                ? "No project loaded"
                : statistics.selected_files === 0
                  ? "No files selected"
                  : `${statistics.selected_files} files ready`}
          </span>
        </button>
      </div>

      <Dialog open={isManageGlobalOpen} onOpenChange={setIsManageGlobalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Global Ignores</DialogTitle>
            <DialogDescription>
              Add custom file extensions to permanently ignore across all Snapshort projects.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g. .log, .tmp"
                value={customExtension}
                onChange={(e) => setCustomExtension(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && customExtension.trim()) {
                    const cleaned = customExtension.trim();
                    const excludes = config.global_excludes || [];
                    if (!excludes.includes(cleaned)) {
                      await addGlobalExclude(cleaned);
                      toast.success(`Added ${cleaned} to global ignores.`);
                      setCustomExtension("");
                    } else {
                      toast.error(`${cleaned} is already in the ignore list.`);
                    }
                  }
                }}
                className="flex-1 rounded-md border border-hairline bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                onClick={async () => {
                  if (customExtension.trim()) {
                    const cleaned = customExtension.trim();
                    const excludes = config.global_excludes || [];
                    if (!excludes.includes(cleaned)) {
                      await addGlobalExclude(cleaned);
                      toast.success(`Added ${cleaned} to global ignores.`);
                      setCustomExtension("");
                    } else {
                      toast.error(`${cleaned} is already in the ignore list.`);
                    }
                  }
                }}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Add
              </button>
            </div>
            
            <div className="max-h-[200px] overflow-y-auto rounded-md border border-hairline custom-scrollbar">
              {config.global_excludes?.length === 0 ? (
                <div className="p-4 text-center text-sm text-faint">No global ignores yet.</div>
              ) : (
                <div className="divide-y divide-hairline">
                  {config.global_excludes?.map((ext) => (
                    <div key={ext} className="flex items-center justify-between p-3 text-sm">
                      <span>{ext}</span>
                      <button
                        onClick={async () => {
                          import("@tauri-apps/api/core").then(async ({ invoke }) => {
                            const settings = await invoke<any>("load_settings_command");
                            const excludes = settings.global_excludes || [];
                            const newExcludes = excludes.filter((e: string) => e !== ext);
                            settings.global_excludes = newExcludes;
                            await invoke("save_settings_command", { settings });
                            setConfig({ global_excludes: newExcludes });
                            toast.success(`Removed ${ext} from global ignores.`);
                          });
                        }}
                        className="text-faint hover:text-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="rounded-md border border-hairline px-4 py-2 text-sm font-medium hover:bg-elevated">
                Done
              </button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}

// ── Toggle option ────────────────────────────────────────────

function ToggleOption({
  label,
  checked,
  onChange,
  tooltip,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <label className="flex cursor-pointer items-center gap-3 flex-1">
        <input
          type="checkbox"
          checked={checked}
          style={{ accentColor: "var(--color-accent)" }}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm text-ink">{label}</span>
      </label>
      {tooltip && <InfoTooltip content={tooltip} iconSize="h-3.5 w-3.5" className="ml-2 shrink-0" />}
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let u = 0;
  while (size >= 1024 && u < units.length - 1) { size /= 1024; u++; }
  return `${size.toFixed(1)} ${units[u]}`;
}
