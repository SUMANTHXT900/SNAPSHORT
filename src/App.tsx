import { useState } from "react";
import { AppLayout } from "./layouts/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Splash } from "./pages/Splash";
import { Workspace } from "./pages/Workspace";
import { UpdateNotifier } from "./components/UpdateNotifier";
import { Toaster } from "sonner";

type View = "splash" | "dashboard" | "workspace";

export default function App() {
  const [view, setView] = useState<View>("splash");
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);

  return (
    <AppLayout>
      <Toaster theme="dark" position="bottom-right" />
      <UpdateNotifier />
      {view === "splash" && <Splash onDone={() => setView("dashboard")} />}
      {view === "dashboard" && (
        <Dashboard
          onStart={(path) => {
            setWorkspacePath(path);
            setView("workspace");
          }}
        />
      )}
      {view === "workspace" && (
        <Workspace
          projectPath={workspacePath ?? ""}
          onBack={() => {
            setView("dashboard");
            setWorkspacePath(null);
          }}
        />
      )}
    </AppLayout>
  );
}
