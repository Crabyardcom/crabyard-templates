import { useCallback, useState } from "react";
import { useAppStore } from "@/store/appStore";
import * as api from "@/lib/tauri";
import type { DeviceCodeResponse } from "@/lib/types";
import { openUrl } from "@tauri-apps/plugin-opener";

export function useAuth() {
  const { auth, authLoading, setAuth, setAuthLoading } = useAppStore();
  const [deviceCode, setDeviceCode] = useState<DeviceCodeResponse | null>(null);
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

  const startLogin = useCallback(async () => {
    setError(null);
    try {
      const code = await api.login();
      setDeviceCode(code);
      // Open the provider's verification page in the system browser
      await openUrl(code.verificationUri);

      setPolling(true);
      try {
        const status = await api.pollAuth(code.deviceCode, code.interval);
        setAuth(status);
        setDeviceCode(null);
      } catch (e) {
        setError(String(e));
      } finally {
        setPolling(false);
      }
    } catch (e) {
      setError(String(e));
    }
  }, [setAuth]);

  const doLogout = useCallback(async () => {
    try {
      await api.logout();
      setAuth({ authenticated: false, username: null, avatarUrl: null });
    } catch (e) {
      setError(String(e));
    }
  }, [setAuth]);

  return {
    auth,
    authLoading,
    deviceCode,
    polling,
    error,
    restore,
    startLogin,
    logout: doLogout,
  };
}
