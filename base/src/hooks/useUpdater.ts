import { useState, useCallback, useEffect } from "react";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

interface UpdateState {
  available: boolean;
  version: string | null;
  body: string | null;
  downloading: boolean;
  progress: number;
  error: string | null;
}

const initial: UpdateState = {
  available: false,
  version: null,
  body: null,
  downloading: false,
  progress: 0,
  error: null,
};

export function useUpdater() {
  const [state, setState] = useState<UpdateState>(initial);

  const checkForUpdate = useCallback(async () => {
    try {
      const update = await check();
      if (update) {
        setState((s) => ({
          ...s,
          available: true,
          version: update.version,
          body: update.body ?? null,
        }));
      }
    } catch (e) {
      console.error("Update check failed:", e);
    }
  }, []);

  const installUpdate = useCallback(async () => {
    setState((s) => ({ ...s, downloading: true, error: null }));
    try {
      const update = await check();
      if (!update) return;

      let total = 0;
      let downloaded = 0;

      await update.downloadAndInstall((event) => {
        if (event.event === "Started" && event.data.contentLength) {
          total = event.data.contentLength;
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          if (total > 0) {
            setState((s) => ({
              ...s,
              progress: Math.round((downloaded / total) * 100),
            }));
          }
        } else if (event.event === "Finished") {
          setState((s) => ({ ...s, progress: 100 }));
        }
      });

      await relaunch();
    } catch (e) {
      setState((s) => ({
        ...s,
        downloading: false,
        error: e instanceof Error ? e.message : "Update failed",
      }));
    }
  }, []);

  const dismiss = useCallback(() => {
    setState(initial);
  }, []);

  useEffect(() => {
    checkForUpdate();
  }, [checkForUpdate]);

  return { ...state, checkForUpdate, installUpdate, dismiss };
}
