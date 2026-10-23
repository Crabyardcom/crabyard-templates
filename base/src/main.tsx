import React from "react";
import ReactDOM from "react-dom/client";
import { isTauri } from "@tauri-apps/api/core";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

async function start() {
  const preview = import.meta.env.DEV && !isTauri();
  if (preview) {
    const { setupBrowserPreview } = await import("./lib/browserPreview");
    setupBrowserPreview();
  }
  const { default: App } = await import("./App");
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      {preview && <div className="fixed bottom-2 left-2 z-[100] rounded border border-border bg-background px-2 py-1 text-[10px] text-muted-foreground">Browser preview · native integrations disabled</div>}
    </ErrorBoundary>
  </React.StrictMode>,
);
}

void start();
