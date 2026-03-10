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
      className={cn("rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
