import { invoke } from "@tauri-apps/api/core";
import type { AppSettings } from "./types";

// TAURIKIT:AUTH_IMPORTS

type CommandMap = {
  get_settings: [void, AppSettings];
  set_settings: [{ settings: AppSettings }, void];
  select_workspace_folder: [void, string | null];
  // TAURIKIT:COMMAND_TYPES
};

type CommandName = keyof CommandMap;
type CommandArgs<T extends CommandName> = CommandMap[T][0];
type CommandReturn<T extends CommandName> = CommandMap[T][1];

export function invokeCommand<T extends CommandName>(
  ...args: CommandArgs<T> extends void ? [cmd: T] : [cmd: T, payload: CommandArgs<T>]
): Promise<CommandReturn<T>> {
  const [cmd, payload] = args;
  return invoke<CommandReturn<T>>(cmd, payload as Record<string, unknown>);
}

// TAURIKIT:AUTH_COMMANDS

// ─── Settings commands ──────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  return invokeCommand("get_settings");
}

export async function setSettings(settings: AppSettings): Promise<void> {
  return invokeCommand("set_settings", { settings });
}

export async function selectWorkspaceFolder(): Promise<string | null> {
  return invokeCommand("select_workspace_folder");
}
