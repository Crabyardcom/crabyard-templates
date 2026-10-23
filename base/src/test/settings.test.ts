import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSettings } from "@/hooks/useSettings";
import * as api from "@/lib/tauri";
import { useAppStore } from "@/store/appStore";

vi.mock("@/lib/tauri", () => ({
  getSettings: vi.fn(),
  setSettings: vi.fn(),
  selectWorkspaceFolder: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

const defaults = { workspaceRoot: null, theme: null, launchAtStartup: false };

beforeEach(() => {
  useAppStore.setState({ settings: defaults, settingsLoading: true });
});

describe("settings workflow", () => {
  it("restores preferences and clears the loading state", async () => {
    vi.mocked(api.getSettings).mockResolvedValueOnce({ ...defaults, theme: "dark" });
    const { result } = renderHook(() => useSettings());
    await act(() => result.current.loadSettings());
    expect(result.current.settings.theme).toBe("dark");
    expect(result.current.settingsLoading).toBe(false);
  });

  it("rolls back preferences when persistence fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(api.setSettings).mockRejectedValueOnce(new Error("Disk full"));
    const { result } = renderHook(() => useSettings());
    await act(async () => {
      expect(await result.current.updateSettings({ theme: "dark" })).toBe(false);
    });
    expect(result.current.settings).toEqual(defaults);
  });

  it("does not save a preference when the folder dialog is cancelled", async () => {
    vi.mocked(api.selectWorkspaceFolder).mockResolvedValueOnce(null);
    const { result } = renderHook(() => useSettings());
    await act(() => result.current.pickFolder());
    expect(api.setSettings).not.toHaveBeenCalled();
    expect(result.current.settings.workspaceRoot).toBeNull();
  });
});
