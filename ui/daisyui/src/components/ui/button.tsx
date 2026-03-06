import * as React from "react";
import { cn } from "@/lib/utils";

const variantClass: Record<string, string> = {
  default: "btn-primary",
  destructive: "btn-error",
  outline: "btn-outline",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  link: "btn-link",
};

const sizeClass: Record<string, string> = {
  default: "",
  xs: "btn-xs",
  sm: "btn-sm",
  lg: "btn-lg",
  icon: "btn-square",
  "icon-xs": "btn-square btn-xs",
  "icon-sm": "btn-square btn-sm",
  "icon-lg": "btn-square btn-lg",
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
      className={cn("btn", variantClass[variant], sizeClass[size], className)}
      {...props}
    />
  );
}

export { Button };
export type { ButtonProps };
