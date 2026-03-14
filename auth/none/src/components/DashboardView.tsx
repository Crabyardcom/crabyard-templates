import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OnboardingTour } from "@/components/OnboardingTour";
import {
  Rocket,
  FolderOpen,
  Terminal,
  Puzzle,
  BookOpen,
  Cpu,
  MonitorSmartphone,
  Palette,
} from "lucide-react";
import { arch, platform, version as osVersion } from "@tauri-apps/plugin-os";
import { getVersion } from "@tauri-apps/api/app";
import { openUrl } from "@tauri-apps/plugin-opener";

interface SystemInfo {
  platform: string;
  arch: string;
  osVersion: string;
  appVersion: string;
}

const quickLinks = [
  {
    title: "Project Structure",
    description: "Frontend in src/, Rust backend in src-tauri/",
    icon: FolderOpen,
  },
  {
    title: "Add Features",
    description: "Run crabyard add <feature> to extend your app",
    icon: Puzzle,
  },
  {
    title: "Dev Commands",
    description: "Use your package manager to run dev, build, test",
    icon: Terminal,
  },
  {
    title: "Customize Theme",
    description: "Edit src/index.css to change colors and styling",
    icon: Palette,
  },
];

export function DashboardView() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, a, ov, av] = await Promise.all([
          platform(),
          arch(),
          osVersion(),
          getVersion(),
        ]);
        setSystemInfo({ platform: p, arch: a, osVersion: ov, appVersion: av });
      } catch {
        // OS info unavailable
      }
    })();
  }, []);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <OnboardingTour />

      <div className="mx-auto w-full max-w-4xl space-y-8 p-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {import.meta.env.VITE_APP_NAME}
              </h1>
              <p className="text-sm text-muted-foreground">
                Your desktop app is running. Start building something great.
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Start Grid */}
        <div>
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            Quick Start
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map((link) => (
              <Card key={link.title} className="group hover:border-primary/30 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <link.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{link.title}</CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        {link.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Available Features */}
        <div>
          <h2 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wider">
            Extend Your App
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Puzzle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    Add capabilities with one command
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Notifications, clipboard, SQLite, file system, global shortcuts, and more.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {["notifications", "clipboard", "sql", "fs", "http", "log"].map((f) => (
                      <Badge key={f} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {f}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      +18 more
                    </Badge>
                  </div>
                </div>
                <code className="rounded-md bg-muted px-3 py-1.5 text-xs font-mono whitespace-nowrap">
                  crabyard add &lt;feature&gt;
                </code>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Info + Resources */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">System</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {systemInfo ? (
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-muted-foreground">Platform</span>
                  <span className="font-medium capitalize">{systemInfo.platform}</span>
                  <span className="text-muted-foreground">Architecture</span>
                  <span className="font-medium">{systemInfo.arch}</span>
                  <span className="text-muted-foreground">OS Version</span>
                  <span className="font-medium">{systemInfo.osVersion}</span>
                  <span className="text-muted-foreground">App Version</span>
                  <span className="font-medium">v{systemInfo.appVersion}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MonitorSmartphone className="h-3.5 w-3.5" />
                  <span>Loading system info…</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => openUrl("https://v2.tauri.app")}
              >
                Tauri v2 Documentation
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => openUrl("https://crabyard.com/docs")}
              >
                Crabyard Documentation
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs h-8"
                onClick={() => openUrl("https://github.com/nicholasgriffintn/tauri-starter")}
              >
                Source on GitHub
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Edit{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
            src/components/DashboardView.tsx
          </code>{" "}
          to replace this with your app's UI.
        </p>
      </div>
    </div>
  );
}
