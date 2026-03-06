import { useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import * as api from "@/lib/tauri";
import type { AppSettings } from "@/lib/types";

export function useSettings() {
  const { settings, settingsLoading, setSettings, setSettingsLoading } =
    useAppStore();

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const s = await api.getSettings();
      setSettings(s);
    } catch {
      // use defaults
    } finally {
      setSettingsLoading(false);
    }
  }, [setSettings, setSettingsLoading]);

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      const updated = { ...settings, ...partial };
      setSettings(updated);
      try {
        await api.setSettings(updated);
      } catch (e) {
        console.error("Failed to save settings:", e);
      }
    },
    [settings, setSettings]
  );

  const pickFolder = useCallback(async () => {
    try {
      const folder = await api.selectWorkspaceFolder();
      if (folder) {
        await updateSettings({ workspaceRoot: folder });
      }
      return folder;
    } catch (e) {
      console.error("Failed to select folder:", e);
      return null;
    }
  }, [updateSettings]);

  return {
    settings,
    settingsLoading,
    loadSettings,
    updateSettings,
    pickFolder,
  };
}
