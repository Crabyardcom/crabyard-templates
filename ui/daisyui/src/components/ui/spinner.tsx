import { cn } from "@/lib/utils";

function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <span className={cn("loading loading-spinner loading-md", className)} {...props} />
  );
}

export { Spinner };
