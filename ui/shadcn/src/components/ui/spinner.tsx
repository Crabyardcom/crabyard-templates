import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "size-5 animate-spin rounded-full border-2 border-muted border-t-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
