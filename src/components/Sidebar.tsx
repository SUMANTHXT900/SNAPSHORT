import packageJson from "../../package.json";
import { Layers, LayoutDashboard, History, Settings, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: typeof LayoutDashboard;
  active?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "History", icon: History },
  { label: "Settings", icon: Settings },
  { label: "About", icon: Info },
];

interface SidebarProps {
  className?: string;
  activeView?: "dashboard" | "history" | "settings" | "about";
  onNavigate?: (view: SidebarProps["activeView"]) => void;
}

export function Sidebar({ className, activeView = "dashboard", onNavigate }: SidebarProps) {
  return (
    <nav
      className={cn(
        "fixed left-0 top-0 z-sticky flex h-screen w-64 flex-col gap-2 border-r border-hairline bg-canvas p-8",
        className,
      )}
    >
      {/* Brand header */}
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-hairline bg-transparent">
          <Layers className="h-4 w-4 text-ink" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="font-headline text-xl font-semibold text-ink">Snapshort</h1>
          <p className="mt-1 font-label text-xs font-medium text-muted tracking-wider">V {packageJson.version}</p>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = item.label.toLowerCase() === activeView;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate?.(item.label.toLowerCase() as SidebarProps["activeView"])}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-left font-label text-xs font-medium tracking-wider transition-all duration-200 active:scale-95",
                active
                  ? "bg-accent-muted text-accent"
                  : "text-muted hover:text-ink hover:bg-accent-muted",
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={active ? 2.5 : 2} />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
