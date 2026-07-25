import { useState } from "react";
import { Info, Github, Sparkles, Target, Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import packageJson from "../../package.json";

export function AboutView() {
  const [checking, setChecking] = useState(false);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    try {
      const { check } = await import("@tauri-apps/plugin-updater");
      const update = await check();
      if (update) {
        window.dispatchEvent(new CustomEvent("snapshort:open-update-modal", { detail: update }));
      } else {
        toast.success("✨ You are running the latest version of Snapshort!");
      }
    } catch (error: any) {
      console.error("Update check failed:", error);
      const errMsg = error?.toString() || "Unknown error occurred";
      if (errMsg.includes("did not respond with a successful status code") || errMsg.includes("404")) {
        toast.error("Update Check Failed: Endpoint unreachable (No releases published on GitHub yet or network offline).");
      } else {
        toast.error(`Update check failed: ${errMsg}`);
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-col max-w-4xl mx-auto w-full pb-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-muted">
          <Info className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-ink">About Snapshort</h1>
          <p className="text-sm text-muted mt-1">Version {packageJson.version}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Why Snapshort & Core Use Case ───────────────── */}
        <div className="rounded-xl border border-accent/30 bg-[#111111]/90 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] md:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent shadow-inner">
              <Target className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-lg font-semibold text-ink">Why Snapshort? The Core Use Case</h2>
          </div>

          <p className="text-sm text-ink-bright leading-relaxed mb-4 font-medium">
            Let's be candid: Snapshort is not designed for every single AI coding workflow.
          </p>

          <div className="space-y-3.5 text-sm text-muted leading-relaxed">
            <p>
              If you are developing directly inside an IDE equipped with native AI agent plugins or command-line autonomous agents that already have live read/write access to your local filesystem, you simply do not need to manually generate snapshots of your codebase.
            </p>

            <div className="rounded-xl bg-black p-4 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.9)] my-4">
              <p className="font-semibold text-accent text-sm mb-1.5 flex items-center gap-2">
                <Globe className="h-4 w-4 text-accent shrink-0" />
                When Snapshort Becomes Indispensable:
              </p>
              <p className="text-ink text-sm leading-relaxed">
                When you want to perform deep architectural audits, comprehensive code reviews, complex refactoring, or bug hunting using <strong className="text-ink-bright font-semibold">Web-based LLM Chats</strong> (such as <strong className="text-accent/90 font-medium">Claude.ai, ChatGPT Web, Gemini Web, DeepSeek, or Google AI Studio</strong>) and cloud sandboxes that <strong className="text-ink-bright underline decoration-accent/50 underline-offset-4">do not have direct access to your local computer's filesystem</strong>.
              </p>
            </div>

            <p>
              Instead of tediously copy-pasting dozens of scattered files one-by-one or uploading messy ZIP archives that overwhelm AI tokenizers, Snapshort compiles your entire coding project into a single, structured, token-optimized context document (Markdown or XML) in milliseconds—ready to drop straight into any browser chat window!
            </p>
          </div>
        </div>

        {/* ── The Ultimate LLM Context Builder ────────────── */}
        <div className="rounded-xl border border-hairline bg-surface p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink mb-2">The Ultimate Context Packager</h2>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              Snapshort operates on a strict "Zero Trimming / No Hard Limits" philosophy. 
              It intelligently bundles your codebase while filtering out node_modules, binaries, and temporary build debris, ensuring high-fidelity recall across frontier AI models.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <a href="https://github.com/SUMANTHXT900/SNAPSHORT.git" target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-ink hover:text-accent shadow-[0_4px_15px_rgba(0,0,0,0.8)] hover:shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all">
              <Github className="h-4 w-4" />
              GitHub Repository
            </a>
            <button
              onClick={handleCheckForUpdates}
              disabled={checking}
              className="inline-flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-accent/20 hover:border-accent/40 shadow-[0_0_15px_rgba(37,99,235,0.15)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              {checking ? "Checking..." : "Check for Updates"}
            </button>
          </div>
        </div>

        {/* ── Core Architecture ───────────────────────────── */}
        <div className="rounded-xl border border-hairline bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-ink mb-4">Core Architecture</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-xs">✓</div>
              <div>
                <p className="text-sm font-medium text-ink">Blazing Fast Rust & Tauri Core</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">Powered by Tauri v2 and high-speed parallel file tree scanning via Rust Rayon.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-xs">✓</div>
              <div>
                <p className="text-sm font-medium text-ink">Intelligent Noise Filtering</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">Automatically respects .gitignore and strips binary assets, logs, and build packages.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent font-bold text-xs">✓</div>
              <div>
                <p className="text-sm font-medium text-ink">Automated Context Chunking</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">Automatically partitions oversized codebases into numbered multi-part files when exceeding platform limits.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* ── Roadmap: Version 2.0 ────────────────────────── */}
        <div className="rounded-xl border border-hairline bg-surface p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-ink">Roadmap: Coming in Version 2.0</h2>
          </div>
          <p className="text-sm text-muted mb-4 leading-relaxed">
            We are continuing to expand Snapshort's capabilities. Here is what we are bringing in our upcoming v2 release:
          </p>
          <div className="rounded-xl border border-white/5 bg-black p-5 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-ink">Changes Snapshot (Incremental Git Diffs)</span>
              <span className="rounded-full bg-accent/20 border border-accent/30 px-2.5 py-0.5 text-xs font-semibold text-accent">In Development</span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Generate targeted snapshots containing exclusively files that have changed since your last reference baseline or Git commit. This feature is currently under active development and has been intentionally disabled in v1 to ensure absolute precision and seamless incremental AI discussions in v2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
