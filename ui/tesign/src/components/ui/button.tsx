import * as React from "react";
import { cn } from "@/lib/utils";

const variantClass: Record<string, string> = {
  default:
    "bg-primary text-primary-foreground hover:brightness-150 active:brightness-165",
  destructive:
    "bg-destructive text-destructive-foreground hover:brightness-110 active:brightness-115",
  outline:
    "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
  secondary:
    "bg-secondary text-secondary-foreground",
  ghost:
    "text-muted-foreground hover:bg-muted hover:text-foreground hover:brightness-[0.97] dark:hover:brightness-105 active:bg-muted/80",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClass: Record<string, string> = {
  default: "h-9 px-4 py-2 text-sm gap-2",
  xs: "h-6 px-2 text-xs gap-1",
  sm: "h-8 px-3 text-sm gap-1.5",
  lg: "h-11 px-6 text-base gap-2",
  icon: "size-9",
  "icon-xs": "size-6",
  "icon-sm": "size-8",
  "icon-lg": "size-10",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClass;
  size?: keyof typeof sizeClass;
  asChild?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild: _asChild,
  ...props
}: ButtonProps) {
  return (
    <button
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap transition-all duration-200 origin-center hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        variantClass[variant],
        sizeClass[size],
        className
      )}
      {...props}
    />
  );
}

export { Button };
export type { ButtonProps };
