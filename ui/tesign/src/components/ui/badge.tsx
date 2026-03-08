import * as React from "react";
import { cn } from "@/lib/utils";

const variantClass: Record<string, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-border text-foreground",
  ghost: "text-muted-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantClass;
  asChild?: boolean;
}

function Badge({ className, variant = "default", asChild: _asChild, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap transition-[color,box-shadow] [&>svg]:pointer-events-none [&>svg]:size-3",
        variantClass[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
export type { BadgeProps };
