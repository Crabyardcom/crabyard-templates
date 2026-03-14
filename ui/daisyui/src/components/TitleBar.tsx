import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState, useEffect } from "react";
import { Minus, Square, X, Copy, Sun, Moon } from "lucide-react";
import { getDesktopPlatform } from "@/lib/platform";
import { useTheme } from "@/hooks/useTheme";

const os = getDesktopPlatform();

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
        className="inline-flex h-8 w-9 items-center justify-center text-base-content/60 hover:bg-base-300 rounded-full transition-colors"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onToggleMaximize}
        className="inline-flex h-8 w-9 items-center justify-center text-base-content/60 hover:bg-base-300 rounded-full transition-colors"
      >
        {maximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
      </button>
      <button
        onClick={onClose}
        className="inline-flex h-8 w-9 items-center justify-center text-base-content/60 hover:bg-error hover:text-error-content rounded-full transition-colors mr-1"
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
        className="inline-flex h-8 w-11 items-center justify-center text-base-content/60 hover:bg-base-300 transition-colors"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        data-window-control
        onClick={onToggleMaximize}
        className="inline-flex h-8 w-11 items-center justify-center text-base-content/60 hover:bg-base-300 transition-colors"
      >
        {maximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
      </button>
      <button
        data-window-control
        onClick={onClose}
        className="inline-flex h-8 w-11 items-center justify-center text-base-content/60 hover:bg-error hover:text-error-content transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </>
  );
}

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);
  const appWindow = getCurrentWindow();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    appWindow.isMaximized().then(setMaximized);
  }, []);

  const handleMinimize = () => appWindow.minimize();
  const handleToggleMaximize = async () => {
    await appWindow.toggleMaximize();
    setMaximized(await appWindow.isMaximized());
  };
  const handleClose = () => appWindow.close();

  if (os === "macos") {
    return (
      <div
        className="flex h-8 shrink-0 items-center bg-base-200/80 select-none"
        onMouseDown={() => appWindow.startDragging()}
      >
        <div className="w-[72px]" />
        <span className="flex-1 text-center text-[11px] text-base-content/50 font-medium tracking-tight pointer-events-none">
          {import.meta.env.VITE_APP_NAME}
        </span>
        <button
          data-window-control
          onClick={toggleTheme}
          className="inline-flex h-8 w-8 items-center justify-center text-base-content/60 hover:bg-base-300 rounded-sm transition-colors"
        >
          {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex h-8 shrink-0 items-center bg-base-200/80 select-none"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("[data-window-control]")) return;
        appWindow.startDragging();
      }}
      onDoubleClick={(e) => {
        if ((e.target as HTMLElement).closest("[data-window-control]")) return;
        handleToggleMaximize();
      }}
    >
      <span className="pl-3 text-[11px] text-base-content/50 font-medium tracking-tight">
        {import.meta.env.VITE_APP_NAME}
      </span>
      <div className="flex-1" />
      <button
        data-window-control
        onClick={toggleTheme}
        className="inline-flex h-8 w-8 items-center justify-center text-base-content/60 hover:bg-base-300 rounded-sm transition-colors"
      >
        {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </button>
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
