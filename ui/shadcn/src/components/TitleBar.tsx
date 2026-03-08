import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState, useEffect } from "react";
import { Minus, Square, X, Copy } from "lucide-react";
import { getDesktopPlatform } from "@/lib/platform";

const os = getDesktopPlatform();

function MacControls({
  onClose,
  onMinimize,
  onToggleMaximize,
}: {
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}) {
  return (
    <div className="flex items-center gap-2 pl-3" data-window-control>
      <button
        onClick={onClose}
        className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f57] transition-opacity hover:opacity-90"
      >
        <X className="h-1.5 w-1.5 stroke-[3] text-[#4d0000] opacity-0 group-hover:opacity-100" />
      </button>
      <button
        onClick={onMinimize}
        className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#febc2e] transition-opacity hover:opacity-90"
      >
        <Minus className="h-1.5 w-1.5 stroke-[3] text-[#5e4000] opacity-0 group-hover:opacity-100" />
      </button>
      <button
        onClick={onToggleMaximize}
        className="group flex h-3 w-3 items-center justify-center rounded-full bg-[#28c840] transition-opacity hover:opacity-90"
      >
        <Square className="h-1.5 w-1.5 stroke-[3] text-[#0a4a00] opacity-0 group-hover:opacity-100" />
      </button>
    </div>
  );
}

function LinuxControls({
  maximized,
  onClose,
  onMinimize,
  onToggleMaximize,
}: {
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}) {
  return (
    <div className="flex items-center" data-window-control>
      <button
        onClick={onMinimize}
        className="inline-flex h-8 w-9 items-center justify-center text-muted-foreground hover:bg-accent/80 rounded-full transition-colors"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onToggleMaximize}
        className="inline-flex h-8 w-9 items-center justify-center text-muted-foreground hover:bg-accent/80 rounded-full transition-colors"
      >
        {maximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
      </button>
      <button
        onClick={onClose}
        className="inline-flex h-8 w-9 items-center justify-center text-muted-foreground hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors mr-1"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function WindowsControls({
  maximized,
  onClose,
  onMinimize,
  onToggleMaximize,
}: {
  maximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
}) {
  return (
    <>
      <button
        data-window-control
        onClick={onMinimize}
        className="inline-flex h-8 w-11 items-center justify-center text-muted-foreground hover:bg-accent/80 transition-colors"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        data-window-control
        onClick={onToggleMaximize}
        className="inline-flex h-8 w-11 items-center justify-center text-muted-foreground hover:bg-accent/80 transition-colors"
      >
        {maximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
      </button>
      <button
        data-window-control
        onClick={onClose}
        className="inline-flex h-8 w-11 items-center justify-center text-muted-foreground hover:bg-red-500 hover:text-white transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </>
  );
}

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);
  const appWindow = getCurrentWindow();

  useEffect(() => {
    appWindow.isMaximized().then(setMaximized);
  }, []);

  const handleMinimize = () => appWindow.minimize();
  const handleToggleMaximize = async () => {
    await appWindow.toggleMaximize();
    setMaximized(await appWindow.isMaximized());
  };
  const handleClose = () => appWindow.close();

  return (
    <div
      className="flex h-8 shrink-0 items-center bg-background/80 select-none"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("[data-window-control]")) return;
        appWindow.startDragging();
      }}
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-window-control]")) return;
        handleToggleMaximize();
      }}
    >
      {os === "macos" && (
        <MacControls
          onClose={handleClose}
          onMinimize={handleMinimize}
          onToggleMaximize={handleToggleMaximize}
        />
      )}
      {os === "macos" ? (
        <span className="absolute inset-x-0 text-center text-[11px] text-muted-foreground/70 font-medium tracking-tight pointer-events-none">
          {import.meta.env.VITE_APP_NAME}
        </span>
      ) : (
        <span className="pl-3 text-[11px] text-muted-foreground/70 font-medium tracking-tight">
          {import.meta.env.VITE_APP_NAME}
        </span>
      )}
      <div className="flex-1" />
      {os === "linux" && (
        <LinuxControls
          maximized={maximized}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onToggleMaximize={handleToggleMaximize}
        />
      )}
      {os === "windows" && (
        <WindowsControls
          maximized={maximized}
          onClose={handleClose}
          onMinimize={handleMinimize}
          onToggleMaximize={handleToggleMaximize}
        />
      )}
    </div>
  );
}
