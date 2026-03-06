export function DashboardView() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome
        </h1>
        <p className="text-sm text-muted-foreground">
          Your app is running. Start building here.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-muted-foreground">
          Edit{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
            src/components/DashboardView.tsx
          </code>{" "}
          to get started.
        </p>
      </div>
    </div>
  );
}
