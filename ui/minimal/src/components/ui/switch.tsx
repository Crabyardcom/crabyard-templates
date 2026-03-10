import * as React from "react";
import { cn } from "@/lib/utils";

function Switch({
  className,
  checked,
  onCheckedChange,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  size?: "sm" | "default";
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={props.disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary" : "bg-input",
        props.disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
      <input type="checkbox" className="sr-only" checked={checked} readOnly {...props} />
    </button>
  );
}

export { Switch };
