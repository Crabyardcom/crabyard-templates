import * as React from "react";
import { cn } from "@/lib/utils";

function Switch({
  className,
  checked,
  onCheckedChange,
  size: _size,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  size?: "sm" | "default";
  onCheckedChange?: (checked: boolean) => void;
}) {
  const sizeClasses = _size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const thumbSize = _size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const thumbOffset = checked
    ? _size === "sm" ? 18 : 24
    : 4;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={props.disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 ease-in-out hover:brightness-[0.97] dark:hover:brightness-105",
        sizeClasses,
        checked ? "bg-primary" : "bg-toggle-off",
        props.disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span
        className={cn(
          "toggle-thumb pointer-events-none absolute left-0 top-1/2 rounded-full bg-toggle-thumb shadow-sm ring-0",
          thumbSize
        )}
        style={{
          transform: `translate(${thumbOffset}px, -50%)`,
        }}
      />
      <input type="checkbox" className="sr-only" checked={checked} readOnly {...props} />
    </button>
  );
}

export { Switch };
