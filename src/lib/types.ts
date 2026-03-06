// Auth types — mirrors Rust models/auth.rs
export interface DeviceCodeResponse {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  interval: number;
}

export interface AuthStatus {
  authenticated: boolean;
  username: string | null;
  avatarUrl: string | null;
}

// Settings — mirrors Rust models/settings.rs AppSettings
export interface AppSettings {
  workspaceRoot: string | null;
  theme: string | null;
  launchAtStartup: boolean;
}
