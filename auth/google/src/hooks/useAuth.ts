import { useCallback, useState } from "react";
import { useAppStore } from "@/store/appStore";
import * as api from "@/lib/tauri";

export function useAuth() {
  const { auth, authLoading, setAuth, setAuthLoading } = useAppStore();
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const restore = useCallback(async () => {
    setAuthLoading(true);
    try {
      const status = await api.restoreAuth();
      setAuth(status);
    } catch {
      setAuth({ authenticated: false, username: null, avatarUrl: null });
    } finally {
      setAuthLoading(false);
    }
  }, [setAuth, setAuthLoading]);

  const startLogin = useCallback(async (): Promise<string | null> => {
    setError(null);
    setPolling(true);
    try {
      const authUrl = await api.login();

      const pollStatus = async () => {
        await new Promise((r) => setTimeout(r, 2000));
        const status = await api.getAuthStatus();
        if (status.authenticated) {
          setAuth(status);
          setPolling(false);
          return;
        }
        pollStatus();
      };
      pollStatus();

      return authUrl;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPolling(false);
      return null;
    }
  }, [setAuth]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setAuth({ authenticated: false, username: null, avatarUrl: null });
    }
  }, [setAuth]);

  return {
    auth,
    authLoading,
    polling,
    error,
    restore,
    startLogin,
    logout,
  };
}
