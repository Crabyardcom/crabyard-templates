import { invoke } from "@tauri-apps/api/core";
import { describe, expect, it, vi } from "vitest";
import { deleteLocalDocument, getLocalDocument, putLocalDocument } from "@/lib/tauri";

describe("local document IPC", () => {
  it("returns null when a document has not been created", async () => {
    vi.mocked(invoke).mockResolvedValueOnce(null);
    await expect(getLocalDocument("projects")).resolves.toBeNull();
    expect(invoke).toHaveBeenCalledWith("get_local_document", { name: "projects" });
  });

  it("sends the loaded revision and JSON data when saving", async () => {
    await putLocalDocument("projects", 3, { items: ["first"] });
    expect(invoke).toHaveBeenCalledWith("put_local_document", { name: "projects", expectedRevision: 3, data: { items: ["first"] } });
  });

  it("propagates stale revision failures instead of reporting deletion success", async () => {
    vi.mocked(invoke).mockRejectedValueOnce("Document changed or was removed");
    await expect(deleteLocalDocument("projects", 1)).rejects.toBe("Document changed or was removed");
  });
});
