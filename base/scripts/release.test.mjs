import assert from "node:assert/strict";
import test from "node:test";
import { validateRelease } from "./release.mjs";

const ready = {
  tag: "v1.2.3", version: "1.2.3", cargoVersion: "1.2.3", platform: "linux", hasLocks: true,
  config: { version: "1.2.3", bundle: { createUpdaterArtifacts: true }, plugins: { updater: { pubkey: "public-test-key", endpoints: ["https://example.com/latest.json"] } } },
  environment: { TAURI_SIGNING_PRIVATE_KEY: "private-test-key" },
};

test("a configured signed release passes preflight", () => {
  assert.deepEqual(validateRelease(ready), []);
});

test("missing signing credentials and lockfiles block release without printing secret values", () => {
  const errors = validateRelease({ ...ready, environment: {}, hasLocks: false });
  assert.ok(errors.some((error) => error.includes("TAURI_SIGNING_PRIVATE_KEY")));
  assert.ok(errors.some((error) => error.includes("lockfile")));
  assert.ok(!errors.join().includes("private-test-key"));
});

test("version drift and insecure updater endpoints block release", () => {
  const config = { ...ready.config, version: "1.0.0", plugins: { updater: { pubkey: "key", endpoints: ["http://example.com/latest.json"] } } };
  const errors = validateRelease({ ...ready, tag: "invalid", config });
  assert.ok(errors.some((error) => error.includes("tag")));
  assert.ok(errors.some((error) => error.includes("versions")));
  assert.ok(errors.some((error) => error.includes("HTTPS")));
});

test("native installer signing is required on Windows and macOS", () => {
  assert.ok(validateRelease({ ...ready, platform: "windows" }).some((error) => error.includes("WINDOWS_CERTIFICATE")));
  assert.ok(validateRelease({ ...ready, platform: "macos" }).some((error) => error.includes("APPLE_CERTIFICATE")));
});

test("authenticated releases require a real public client ID", () => {
  for (const id of ["", "your_github_client_id_here", "placeholder", "invalid\nvalue"]) {
    assert.ok(validateRelease({ ...ready, auth: "github", environment: { ...ready.environment, GITHUB_CLIENT_ID: id } }).some((error) => error.includes("GITHUB_CLIENT_ID")));
  }
  assert.deepEqual(validateRelease({ ...ready, auth: "google", environment: { ...ready.environment, GOOGLE_CLIENT_ID: "123.apps.googleusercontent.com" } }), []);
});
