import { useCallback } from "react";
import { useAppStore } from "@/store/appStore";
import * as api from "@/lib/tauri";
import type { AppSettings } from "@/lib/types";
import { toast } from "sonner";

export function useSettings() {
  const { settings, settingsLoading, setSettings, setSettingsLoading } =
    useAppStore();

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const s = await api.getSettings();
      setSettings(s);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Could not load your preferences. Try again before changing settings.");
    } finally {
      setSettingsLoading(false);
    }
  }, [setSettings, setSettingsLoading]);

  const updateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      const previous = useAppStore.getState().settings;
      const updated = { ...previous, ...partial };
      setSettings(updated);
      try {
        await api.setSettings(updated);
        return true;
      } catch (e) {
        if (useAppStore.getState().settings === updated) setSettings(previous);
        console.error("Failed to save settings:", e);
        toast.error("Your preferences could not be saved. Please try again.");
        return false;
      }
    },
    [setSettings]
  );

  const pickFolder = useCallback(async () => {
    try {
      const folder = await api.selectWorkspaceFolder();
      if (folder) {
        const saved = await updateSettings({ workspaceRoot: folder });
        if (!saved) return null;
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
