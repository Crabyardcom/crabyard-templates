import * as React from "react";
import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}) {
  return (
    <div
      role="separator"
      className={cn(
        "divider",
        orientation === "vertical" ? "divider-horizontal" : "",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
