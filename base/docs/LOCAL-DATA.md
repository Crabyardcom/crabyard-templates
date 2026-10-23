# Local-first data

`src-tauri/src/commands/documents.rs` stores named JSON documents in `documents.json` under the OS application data directory. It adds no database dependency and does not require frontend filesystem permissions.

```ts
import { getLocalDocument, putLocalDocument } from "@/lib/tauri";

const current = await getLocalDocument("projects");
const saved = await putLocalDocument("projects", current?.revision ?? null, {
  items: [{ name: "My project" }],
});
```

Pass `null` only to create a missing document. Updates and deletes require the loaded revision; a stale revision fails without overwriting newer data. A deleted document's revision is never reused. On conflict, reload the document and let the user retry or reconcile changes.

Writes are serialized within one app process, flushed to a temporary file in the same directory, and renamed into place. A failed write preserves the previous document. Corrupt or unsupported data files return errors instead of silently resetting user data. The storage envelope is versioned; add an explicit migration when changing its format. Validate product-specific JSON fields at the domain boundary.

Names allow 1–64 ASCII letters, digits, underscores, or hyphens. Each document is limited to 1 MiB; the store is limited to 1,024 documents and 64 MiB. Use the SQLite extra for relational queries, larger datasets, or multi-process transactions. This foundation does not provide cloud sync, backups, encryption, or cross-process locking. OAuth tokens belong in the OS vault, never in these documents.

Regression tests cover restart persistence, deletion, stale writes, deletion/recreation conflicts, path-like names, size limits, damaged/newer files, and failed disk writes.
