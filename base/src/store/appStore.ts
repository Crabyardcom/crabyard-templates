import { create } from "zustand";
// CRABYARD:STORE_AUTH_IMPORT
import type { AppSettings } from "@/lib/types";

interface AppState {
  // CRABYARD:STORE_AUTH_STATE

  settings: AppSettings;
  settingsLoading: boolean;

  // CRABYARD:STORE_AUTH_SETTERS
  setSettings: (settings: AppSettings) => void;
  setSettingsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // CRABYARD:STORE_AUTH_DEFAULTS

  settings: {
    workspaceRoot: null,
    theme: null,
    launchAtStartup: false,
  },
  settingsLoading: true,

  // CRABYARD:STORE_AUTH_SETTER_IMPLS
  setSettings: (settings) => set({ settings }),
  setSettingsLoading: (settingsLoading) => set({ settingsLoading }),
}));
