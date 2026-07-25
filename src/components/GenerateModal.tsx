import { useState, useEffect } from "react";
import { Folder, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useWorkspaceStore } from "@/store/workspace-store";
import { CustomSelect } from "@/components/ui/custom-select";

interface GenerateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
}

export function GenerateModal({ open, onOpenChange, projectName }: GenerateModalProps) {
  const projectPath = useWorkspaceStore((s) => s.projectPath);
  const recentExportDirs = useWorkspaceStore((s) => s.recentExportDirs);
  const setGeneratedOutputDir = useWorkspaceStore((s) => s.setGeneratedOutputDir);
  const generate = useWorkspaceStore((s) => s.generate);
  const config = useWorkspaceStore((s) => s.config);

  const [fileName, setFileName] = useState(`${projectName}_Snapshot`);
  const [selectedDir, setSelectedDir] = useState<string>("");

  useEffect(() => {
    if (open) {
      setFileName(`${projectName}_Snapshot`);
      // Default to last used dir if available, or project path
      if (recentExportDirs && recentExportDirs.length > 0) {
        setSelectedDir(recentExportDirs[0]);
      } else {
        setSelectedDir(projectPath || "");
      }
    }
  }, [open, projectName, projectPath, recentExportDirs]);

  const handlePickFolder = async () => {
    const { open: openDialog } = await import("@tauri-apps/plugin-dialog");
    const selected = await openDialog({
      directory: true,
      multiple: false,
      title: "Select Output Folder for Snapshot",
      defaultPath: selectedDir || projectPath || undefined,
    });
    
    if (selected && typeof selected === "string") {
      setSelectedDir(selected);
      // We don't add it to recentExportDirs yet; that happens on Generate.
    }
  };

  const handleGenerate = async () => {
    if (!selectedDir) return;
    setGeneratedOutputDir(selectedDir);
    onOpenChange(false);
    await generate({ outputFileName: fileName });
  };

  const extension = config.output_format === "markdown" ? ".md" : `.${config.output_format}`;

  // Unique list of dirs. If user picked a new folder this session that isn't in history yet, ensure it's in the list.
  const dirs = Array.from(new Set([selectedDir, projectPath, ...(recentExportDirs || [])].filter(Boolean) as string[]));

  const dirOptions = dirs.map((dir) => ({
    value: dir,
    label: dir,
    icon: <Folder className="h-4 w-4 text-accent shrink-0" />,
    description: dir === projectPath ? "Project root directory" : "Recently used location",
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Generate Snapshot</DialogTitle>
          <DialogDescription>
            Choose where to save your snapshot and name the file.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-medium text-ink">Output Location</label>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <CustomSelect
                  value={selectedDir}
                  onChange={(val) => setSelectedDir(val)}
                  options={dirOptions}
                  placeholder="Select output folder..."
                  leftIcon={<Folder className="h-4 w-4 text-accent shrink-0" />}
                  highlightArrow={true}
                />
              </div>
              <button
                onClick={handlePickFolder}
                className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-ink shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:bg-black hover:text-accent hover:shadow-[0_0_15px_rgba(37,99,235,0.2)] focus:outline-none transition-all flex items-center justify-center whitespace-nowrap shrink-0"
                title="Browse for new folder"
              >
                New...
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-ink">File Name</label>
            <div className="flex items-center rounded-xl bg-black shadow-[0_4px_20px_rgba(0,0,0,0.8)] focus-within:shadow-[0_0_20px_rgba(37,99,235,0.25)] transition-all">
              <FileText className="ml-3 h-4 w-4 shrink-0 text-faint" />
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="flex-1 bg-transparent px-2 py-2.5 text-sm text-ink outline-none"
                placeholder={`${projectName}_Snapshot`}
              />
              <span className="pr-3 text-sm font-medium text-muted select-none">{extension}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <button className="rounded-md border border-hairline px-4 py-2 text-sm font-medium hover:bg-elevated transition-colors">
              Cancel
            </button>
          </DialogClose>
          <button
            onClick={handleGenerate}
            disabled={!selectedDir || !fileName.trim()}
            className="rounded-md bg-accent px-5 py-2 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
          >
            Export
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
