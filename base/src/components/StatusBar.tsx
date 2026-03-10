interface StatusBarProps {
  items?: Array<{ label: string; value?: string; onClick?: () => void }>;
  className?: string;
}

export function StatusBar({ items = [], className = "" }: StatusBarProps) {
  return (
    <div
      className={`flex h-6 items-center gap-4 border-t border-border bg-muted/50 px-3 text-xs text-muted-foreground ${className}`}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={item.onClick}
          disabled={!item.onClick}
          className="flex items-center gap-1 truncate hover:text-foreground disabled:pointer-events-none"
        >
          <span>{item.label}</span>
          {item.value && <span className="font-medium">{item.value}</span>}
        </button>
      ))}
    </div>
  );
}
