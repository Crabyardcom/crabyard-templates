import * as React from "react";
import { cn } from "@/lib/utils";

function ScrollArea({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("overflow-auto", className)} {...props}>
      {children}
    </div>
  );
}

function ScrollBar(_props: { orientation?: "vertical" | "horizontal"; className?: string }) {
  return null;
}

export { ScrollArea, ScrollBar };
