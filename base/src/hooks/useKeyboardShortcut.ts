import { useEffect, useRef } from "react";

type Modifier = "ctrl" | "shift" | "alt" | "meta";

interface ShortcutOptions {
  key: string;
  modifiers?: Modifier[];
  handler: (e: KeyboardEvent) => void;
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcut({
  key,
  modifiers = [],
  handler,
  enabled = true,
  preventDefault = true,
}: ShortcutOptions) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== key.toLowerCase()) return;
      const primary = modifiers.includes("ctrl");
      const meta = modifiers.includes("meta");
      if (primary ? !e.ctrlKey && !e.metaKey : e.ctrlKey) return;
      if (modifiers.includes("shift") !== e.shiftKey) return;
      if (modifiers.includes("alt") !== e.altKey) return;
      if (meta ? !e.metaKey : !primary && e.metaKey) return;

      if (preventDefault) e.preventDefault();
      handlerRef.current(e);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, modifiers, enabled, preventDefault]);
}
