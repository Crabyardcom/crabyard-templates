import * as React from "react";
import { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const MenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({ open: false, setOpen: () => {} });

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <MenuContext.Provider value={{ open, setOpen }}>
      <div className="dropdown">{children}</div>
    </MenuContext.Provider>
  );
}

function DropdownMenuTrigger({
  children,
  asChild: _asChild,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { setOpen, open } = React.useContext(MenuContext);
  return (
    <button
      tabIndex={0}
      className={className}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  className,
  children,
  align: _align,
  sideOffset: _sideOffset,
  ...props
}: React.HTMLAttributes<HTMLUListElement> & { align?: string; sideOffset?: number }) {
  const { open, setOpen } = React.useContext(MenuContext);
  const ref = useRef<HTMLUListElement>(null);

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    },
    [setOpen]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open, handleClickOutside]);

  if (!open) return null;

  return (
    <ul
      ref={ref}
      tabIndex={0}
      className={cn(
        "menu dropdown-content z-50 rounded-box bg-base-200 p-2 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </ul>
  );
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuItem({
  className,
  inset: _inset,
  variant: _variant,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement> & { inset?: boolean; variant?: string }) {
  const { setOpen } = React.useContext(MenuContext);
  return (
    <li>
      <a
        className={cn("text-sm", className)}
        onClick={(e) => {
          (props as React.HTMLAttributes<HTMLLIElement>).onClick?.(e as unknown as React.MouseEvent<HTMLLIElement>);
          setOpen(false);
        }}
      >
        {props.children}
      </a>
    </li>
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement> & { checked?: boolean }) {
  return (
    <li>
      <a className={cn("text-sm", checked && "active", className)} {...(props as React.HTMLAttributes<HTMLElement>)}>
        {children}
      </a>
    </li>
  );
}

function DropdownMenuRadioGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) {
  return (
    <li>
      <a className={cn("text-sm", className)} {...(props as React.HTMLAttributes<HTMLElement>)}>
        {children}
      </a>
    </li>
  );
}

function DropdownMenuLabel({
  className,
  inset: _inset,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return (
    <li className="menu-title">
      <span className={cn("text-xs font-semibold", className)} {...props} />
    </li>
  );
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <li><hr className={cn("my-1 border-base-content/10", className)} {...props} /></li>;
}

function DropdownMenuShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("ml-auto text-xs text-base-content/40", className)} {...props} />;
}

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>;
}

function DropdownMenuSubTrigger({
  className,
  children,
  inset: _inset,
  ...props
}: React.HTMLAttributes<HTMLElement> & { inset?: boolean }) {
  return (
    <details>
      <summary className={cn("text-sm", className)} {...props}>
        {children}
      </summary>
    </details>
  );
}

function DropdownMenuSubContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className={cn("menu rounded-box bg-base-200 p-2", className)} {...props}>
      {children}
    </ul>
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
