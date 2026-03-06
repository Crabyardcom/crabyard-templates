import { invoke } from "@tauri-apps/api/core";
import type { AuthStatus, DeviceCodeResponse, AppSettings } from "./types";

// ─── Auth commands ─────────────────────────────────────────────────────────

export async function login(): Promise<DeviceCodeResponse> {
  return invoke("login");
}

export async function pollAuth(
  deviceCode: string,
  interval: number
): Promise<AuthStatus> {
  return invoke("poll_auth", { deviceCode, interval });
}

export async function logout(): Promise<void> {
  return invoke("logout");
}

export async function getAuthStatus(): Promise<AuthStatus> {
  return invoke("get_auth_status");
}

export async function restoreAuth(): Promise<AuthStatus> {
  return invoke("restore_auth");
}

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
