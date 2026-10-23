import { fireEvent, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

describe("desktop keyboard shortcuts", () => {
  it("accepts Control on Windows and Command on macOS for a primary shortcut", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: "k", modifiers: ["ctrl"], handler }));
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("ignores missing and unexpected modifiers", () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut({ key: "k", modifiers: ["ctrl"], handler }));
    fireEvent.keyDown(window, { key: "k" });
    fireEvent.keyDown(window, { key: "k", ctrlKey: true, shiftKey: true });
    expect(handler).not.toHaveBeenCalled();
  });

  it("removes its event listener on unmount", () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcut({ key: "k", handler }));
    unmount();
    fireEvent.keyDown(window, { key: "k" });
    expect(handler).not.toHaveBeenCalled();
  });
});
