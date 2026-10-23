import { mockIPC, mockWindows } from "@tauri-apps/api/mocks";

export function setupBrowserPreview() {
  mockWindows("main");
  Object.defineProperty(window, "__TAURI_OS_PLUGIN_INTERNALS__", {
    configurable: true,
    value: { platform: "windows", arch: "x86_64", version: "Browser preview", family: "windows", os_type: "windows", eol: "\r\n" },
  });
  mockIPC((command, payload = {}) => {
    switch (command) {
      case "get_settings":
        return JSON.parse(localStorage.getItem("crabyard-preview-settings") ?? '{"workspaceRoot":null,"theme":null,"launchAtStartup":false}');
      case "set_settings":
        if (!("settings" in payload)) throw new Error("Missing preview settings.");
        localStorage.setItem("crabyard-preview-settings", JSON.stringify(payload.settings));
        return;
      case "select_workspace_folder":
        throw new Error("Folder selection requires the desktop runtime.");
      case "plugin:app|version":
        return "{{APP_VERSION}}";
      case "plugin:store|load":
        return 1;
      case "plugin:store|get":
        return [true, true];
      case "get_auth_status":
      case "restore_auth":
        return { authenticated: false, username: null, avatarUrl: null };
      case "login":
        throw new Error("OAuth sign-in requires the desktop runtime.");
      case "plugin:window|is_maximized":
        return false;
      default:
        if (command.startsWith("plugin:window|") || command.startsWith("plugin:store|") || command === "plugin:opener|open_url") return;
        throw new Error(`${command} requires the desktop runtime.`);
    }
  }, { shouldMockEvents: true });
}
