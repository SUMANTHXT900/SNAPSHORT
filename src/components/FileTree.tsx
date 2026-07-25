import { useState, useMemo, memo, useRef, useCallback } from "react";
import { ChevronRight, ChevronDown, Folder, File, FileCode2, FileCog, Globe } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { useWorkspaceStore, buildFileTree, type TreeNode } from "@/store/workspace-store";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const colGrid = "grid grid-cols-[minmax(300px,1fr)_120px_100px_80px] gap-4";

// ── Checkbox ────────────────────────────────────────────────

function Checkbox({
  state,
  onChange,
}: {
  state: "selected" | "partial" | "unselected";
  onChange: () => void;
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
        state === "selected" && "border-accent bg-accent",
        state === "partial" && "border-accent bg-accent/20",
        state === "unselected" && "border-white/20 bg-white/5 hover:border-white/40",
      )}
    >
      {state === "selected" && (
        <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {state === "partial" && (
        <div className="h-2 w-2 rounded-sm bg-accent" />
      )}
    </button>
  );
}

// ── Flat Tree Structures ─────────────────────────────────────

type WorkspaceFile = ReturnType<typeof useWorkspaceStore.getState>["effectiveFiles"][number];

type FlatNode = 
  | { type: 'root'; name: string; state: "selected" | "partial" | "unselected" }
  | { type: 'dir'; node: TreeNode; depth: number; path: string; open: boolean }
  | { type: 'file'; file: WorkspaceFile; depth: number };

// ── Highlight match helper (Fuzzy) ──────────────────────────

function isFuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  let i = 0, j = 0;
  while (i < t.length && j < q.length) {
    if (t[i] === q[j]) j++;
    i++;
  }
  return j === q.length;
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const matches = new Set<number>();
  
  // Prefer exact match first
  const exactIdx = textLower.indexOf(queryLower);
  if (exactIdx !== -1) {
    for (let k = 0; k < query.length; k++) matches.add(exactIdx + k);
  } else {
    // Fallback to fuzzy highlight
    let i = 0;
    let j = 0;
    while (i < textLower.length && j < queryLower.length) {
      if (textLower[i] === queryLower[j]) {
        matches.add(i);
        j++;
      }
      i++;
    }
    // If it didn't fully match, don't highlight anything
    if (j !== queryLower.length) return <>{text}</>;
  }

  const result: React.ReactNode[] = [];
  let currentGroup = "";
  let isHighlighting = false;

  for (let k = 0; k < text.length; k++) {
    if (matches.has(k)) {
      if (!isHighlighting) {
        if (currentGroup) result.push(currentGroup);
        currentGroup = "";
        isHighlighting = true;
      }
      currentGroup += text[k];
    } else {
      if (isHighlighting) {
        result.push(<mark key={k} className="bg-accent text-white rounded-sm font-semibold px-[1px]">{currentGroup}</mark>);
        currentGroup = "";
        isHighlighting = false;
      }
      currentGroup += text[k];
    }
  }
  
  if (currentGroup) {
    if (isHighlighting) {
      result.push(<mark key="end" className="bg-accent text-white rounded-sm font-semibold px-[1px]">{currentGroup}</mark>);
    } else {
      result.push(currentGroup);
    }
  }

  return <>{result}</>;
}

// ── Row Renderers ────────────────────────────────────────────

const FileRow = memo(function FileRow({ file, depth, style, searchQuery, onToggleRequest, globalExcludes }: { file: WorkspaceFile; depth: number; style?: React.CSSProperties; searchQuery?: string; onToggleRequest: (f: WorkspaceFile) => void; globalExcludes: string[] }) {
  const isIncluded = file.effectiveIncluded;
  const isIgnored = file.ignored;
  const checkboxState: "selected" | "unselected" = isIncluded ? "selected" : "unselected";

  const isGlobalIgnored = globalExcludes.some(e => e === file.name || (e.startsWith('.') && file.name.endsWith(e)));

  const FileIcon = file.language === "TypeScript" || file.language === "TSX" ? FileCode2 :
                   file.language === "MD" || file.language === "Markdown" ? FileCog : File;

  const iconColor = file.language === "TypeScript" || file.language === "TSX" ? "text-cyan-300" :
                    file.language === "CSS" || file.language === "SCSS" ? "text-blue-400" :
                    file.is_binary ? "text-yellow-400" : "text-faint";

  return (
    <div
      className={cn(colGrid, "group cursor-pointer items-center rounded py-1.5 pr-4 transition-colors hover:bg-accent-muted", isIgnored && "opacity-60")}
      style={{ ...style, paddingLeft: `${depth * 24 + 28}px` }}
      onClick={() => onToggleRequest(file)}
    >
      <div className="flex items-center gap-2 truncate">
        <Checkbox state={checkboxState} onChange={() => onToggleRequest(file)} />
        <span className="w-4" />
        <FileIcon className={cn("h-4 w-4 shrink-0", iconColor)} strokeWidth={1.75} />
        <span className={cn("truncate font-mono text-sm", isIgnored ? "text-muted line-through" : "text-muted")}>
          <HighlightMatch text={file.name} query={searchQuery ?? ""} />
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        <span className={cn("h-1.5 w-1.5 rounded-full", isIncluded ? "bg-emerald-400" : isIgnored ? "bg-blue-400" : "bg-gray-500")} />
        <span className={cn("flex items-center gap-1", isIncluded ? "text-emerald-400" : isIgnored ? "text-blue-400" : "text-gray-500")}>
          {isIncluded ? "Included" : isIgnored ? (
            isGlobalIgnored ? (
              <>
                <Globe className="h-3 w-3 opacity-70" />
                <span title="Excluded by Global Ignore">Globally Ignored</span>
              </>
            ) : (
              <>
                <FileCog className="h-3 w-3 opacity-70" />
                <span title="Excluded as Structural Noise">Auto-Excluded</span>
              </>
            )
          ) : file.is_binary ? "Binary" : "Excluded"}
        </span>
      </div>
      <span className="text-xs text-muted">{file.language}</span>
      <span className="text-right text-xs text-muted">
        {file.size_bytes >= 1024 ? `${(file.size_bytes / 1024).toFixed(1)} KB` : `${file.size_bytes} B`}
      </span>
    </div>
  );
});

const DirRow = memo(function DirRow({ node, depth, open, onToggleOpen, style, searchQuery }: { node: TreeNode; depth: number; open: boolean; onToggleOpen: () => void; style?: React.CSSProperties; searchQuery?: string }) {
  const toggleFolder = useWorkspaceStore((s) => s.toggleFolder);
  const hasContent = node.children.length > 0 || node.files.length > 0;

  return (
    <div
      className={cn(colGrid, "group cursor-pointer items-center rounded py-1.5 pr-4 transition-colors hover:bg-accent-muted")}
      style={{ ...style, paddingLeft: `${depth * 24 + 28}px` }}
      onClick={() => { if (hasContent) onToggleOpen(); }}
    >
      <div className="flex items-center gap-2 truncate">
        <Checkbox state={node.state} onChange={() => toggleFolder(node.path)} />
        {hasContent ? (
          <div className="shrink-0 transition-transform duration-150" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
            <ChevronRight className="h-4 w-4 text-faint" />
          </div>
        ) : (
          <span className="w-4" />
        )}
        <Folder className="h-4 w-4 shrink-0 text-yellow-400" strokeWidth={1.75} />
        <span className="truncate font-mono text-sm font-medium text-ink">
          <HighlightMatch text={node.name} query={searchQuery ?? ""} />
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {node.state === "selected" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        {node.state === "partial" && <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />}
        {node.state === "unselected" && <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />}
        <span className={node.state === "selected" ? "text-emerald-400" : node.state === "partial" ? "text-yellow-400" : "text-gray-500"}>
          {node.state === "selected" ? "Selected" : node.state === "partial" ? "Partial" : "Unselected"}
        </span>
      </div>
      <span className="text-xs text-muted">Folder</span>
      <span className="text-right text-xs text-faint">—</span>
    </div>
  );
});

const RootRow = memo(function RootRow({ name, state, onToggle, style }: { name: string; state: "selected" | "partial" | "unselected"; onToggle: () => void; style?: React.CSSProperties }) {
  return (
    <div
      className={cn(colGrid, "group cursor-pointer items-center rounded py-1.5 pl-4 pr-4 transition-colors hover:bg-accent-muted")}
      style={style}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <Checkbox state={state} onChange={onToggle} />
        <ChevronDown className="h-4 w-4 text-faint" />
        <Folder className="h-4 w-4 text-yellow-400" strokeWidth={1.75} />
        <span className="font-mono text-sm font-medium text-ink">{name}</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs">
        {state === "selected" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        {state === "partial" && <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />}
        {state === "unselected" && <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />}
        <span className={state === "selected" ? "text-emerald-400" : state === "partial" ? "text-yellow-400" : "text-gray-500"}>
          {state === "selected" ? "Selected" : state === "partial" ? "Partial" : "Unselected"}
        </span>
      </div>
      <span className="text-xs text-muted">Folder</span>
      <span className="text-right text-xs text-faint">—</span>
    </div>
  );
});

export function FileTree({ rootName }: { rootName: string }) {
  const effectiveFiles = useWorkspaceStore((s) => s.effectiveFiles);
  const toggleFolder = useWorkspaceStore((s) => s.toggleFolder);
  const toggleFile = useWorkspaceStore((s) => s.toggleFile);
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const globalExcludes = useWorkspaceStore((s) => s.config.global_excludes) || [];

  const [forceIncludeFile, setForceIncludeFile] = useState<WorkspaceFile | null>(null);

  const handleToggleRequest = useCallback((file: WorkspaceFile) => {
    if ((file.ignored || file.is_binary) && !file.effectiveIncluded) {
      setForceIncludeFile(file);
    } else {
      toggleFile(file.path);
    }
  }, [toggleFile]);

  // When searching, filter files using a combination of exact substring and fuzzy matching
  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return effectiveFiles;
    const q = searchQuery.toLowerCase();
    
    return effectiveFiles
      .map((f) => {
        const nameLower = f.name.toLowerCase();
        const pathLower = f.path.toLowerCase();
        let score = 0;
        
        if (nameLower.includes(q)) score += 100;
        else if (pathLower.includes(q)) score += 50;
        else if (isFuzzyMatch(nameLower, q)) score += 10;
        else if (isFuzzyMatch(pathLower, q)) score += 5;
        
        return { file: f, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.file);
  }, [effectiveFiles, searchQuery]);

  const tree = useMemo(() => buildFileTree(filteredFiles), [filteredFiles]);

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleOpen = useCallback((path: string, defaultOpen: boolean) => {
    setExpandedFolders(prev => {
      const current = prev[path] ?? defaultOpen;
      return { ...prev, [path]: !current };
    });
  }, []);

  const flatNodes = useMemo(() => {
    const result: FlatNode[] = [];
    const rootState = tree.state === "selected" && tree.files.length === filteredFiles.length
      ? "selected" : tree.state === "partial" ? "partial" : "unselected";
    
    // When searching, always show the root row and expand all
    result.push({ type: 'root', name: rootName, state: rootState });

    const traverse = (node: TreeNode, depth: number, prefix: string, forceOpen: boolean) => {
      for (const child of node.children) {
        const path = prefix ? `${prefix}/${child.name}` : child.name;
        const defaultOpen = depth < 1;
        // Force all folders open when searching
        const isOpen = forceOpen || (expandedFolders[path] ?? defaultOpen);
        
        result.push({ type: 'dir', node: child, depth, path, open: isOpen || forceOpen });
        
        if (isOpen || forceOpen) {
          traverse(child, depth + 1, path, forceOpen);
        }
      }
      for (const file of node.files) {
        result.push({ type: 'file', file, depth });
      }
    };

    traverse(tree, 0, "", !!searchQuery.trim());
    return result;
  }, [tree, expandedFolders, rootName, filteredFiles.length, searchQuery]);

  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: flatNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32, // approx 32px per row (py-1.5 = 12px padding + 20px line height)
    overscan: 20,
  });

  return (
    <>
      <div className="flex shrink-0 items-center border-b border-hairline bg-[#050505] px-6 py-2 text-xs font-semibold uppercase tracking-wider text-muted">
        <div className={colGrid}>
          <span>
            Name
            {searchQuery && (
              <span className="ml-2 font-normal normal-case text-accent">
                — {filteredFiles.length} result{filteredFiles.length !== 1 ? "s" : ""}
              </span>
            )}
          </span>
          <span>Status</span>
          <span>Type</span>
          <span className="text-right">Size</span>
        </div>
      </div>

      {filteredFiles.length === 0 && searchQuery ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-sm text-muted">
          <span>No files match &ldquo;{searchQuery}&rdquo;</span>
        </div>
      ) : (
        <div ref={parentRef} className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar relative">
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const item = flatNodes[virtualItem.index];
              const style = {
                position: 'absolute' as const,
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              };

              if (item.type === 'root') {
                return <RootRow key={virtualItem.key} name={item.name} state={item.state} onToggle={() => toggleFolder("")} style={style} />;
              } else if (item.type === 'dir') {
                return <DirRow key={virtualItem.key} node={item.node} depth={item.depth} open={item.open} onToggleOpen={() => toggleOpen(item.path, item.depth < 1)} style={style} searchQuery={searchQuery} />;
              } else {
                return <FileRow key={virtualItem.key} file={item.file} depth={item.depth} style={style} searchQuery={searchQuery} onToggleRequest={handleToggleRequest} globalExcludes={globalExcludes} />;
              }
            })}
          </div>
        </div>
      )}

      <Dialog open={!!forceIncludeFile} onOpenChange={(open) => !open && setForceIncludeFile(null)}>
        <DialogContent className="sm:max-w-[425px] bg-canvas text-ink border-hairline">
          <DialogHeader>
            <DialogTitle>Force Include File?</DialogTitle>
            <DialogDescription className="text-muted mt-2">
              <span className="font-mono text-sm text-ink">{forceIncludeFile?.name}</span> is excluded by default (e.g. it is a lockfile, binary, or ignored file). 
              Including it will consume extra tokens and may generate massive, useless context noise for LLMs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setForceIncludeFile(null)} className="border-hairline hover:bg-white/5">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (forceIncludeFile) {
                  toggleFile(forceIncludeFile.path);
                  setForceIncludeFile(null);
                }
              }} 
              className="bg-accent text-accent-foreground hover:bg-accent-hover"
            >
              Force Include
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
