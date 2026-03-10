import { useState } from "react";
import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelLeft } from "lucide-react";

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  sidebarWidth?: string;
  collapsedWidth?: string;
  className?: string;
}

export function SidebarLayout({
  sidebar,
  children,
  defaultCollapsed = false,
  sidebarWidth = "w-64",
  collapsedWidth = "w-0",
  className,
}: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={cn("flex h-full overflow-hidden", className)}>
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 overflow-hidden",
          collapsed ? collapsedWidth : sidebarWidth
        )}
      >
        {!collapsed && (
          <div className="flex h-full flex-col overflow-y-auto p-3">
            {sidebar}
          </div>
        )}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
