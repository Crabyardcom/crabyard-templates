import { mockIPC, mockWindows } from "@tauri-apps/api/mocks";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setupBrowserPreview } from "@/lib/browserPreview";

vi.mock("@tauri-apps/api/mocks", () => ({ mockIPC: vi.fn(), mockWindows: vi.fn() }));

beforeEach(() => localStorage.clear());

describe("browser development preview", () => {
  it("initializes synchronous platform metadata before application modules load", () => {
    setupBrowserPreview();
    expect(mockWindows).toHaveBeenCalledWith("main");
    expect(Reflect.get(window, "__TAURI_OS_PLUGIN_INTERNALS__")).toMatchObject({ platform: "windows", version: "Browser preview" });
  });

  it("persists preview preferences separately from native application data", async () => {
    setupBrowserPreview();
    const callback = vi.mocked(mockIPC).mock.calls[0][0];
    callback("set_settings", { settings: { theme: "dark" } });
    expect(await callback("get_settings", {})).toEqual({ theme: "dark" });
    expect(localStorage.getItem("crabyard-preview-settings")).toBe('{"theme":"dark"}');
  });

  it("does not simulate successful OAuth or native folder selection", () => {
    setupBrowserPreview();
    const callback = vi.mocked(mockIPC).mock.calls[0][0];
    expect(() => callback("login", {})).toThrow("requires the desktop runtime");
    expect(() => callback("select_workspace_folder", {})).toThrow("requires the desktop runtime");
  });
});
