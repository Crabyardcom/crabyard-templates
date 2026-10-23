import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function validateRelease({ tag, version, cargoVersion, config, platform, environment, hasLocks, auth = "none" }) {
  const errors = [];
  if (!/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(tag ?? "") || tag !== `v${version}`) {
    errors.push("Release tag must equal v followed by the package version.");
  }
  if (config.version !== version || cargoVersion !== version) errors.push("Package, Cargo, and Tauri versions must match.");
  if (!hasLocks) errors.push("Commit the selected frontend lockfile and src-tauri/Cargo.lock before releasing.");
  if (config.bundle?.createUpdaterArtifacts !== true) errors.push("Enable bundle.createUpdaterArtifacts for signed updates.");
  if (typeof config.plugins?.updater?.pubkey !== "string" || !config.plugins.updater.pubkey.trim()) errors.push("Configure the updater public key.");
  const endpoints = config.plugins?.updater?.endpoints;
  if (!Array.isArray(endpoints) || endpoints.length === 0 || endpoints.some((endpoint) => {
    try { return new URL(endpoint).protocol !== "https:"; } catch { return true; }
  })) errors.push("Configure at least one HTTPS updater endpoint.");
  if (!environment.TAURI_SIGNING_PRIVATE_KEY?.trim()) errors.push("Configure the TAURI_SIGNING_PRIVATE_KEY repository secret.");
  if (auth !== "none") {
    const name = auth === "github" ? "GITHUB_CLIENT_ID" : "GOOGLE_CLIENT_ID";
    const id = environment[name]?.trim() ?? "";
    if (!/^[A-Za-z0-9._-]+$/.test(id) || /^your_/i.test(id) || /placeholder/i.test(id)) errors.push(`Configure the public ${name} repository variable for installed-app sign-in.`);
  }
  const required = platform === "macos" ? ["APPLE_CERTIFICATE", "APPLE_CERTIFICATE_PASSWORD", "APPLE_SIGNING_IDENTITY", "APPLE_ID", "APPLE_PASSWORD", "APPLE_TEAM_ID"]
    : platform === "windows" ? ["WINDOWS_CERTIFICATE", "WINDOWS_CERTIFICATE_PASSWORD"] : [];
  for (const name of required) if (!environment[name]?.trim()) errors.push(`Configure the ${name} repository secret.`);
  return errors;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  const config = JSON.parse(readFileSync("src-tauri/tauri.conf.json", "utf8"));
  const cargo = readFileSync("src-tauri/Cargo.toml", "utf8");
  const lockfiles = { npm: ["package-lock.json"], pnpm: ["pnpm-lock.yaml"], yarn: ["yarn.lock"], bun: ["bun.lock", "bun.lockb"] };
  const errors = validateRelease({
    tag: process.env.RELEASE_TAG,
    version: packageJson.version,
    cargoVersion: cargo.match(/^version\s*=\s*"([^"]+)"/m)?.[1],
    config,
    platform: process.env.RELEASE_PLATFORM,
    environment: process.env,
    auth: "{{AUTH_MODULE}}",
    hasLocks: existsSync("src-tauri/Cargo.lock") && lockfiles["{{PACKAGE_MANAGER}}"].some(existsSync),
  });
  if (errors.length) {
    for (const error of errors) process.stderr.write(`${error}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Release ${process.env.RELEASE_TAG} prerequisites verified.\n`);
  }
}
