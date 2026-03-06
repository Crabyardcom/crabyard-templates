import * as React from "react";
import { cn } from "@/lib/utils";

const variantClass: Record<string, string> = {
  default: "badge-primary",
  secondary: "badge-secondary",
  destructive: "badge-error",
  outline: "badge-outline",
  ghost: "badge-ghost",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantClass;
  asChild?: boolean;
}

function Badge({ className, variant = "default", asChild: _asChild, ...props }: BadgeProps) {
  return (
    <span
      className={cn("badge", variantClass[variant], className)}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps };
