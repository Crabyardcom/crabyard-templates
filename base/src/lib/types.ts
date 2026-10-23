// CRABYARD:AUTH_TYPES

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export interface LocalDocument {
  schemaVersion: number;
  revision: number;
  data: JsonValue;
}

// Settings — mirrors Rust models/settings.rs AppSettings
export interface AppSettings {
  workspaceRoot: string | null;
  theme: string | null;
  launchAtStartup: boolean;
}
