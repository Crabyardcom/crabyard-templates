import * as React from "react";
import { cn } from "@/lib/utils";

function TooltipProvider({ children }: { children: React.ReactNode; delayDuration?: number }) {
  return <>{children}</>;
}

function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function TooltipTrigger({
  className,
  asChild: _asChild,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  return <div className={className} {...props} />;
}

function TooltipContent({
  className,
  children,
  sideOffset: _sideOffset,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { sideOffset?: number; side?: string }) {
  return (
    <div
      className={cn(
        "tooltip-text rounded bg-neutral px-2 py-1 text-xs text-neutral-content shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
