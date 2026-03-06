import { getCurrentWindow } from "@tauri-apps/api/window";
import { useState, useEffect } from "react";
import { Minus, Square, X, Copy } from "lucide-react";

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
        onClick={handleMinimize}
        className="inline-flex h-8 w-11 items-center justify-center text-base-content/60 hover:bg-base-300 transition-colors"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <button
        data-window-control
        onClick={handleToggleMaximize}
        className="inline-flex h-8 w-11 items-center justify-center text-base-content/60 hover:bg-base-300 transition-colors"
      >
        {maximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
      </button>
      <button
        data-window-control
        onClick={handleClose}
        className="inline-flex h-8 w-11 items-center justify-center text-base-content/60 hover:bg-error hover:text-error-content transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
