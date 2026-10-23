import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const manager = "{{PACKAGE_MANAGER}}";
const command = process.platform === "win32" && manager !== "bun" ? `${manager}.cmd` : manager;
let args;

switch (manager) {
  case "npm":
    args = existsSync("package-lock.json") ? ["ci"] : ["install"];
    break;
  case "bun":
    args = ["install"];
    if (existsSync("bun.lock") || existsSync("bun.lockb")) args.push("--frozen-lockfile");
    break;
  case "pnpm":
    args = ["install", existsSync("pnpm-lock.yaml") ? "--frozen-lockfile" : "--no-frozen-lockfile"];
    break;
  case "yarn": {
    const version = spawnSync(command, ["--version"], {
      encoding: "utf8",
      shell: process.platform === "win32",
    });
    if (version.status !== 0) throw new Error("Unable to determine Yarn version");
    args = ["install"];
    if (existsSync("yarn.lock")) {
      args.push(version.stdout.trim().startsWith("1.") ? "--frozen-lockfile" : "--immutable");
    }
    break;
  }
  default:
    throw new Error(`Unsupported package manager: ${manager}`);
}

const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
