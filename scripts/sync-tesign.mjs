#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, relative, dirname } from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OVERLAY_DIR = resolve(__dirname, "..", "ui", "tesign");
const SYNC_STATE_PATH = resolve(OVERLAY_DIR, ".sync-state.json");

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = { tesignPath: null, update: false, diff: false, help: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--tesign" && args[i + 1]) {
      flags.tesignPath = resolve(args[++i]);
    } else if (args[i] === "--update") {
      flags.update = true;
    } else if (args[i] === "--diff") {
      flags.diff = true;
    } else if (args[i] === "--help" || args[i] === "-h") {
      flags.help = true;
    }
  }

  return flags;
}

function printHelp() {
  console.log(`
  sync-tesign — Detect changes in the tesign library that affect the crabyard overlay

  Usage:
    node scripts/sync-tesign.mjs --tesign <path-to-tesign-repo>

  Flags:
    --tesign <path>   Path to the tesign repository root (required)
    --diff            Show git-style diff for changed files
    --update          Update .sync-state.json hashes after review
    -h, --help        Show this help

  Component sync modes:
    adapted  — Overlay adapts the tesign component API (variant renames, prop subset).
               Review the diff and manually apply relevant styling changes.
    manual   — Completely different API (e.g., dialog vs modal).
               Only flagged when the tesign source changes.
    theme    — CSS variables and animations. Review and merge token changes.

  Overlay-only components (tooltip, avatar, scroll-area, TitleBar) have no
  tesign source and are never flagged.
`);
}

function loadSyncState() {
  if (!existsSync(SYNC_STATE_PATH)) {
    console.error("  ✗ .sync-state.json not found at", SYNC_STATE_PATH);
    process.exit(1);
  }
  return JSON.parse(readFileSync(SYNC_STATE_PATH, "utf-8"));
}

function checkChanges(tesignRoot, state) {
  const results = [];

  for (const [name, entry] of Object.entries(state.mapping)) {
    const srcPath = resolve(tesignRoot, entry.tesignSource);
    if (!existsSync(srcPath)) {
      results.push({ name, status: "missing", entry, srcPath });
      continue;
    }

    const content = readFileSync(srcPath, "utf-8");
    const currentHash = sha256(content);

    if (currentHash === entry.sha256) {
      results.push({ name, status: "unchanged", entry, srcPath, currentHash });
    } else {
      results.push({ name, status: "changed", entry, srcPath, currentHash, content });
    }
  }

  return results;
}

function showDiff(tesignRoot, srcPath) {
  const rel = relative(tesignRoot, srcPath);
  try {
    const diff = execSync(`git diff HEAD -- "${rel}"`, {
      cwd: tesignRoot,
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    if (diff.trim()) {
      console.log(diff);
    } else {
      console.log("    (no uncommitted changes — diff is vs. last sync hash)");
    }
  } catch {
    console.log("    (git diff not available)");
  }
}

function run() {
  const flags = parseArgs();

  if (flags.help) {
    printHelp();
    return;
  }

  if (!flags.tesignPath) {
    console.error("  ✗ --tesign <path> is required");
    printHelp();
    process.exit(1);
  }

  if (!existsSync(flags.tesignPath)) {
    console.error(`  ✗ tesign path does not exist: ${flags.tesignPath}`);
    process.exit(1);
  }

  const state = loadSyncState();
  const results = checkChanges(flags.tesignPath, state);

  const changed = results.filter((r) => r.status === "changed");
  const missing = results.filter((r) => r.status === "missing");
  const unchanged = results.filter((r) => r.status === "unchanged");

  console.log();
  console.log("  tesign → crabyard overlay sync check");
  console.log("  ─────────────────────────────────────");
  console.log();

  if (missing.length > 0) {
    for (const r of missing) {
      console.log(`  ⚠  ${r.name.padEnd(16)} MISSING  ${r.srcPath}`);
    }
    console.log();
  }

  if (changed.length === 0) {
    console.log("  ✓  All mapped components are in sync.");
    console.log(`     (${unchanged.length} components checked)`);
    console.log();
    return;
  }

  for (const r of changed) {
    const mode = r.entry.syncMode.toUpperCase();
    const overlayFile = r.entry.overlayTarget;
    console.log(`  ~  ${r.name.padEnd(16)} CHANGED  [${mode}]`);
    console.log(`     tesign:  ${r.entry.tesignSource}`);
    console.log(`     overlay: ${overlayFile}`);

    if (r.entry.syncMode === "adapted") {
      console.log("     → Review styling changes and apply to the overlay adapter.");
    } else if (r.entry.syncMode === "manual") {
      console.log("     → API differs significantly. Review and manually adapt overlay.");
    } else if (r.entry.syncMode === "theme") {
      console.log("     → Check for new/changed CSS variables and animations.");
    }

    if (flags.diff) {
      console.log();
      showDiff(flags.tesignPath, r.srcPath);
    }

    console.log();
  }

  console.log(`  ${unchanged.length} unchanged, ${changed.length} changed, ${missing.length} missing`);
  console.log();

  if (flags.update) {
    for (const r of changed) {
      state.mapping[r.name].sha256 = r.currentHash;
    }
    state.lastSync = new Date().toISOString();
    writeFileSync(SYNC_STATE_PATH, JSON.stringify(state, null, 2) + "\n");
    console.log("  ✓  .sync-state.json updated with new hashes.");
    console.log();
  } else if (changed.length > 0) {
    console.log("  Run with --update to mark these as synced after applying changes.");
    console.log();
  }
}

run();
