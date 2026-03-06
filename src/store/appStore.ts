import { create } from "zustand";
import type { AuthStatus, AppSettings } from "@/lib/types";

interface AppState {
  auth: AuthStatus;
  authLoading: boolean;

  settings: AppSettings;
  settingsLoading: boolean;

  setAuth: (auth: AuthStatus) => void;
  setAuthLoading: (loading: boolean) => void;
  setSettings: (settings: AppSettings) => void;
  setSettingsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  auth: { authenticated: false, username: null, avatarUrl: null },
  authLoading: true,

  settings: {
    workspaceRoot: null,
    theme: null,
    launchAtStartup: false,
  },
  settingsLoading: true,

  setAuth: (auth) => set({ auth }),
  setAuthLoading: (authLoading) => set({ authLoading }),
  setSettings: (settings) => set({ settings }),
  setSettingsLoading: (settingsLoading) => set({ settingsLoading }),
}));
