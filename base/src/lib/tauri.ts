import { invoke } from "@tauri-apps/api/core";
import type { AppSettings } from "./types";

// TAURIKIT:AUTH_IMPORTS

// TAURIKIT:AUTH_COMMANDS

// ─── Settings commands ──────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  return invoke("get_settings");
}

export async function setSettings(settings: AppSettings): Promise<void> {
  return invoke("set_settings", { settings });
}

export async function selectWorkspaceFolder(): Promise<string | null> {
  return invoke("select_workspace_folder");
}
