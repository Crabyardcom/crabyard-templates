import { platform } from "@tauri-apps/plugin-os";

export type DesktopPlatform = "macos" | "windows" | "linux";

export function getDesktopPlatform(): DesktopPlatform {
  const p = platform();
  if (p === "macos") return "macos";
  if (p === "linux") return "linux";
  return "windows";
}
