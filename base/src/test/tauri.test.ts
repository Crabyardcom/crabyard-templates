import { invoke } from "@tauri-apps/api/core";
import { describe, expect, it, vi } from "vitest";
import { getSettings, selectWorkspaceFolder, setSettings } from "@/lib/tauri";
import type { AppSettings } from "@/lib/types";

const settings: AppSettings = {
  workspaceRoot: "/projects",
  theme: "dark",
  launchAtStartup: false,
};

describe("desktop command boundary", () => {
  it("loads settings without an unexpected payload", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(settings);
    await expect(getSettings()).resolves.toEqual(settings);
    expect(invoke).toHaveBeenCalledWith("get_settings", undefined);
  });

  it("sends settings using the Rust command argument name", async () => {
    await setSettings(settings);
    expect(invoke).toHaveBeenCalledWith("set_settings", { settings });
  });

  it("preserves cancellation as a null folder", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(null);
    await expect(selectWorkspaceFolder()).resolves.toBeNull();
  });

  it("propagates backend failures to the calling workflow", async () => {
    vi.mocked(invoke).mockRejectedValueOnce("Settings are unavailable");
    await expect(getSettings()).rejects.toBe("Settings are unavailable");
  });
});
