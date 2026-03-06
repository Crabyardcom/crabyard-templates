import * as React from "react";
import { cn } from "@/lib/utils";

function Switch({
  className,
  size: _size,
  checked,
  onCheckedChange,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  size?: "sm" | "default";
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      className={cn("toggle toggle-primary", className)}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  );
}

export { Switch };
