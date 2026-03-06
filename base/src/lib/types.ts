// TAURIKIT:AUTH_TYPES

// Settings — mirrors Rust models/settings.rs AppSettings
export interface AppSettings {
  workspaceRoot: string | null;
  theme: string | null;
  launchAtStartup: boolean;
}
