import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({
  className,
  size: _size,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "default" | "sm" | "lg" }) {
  return (
    <div
      className={cn("avatar", className)}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  src,
  alt,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <div className="w-8 rounded-full">
      <img
        src={src}
        alt={alt}
        className={cn("rounded-full", className)}
        {...props}
      />
    </div>
  );
}

function AvatarFallback({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-neutral text-sm text-neutral-content",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function AvatarBadge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-success ring-2 ring-base-100",
        className
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("avatar-group -space-x-4", className)} {...props} />;
}

function AvatarGroupCount({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("avatar placeholder", className)} {...props} />
  );
}

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount };
